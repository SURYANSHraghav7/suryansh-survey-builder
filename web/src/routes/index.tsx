import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/')({
  component: LoginView,
})

function LoginView() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatusMessage('Authenticating...')

    try {
      const response = await fetch('http://localhost:8787/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email }),
      })

      const data = await response.json()

      if (response.ok && data.ok) {
        setStatusMessage(`✅ Success! Authenticated as ${data.user.email}`)

        // Redirect to the dashboard after a short delay
        setTimeout(() => {
          navigate({ to: '/dashboard' })
        }, 500)
      } else {
        setStatusMessage(`❌ Error: ${data.error}`)
      }
    } catch (_error) {
      setStatusMessage('❌ Network error. Is the backend running?')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '2.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            color: '#111827',
          }}
        >
          Survey Builder Studio
        </h1>
        <p style={{ color: '#4B5563', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Enter your email to login or create a new account.
        </p>

        <form
          onSubmit={handleLogin}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: '0.75rem',
              borderRadius: '0.25rem',
              border: '1px solid #D1D5DB',
              fontSize: '1rem',
            }}
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '0.75rem',
              backgroundColor: isLoading ? '#9CA3AF' : '#4F46E5',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Connecting...' : 'Continue'}
          </button>
        </form>

        {statusMessage && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: '#F3F4F6',
              borderRadius: '0.25rem',
              fontSize: '0.9rem',
              color: '#1F2937',
            }}
          >
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  )
}
