import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/analytics/$id')({
  component: AnalyticsDashboard,
})

function AnalyticsDashboard() {
  const { id } = Route.useParams()
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const res = await fetch(`http://localhost:8787/api/surveys/${id}/responses`, {
          credentials: 'include',
        })
        if (res.ok) {
          const data = await res.json()
          setResponses(data.results || [])
        }
      } catch (error) {
        console.error('Failed to load responses', error)
      } finally {
        setLoading(false)
      }
    }
    fetchResponses()
  }, [id])

  // Group responses by responseId so we can show them as individual cohesive submissions
  const groupedResponses = responses.reduce((acc: any, curr: any) => {
    if (!acc[curr.responseId]) {
      acc[curr.responseId] = {
        date: new Date(curr.submitted_at).toLocaleString(),
        answers: [],
      }
    }
    acc[curr.responseId].answers.push(curr)
    return acc
  }, {})

  const submissions = Object.values(groupedResponses)

  return (
    <div style={{ padding: '3rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>Survey Responses</h1>
        <Link
          to="/dashboard"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#e5e7eb',
            color: '#374151',
            textDecoration: 'none',
            borderRadius: '0.25rem',
            fontWeight: 'bold',
          }}
        >
          ← Back to Dashboard
        </Link>
      </div>

      {loading ? (
        <p style={{ color: '#6b7280' }}>Loading responses...</p>
      ) : submissions.length === 0 ? (
        <div
          style={{
            padding: '4rem',
            textAlign: 'center',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            border: '2px dashed #d1d5db',
          }}
        >
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
            No responses yet. Share your survey link to get some!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <p style={{ fontSize: '1.1rem', color: '#4b5563', fontWeight: 'bold' }}>
            Total Submissions: {submissions.length}
          </p>

          {submissions.map((sub: any, index: number) => (
            <div
              key={index}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '2rem',
                backgroundColor: 'white',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div
                style={{
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.9rem',
                    color: '#6b7280',
                    fontWeight: 'bold',
                    letterSpacing: '0.05em',
                  }}
                >
                  SUBMISSION {submissions.length - index}
                </span>
                <span style={{ float: 'right', fontSize: '0.9rem', color: '#9ca3af' }}>
                  {sub.date}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {sub.answers.map((ans: any, i: number) => (
                  <div key={i}>
                    <p
                      style={{
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        color: '#374151',
                        margin: '0 0 0.5rem 0',
                      }}
                    >
                      {ans.label}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        color: '#111827',
                        backgroundColor: '#f3f4f6',
                        padding: '1rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      {ans.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
