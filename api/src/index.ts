import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors({
  origin: 'http://localhost:5173',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}))

app.get('/api/health', (c) => c.json({ status: 'ok' }))

app.get('/api/test-db', async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM users").all()
    return c.json({ success: true, message: "Database layer active!", data: results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})


app.post('/api/auth/login', async (c) => {
  try {
    const { email } = await c.req.json()
    if (!email || !email.includes('@')) {
      return c.json({ success: false, error: 'Invalid email address provided.' }, 400)
    }

    let user: any = await c.env.DB.prepare("SELECT * FROM users WHERE email = ?")
      .bind(email.toLowerCase().trim())
      .first()

    if (!user) {
      const newUserId = crypto.randomUUID()
      await c.env.DB.prepare("INSERT INTO users (id, email) VALUES (?, ?)")
        .bind(newUserId, email.toLowerCase().trim())
        .run()
      
      user = { id: newUserId, email: email.toLowerCase().trim() }
    }

    return c.json({
      success: true,
      message: 'Authentication successful',
      token: user.id, 
      user: { id: user.id, email: user.email }
    })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})


app.post('/api/surveys', async (c) => {
  try {
    const token = c.req.header('Authorization')
    if (!token) {
      return c.json({ success: false, error: 'Unauthorized. Missing user token.' }, 401)
    }

    const { title, primary_color, logo_url } = await c.req.json()
    if (!title) {
      return c.json({ success: false, error: 'Survey title is required.' }, 400)
    }

    const surveyId = crypto.randomUUID()
    
    await c.env.DB.prepare(
      "INSERT INTO surveys (id, user_id, title, primary_color, logo_url) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(surveyId, token, title, primary_color || '#000000', logo_url || null)
    .run()

    return c.json({
      success: true,
      message: 'Survey created successfully!',
      surveyId
    })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})


app.get('/api/surveys', async (c) => {
  try {
    const token = c.req.header('Authorization')
    if (!token) {
      return c.json({ success: false, error: 'Unauthorized.' }, 401)
    }

    const { results } = await c.env.DB.prepare(
      "SELECT * FROM surveys WHERE user_id = ? ORDER BY created_at DESC"
    )
    .bind(token)
    .all()

    return c.json({
      success: true,
      surveys: results
    })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})


app.post('/api/surveys/:id/questions', async (c) => {
  try {
    const token = c.req.header('Authorization')
    if (!token) {
      return c.json({ success: false, error: 'Unauthorized.' }, 401)
    }

    const surveyId = c.req.param('id')
    const { questions } = await c.req.json() 

    if (!Array.isArray(questions)) {
      return c.json({ success: false, error: 'Questions must be an array.' }, 400)
    }

    await c.env.DB.prepare("DELETE FROM questions WHERE survey_id = ?")
      .bind(surveyId)
      .run()

    if (questions.length > 0) {
      const statements = questions.map((q: any, index: number) => {
        return c.env.DB.prepare(
          "INSERT INTO questions (id, survey_id, type, question_text, options, order_index) VALUES (?, ?, ?, ?, ?, ?)"
        ).bind(
          crypto.randomUUID(),
          surveyId,
          q.type,
          q.question_text,
          q.options ? JSON.stringify(q.options) : null, 
          index
        )
      })

      await c.env.DB.batch(statements)
    }

    return c.json({ success: true, message: 'Questions saved successfully!' })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})


app.post('/api/public/surveys/:id/responses', async (c) => {
  try {
    const surveyId = c.req.param('id')
    const { answers } = await c.req.json() 

    if (!answers || typeof answers !== 'object') {
      return c.json({ success: false, error: 'Answers payload must be an object.' }, 400)
    }

    const responseId = crypto.randomUUID()

    await c.env.DB.prepare(
      "INSERT INTO responses (id, survey_id, answers) VALUES (?, ?, ?)"
    )
    .bind(responseId, surveyId, JSON.stringify(answers))
    .run()

    return c.json({ success: true, message: 'Response submitted successfully!' })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})
export default app