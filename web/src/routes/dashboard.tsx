import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const navigate = useNavigate()
  const [surveys, setSurveys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const res = await fetch('http://localhost:8787/api/surveys', {
          credentials: 'include',
        })
        if (res.status === 401) {
          navigate({ to: '/' })
          return
        }
        if (res.ok) {
          const data = await res.json()
          setSurveys(data.surveys || [])
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchSurveys()
  }, [navigate])

  const createSurvey = async () => {
    const title = prompt('Enter a title for your new survey:')
    if (!title) return

    try {
      const res = await fetch('http://localhost:8787/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title }),
      })
      if (res.ok) {
        const data = await res.json()
        navigate({ to: '/builder/$id', params: { id: data.id } })
      }
    } catch (_error) {
      alert('Failed to create survey')
    }
  }

  return (
    <div style={{ padding: '3rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '3rem',
        }}
      >
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827' }}>My Workspace</h1>
        <button
          onClick={createSurvey}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'background-color 0.2s',
          }}
        >
          + Create New Survey
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#6b7280' }}>Loading surveys...</p>
      ) : surveys.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '5rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            border: '2px dashed #d1d5db',
          }}
        >
          <p style={{ color: '#6b7280', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
            You don't have any surveys yet.
          </p>
          <button
            onClick={createSurvey}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              color: '#374151',
            }}
          >
            Create your first survey
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {surveys.map((survey) => (
            <div
              key={survey.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                backgroundColor: 'white',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#111827' }}>
                  {survey.title}
                </h3>
                <span
                  style={{
                    fontSize: '0.85rem',
                    color: '#6b7280',
                    backgroundColor: '#f3f4f6',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '1rem',
                  }}
                >
                  {survey.slug ? `Public Link: /s/${survey.slug.slice(0, 10)}...` : 'Draft'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <Link
                  to="/builder/$id"
                  params={{ id: survey.id }}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '0.6rem',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    textDecoration: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                  }}
                >
                  ✏️ Edit Survey
                </Link>
                <Link
                  to="/analytics/$id"
                  params={{ id: survey.id }}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '0.6rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                  }}
                >
                  📊 View Results
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
