import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/s/$slug')({
  component: PublicSurveyPage,
})

function PublicSurveyPage() {
  const { slug } = Route.useParams()
  const [survey, setSurvey] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'loading' | 'ready' | 'submitting' | 'success' | 'error'>(
    'loading',
  )

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const response = await fetch(`http://localhost:8787/api/public/surveys/${slug}`)
        if (!response.ok) throw new Error('Survey not found')

        const data = await response.json()
        setSurvey(data.survey)
        setQuestions(data.questions || [])
        setStatus('ready')
      } catch (_error) {
        setStatus('error')
      }
    }
    fetchSurvey()
  }, [slug])

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')

    // The backend expects an array of { questionId, value } objects
    const formattedAnswers = Object.keys(answers).map((qId) => ({
      questionId: qId,
      value: answers[qId],
    }))

    try {
      const response = await fetch(`http://localhost:8787/api/public/surveys/${slug}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedAnswers),
      })

      if (response.ok) {
        setStatus('success')
      } else {
        alert('❌ Failed to submit response. Please try again.')
        setStatus('ready')
      }
    } catch (_error) {
      alert('❌ Network error while submitting.')
      setStatus('ready')
    }
  }

  if (status === 'loading') {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f3f4f6',
          color: '#6b7280',
        }}
      >
        Loading survey...
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f3f4f6',
          color: '#ef4444',
          fontWeight: 'bold',
        }}
      >
        Survey not found or invalid link.
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f3f4f6',
          fontFamily: 'system-ui',
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            padding: '4rem 3rem',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            textAlign: 'center',
            maxWidth: '500px',
          }}
        >
          <h2
            style={{
              color: survey.brand_color || '#10b981',
              fontSize: '2.5rem',
              marginBottom: '1rem',
              fontWeight: 'bold',
            }}
          >
            Thank You!
          </h2>
          <p style={{ color: '#4b5563', fontSize: '1.1rem' }}>
            Your response to <strong style={{ color: '#111827' }}>{survey.title}</strong> has been
            successfully recorded.
          </p>
        </div>
      </div>
    )
  }

  const brandColor = survey?.brand_color || '#4F46E5'

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        padding: '3rem 1rem',
        display: 'flex',
        justifyContent: 'center',
        fontFamily: 'system-ui',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '650px',
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          height: 'fit-content',
        }}
      >
        {/* Dynamic Logo */}
        {survey.logo_url && (
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
            <img
              src={survey.logo_url}
              alt="Brand Logo"
              style={{ maxHeight: '70px', maxWidth: '250px', objectFit: 'contain' }}
              onError={(e) => {
                ;(e.target as HTMLElement).style.display = 'none'
              }}
            />
          </div>
        )}

        {/* Dynamic Title */}
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '2.5rem',
            borderBottom: `4px solid ${brandColor}`,
            paddingBottom: '1.5rem',
            color: '#111827',
            textAlign: 'center',
          }}
        >
          {survey.title}
        </h1>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}
        >
          {questions.length === 0 && (
            <p style={{ textAlign: 'center', color: '#6b7280' }}>
              This survey has no questions yet.
            </p>
          )}

          {questions.map((q, index) => (
            <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ fontWeight: '600', color: '#111827', fontSize: '1.15rem' }}>
                {index + 1}. {q.label} <span style={{ color: '#ef4444' }}>*</span>
              </label>

              {/* DYNAMIC INPUT RENDERING */}
              {q.type === 'textarea' ? (
                <textarea
                  required
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder="Type your answer here..."
                  style={{
                    padding: '1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    resize: 'vertical',
                    minHeight: '120px',
                    fontSize: '1rem',
                    outlineColor: brandColor,
                  }}
                />
              ) : q.type === 'rating' ? (
                <div style={{ display: 'flex', gap: '2rem', padding: '0.5rem 0' }}>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <label
                      key={num}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '1.1rem',
                        color: '#4b5563',
                      }}
                    >
                      <input
                        type="radio"
                        name={`rating-${q.id}`}
                        value={num.toString()}
                        required
                        checked={answers[q.id] === num.toString()}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        style={{ transform: 'scale(1.3)', accentColor: brandColor }}
                      />{' '}
                      {num}
                    </label>
                  ))}
                </div>
              ) : q.type === 'multiple-choice' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Fallback to generic options due to emergency schema bypass */}
                  {['Option 1', 'Option 2', 'Option 3'].map((opt, i) => (
                    <label
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        cursor: 'pointer',
                        fontSize: '1.05rem',
                        color: '#374151',
                      }}
                    >
                      <input
                        type="radio"
                        name={`mc-${q.id}`}
                        value={opt}
                        required
                        checked={answers[q.id] === opt}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        style={{ transform: 'scale(1.3)', accentColor: brandColor }}
                      />{' '}
                      {opt}
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  required
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder="Type your answer here..."
                  style={{
                    padding: '1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    outlineColor: brandColor,
                  }}
                />
              )}
            </div>
          ))}

          {questions.length > 0 && (
            <button
              type="submit"
              disabled={status === 'submitting'}
              style={{
                marginTop: '1rem',
                padding: '1.25rem',
                backgroundColor: brandColor,
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: status === 'submitting' ? 'wait' : 'pointer',
                opacity: status === 'submitting' ? 0.7 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {status === 'submitting' ? 'Submitting Response...' : 'Submit Survey'}
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
