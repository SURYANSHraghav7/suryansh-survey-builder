import { Hono } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database
}

type Variables = {
  user: { id: string; email: string }
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.use(
  '/api/*',
  cors({
    origin: 'http://localhost:5173',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'], // Ensure Content-Type is here
    credentials: true,
  }),
)

app.get('/api/health', (c) => c.json({ status: 'ok' }))

const requireAuth = async (c: any, next: any) => {
  const sid = getCookie(c, 'sid')
  if (!sid) return c.json({ error: 'Unauthorized' }, 401)

  const session = await c.env.DB.prepare(
    'SELECT s.user_id, u.email FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ? AND s.expires_at > ?',
  )
    .bind(sid, Date.now())
    .first()

  if (!session) return c.json({ error: 'Session expired' }, 401)

  c.set('user', { id: session.user_id, email: session.email })
  await next()
}

app.post('/api/auth/login', async (c) => {
  try {
    const { email } = await c.req.json()
    if (!email?.includes('@')) {
      return c.json({ error: 'Valid email required' }, 400)
    }

    const clean = email.toLowerCase().trim()

    let user: any = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?')
      .bind(clean)
      .first()

    if (!user) {
      const id = crypto.randomUUID()
      await c.env.DB.prepare('INSERT INTO users (id, email, created_at) VALUES (?, ?, ?)')
        .bind(id, clean, Date.now())
        .run()
      user = { id, email: clean }
    }

    const sessionId = crypto.randomUUID()
    await c.env.DB.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
      .bind(sessionId, user.id, Date.now() + 7 * 24 * 60 * 60 * 1000)
      .run()

    setCookie(c, 'sid', sessionId, {
      httpOnly: true,
      path: '/',
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    return c.json({ ok: true, user: { id: user.id, email: user.email } })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/api/auth/logout', async (c) => {
  const sid = getCookie(c, 'sid')
  if (sid) {
    await c.env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(sid).run()
  }
  setCookie(c, 'sid', '', { maxAge: 0, path: '/' })
  return c.json({ ok: true })
})

app.get('/api/auth/me', requireAuth, async (c) => {
  return c.json({ user: c.get('user') })
})

app.get('/api/surveys', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM surveys WHERE owner_id = ? ORDER BY created_at DESC',
    )
      .bind(user.id)
      .all()
    return c.json({ surveys: results })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/api/surveys', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    const { title } = await c.req.json()
    if (!title) return c.json({ error: 'Title required' }, 400)

    const id = crypto.randomUUID()
    const slug = `${title.toLowerCase().replace(/\s+/g, '-')}-${id.slice(0, 6)}`

    await c.env.DB.prepare(
      'INSERT INTO surveys (id, owner_id, title, slug, created_at) VALUES (?, ?, ?, ?, ?)',
    )
      .bind(id, user.id, title, slug, Date.now())
      .run()

    return c.json({ ok: true, id, slug })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

app.use('/api/surveys/:id', requireAuth)
app.get('/api/surveys/:id', async (c) => {
  try {
    const survey = await c.env.DB.prepare('SELECT * FROM surveys WHERE id = ?')
      .bind(c.req.param('id'))
      .first()
    if (!survey) return c.json({ error: 'Not found' }, 404)

    const { results: questions } = await c.env.DB.prepare(
      'SELECT * FROM questions WHERE survey_id = ? ORDER BY position',
    )
      .bind(c.req.param('id'))
      .all()

    return c.json({ survey, questions })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

app.put('/api/surveys/:id', requireAuth, async (c) => {
  try {
    const { title, brand_color, logo_url } = await c.req.json()
    await c.env.DB.prepare(
      'UPDATE surveys SET title = ?, brand_color = ?, logo_url = ? WHERE id = ? AND owner_id = ?',
    )
      .bind(title, brand_color, logo_url, c.req.param('id'), c.get('user').id)
      .run()
    return c.json({ ok: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})


app.put('/api/surveys/:id/questions', requireAuth, async (c) => {
  const surveyId = c.req.param('id')

  try {
    const rawText = await c.req.text()
    if (!rawText) return c.json({ ok: true })

    const questions = JSON.parse(rawText)

    await c.env.DB.prepare('DELETE FROM questions WHERE survey_id = ?').bind(surveyId).run()

    if (Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        await c.env.DB.prepare(`
          INSERT INTO questions (id, survey_id, position, type, label) 
          VALUES (?, ?, ?, ?, ?)
        `)
          .bind(q.id || crypto.randomUUID(), surveyId, i, q.type || 'text', q.label || 'Untitled')
          .run()
      }
    }

    return c.json({ ok: true })
  } catch (error: any) {
    console.error('🔥 CRASH CAUSE:', error.message)
    return c.json({ error: error.message }, 500)
  }
})

app.get('/api/public/surveys/:slug', async (c) => {
  try {
    const survey = await c.env.DB.prepare('SELECT * FROM surveys WHERE slug = ?')
      .bind(c.req.param('slug'))
      .first()
    if (!survey) return c.json({ error: 'Not found' }, 404)

    const { results: questions } = await c.env.DB.prepare(
      'SELECT * FROM questions WHERE survey_id = ? ORDER BY position',
    )
      .bind(survey.id)
      .all()

    return c.json({ survey, questions })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/api/public/surveys/:slug/respond', async (c) => {
  try {
    const survey: any = await c.env.DB.prepare('SELECT id FROM surveys WHERE slug = ?')
      .bind(c.req.param('slug'))
      .first()
    if (!survey) return c.json({ error: 'Not found' }, 404)

    const answers: any[] = await c.req.json()
    const responseId = crypto.randomUUID()

    await c.env.DB.prepare('INSERT INTO responses (id, survey_id, submitted_at) VALUES (?, ?, ?)')
      .bind(responseId, survey.id, Date.now())
      .run()

    for (const a of answers) {
      await c.env.DB.prepare(
        'INSERT INTO answers (id, response_id, question_id, value) VALUES (?, ?, ?, ?)',
      )
        .bind(crypto.randomUUID(), responseId, a.questionId, a.value)
        .run()
    }

    return c.json({ ok: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/api/surveys/:id/responses', requireAuth, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT r.id as responseId, r.submitted_at, a.value, q.label, q.type, q.position
      FROM responses r
      JOIN answers a ON a.response_id = r.id
      JOIN questions q ON q.id = a.question_id
      WHERE r.survey_id = ?
      ORDER BY r.submitted_at DESC, q.position
    `)
      .bind(c.req.param('id'))
      .all()
    return c.json({ results })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

export default app
