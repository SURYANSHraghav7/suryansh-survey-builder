import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/builder/$id')({
  component: BuilderStudio,
})

function BuilderStudio() {
  const { id } = Route.useParams()
  const [title, setTitle] = useState('Loading...')
  const [questions, setQuestions] = useState<any[]>([])
  const [brandColor, setBrandColor] = useState('#4F46E5')
  const [logoUrl, setLogoUrl] = useState('')
  const [slug, setSlug] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const response = await fetch(`http://localhost:8787/api/surveys/${id}`, {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setTitle(data.survey.title)
          setQuestions(data.questions || [])
          if (data.survey.brand_color) setBrandColor(data.survey.brand_color)
          if (data.survey.logo_url) setLogoUrl(data.survey.logo_url)
          if (data.survey.slug) setSlug(data.survey.slug)
        }
      } catch (_error) {
        console.error('Failed to load survey data')
      }
    }
    fetchSurvey()
  }, [id])

  const addQuestion = (type: string) => {
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),
        type: type,
        label: 'New Question',
        // Initialize multiple choice with default options
        options: type === 'multiple-choice' ? ['Option 1', 'Option 2'] : undefined,
      },
    ])
  }

  const updateQuestionLabel = (index: number, newLabel: string) => {
    const updated = [...questions]
    updated[index].label = newLabel
    setQuestions(updated)
  }

  // --- MULTIPLE CHOICE OPTION CONTROLS ---
  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...questions]
    if (!updated[qIndex].options) updated[qIndex].options = []
    updated[qIndex].options[optIndex] = value
    setQuestions(updated)
  }

  const addOption = (qIndex: number) => {
    const updated = [...questions]
    if (!updated[qIndex].options) updated[qIndex].options = []
    updated[qIndex].options.push(`Option ${updated[qIndex].options.length + 1}`)
    setQuestions(updated)
  }

  const removeOption = (qIndex: number, optIndex: number) => {
    const updated = [...questions]
    updated[qIndex].options = updated[qIndex].options.filter((_: any, i: number) => i !== optIndex)
    setQuestions(updated)
  }

  // --- REORDER & DELETE CONTROLS ---
  const moveUp = (index: number) => {
    if (index === 0) return
    const updated = [...questions]
    const temp = updated[index]
    updated[index] = updated[index - 1]
    updated[index - 1] = temp
    setQuestions(updated)
  }

  const moveDown = (index: number) => {
    if (index === questions.length - 1) return
    const updated = [...questions]
    const temp = updated[index]
    updated[index] = updated[index + 1]
    updated[index + 1] = temp
    setQuestions(updated)
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const questionsResponse = await fetch(`http://localhost:8787/api/surveys/${id}/questions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(questions),
      })

      const brandingResponse = await fetch(`http://localhost:8787/api/surveys/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title,
          brand_color: brandColor,
          logo_url: logoUrl,
        }),
      })

      if (questionsResponse.ok && brandingResponse.ok) {
        alert('💾 Survey structure and branding saved successfully!')
      } else {
        alert('❌ Error updating settings.')
      }
    } catch (_error) {
      alert('❌ Network error while saving.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: '#f3f4f6',
        fontFamily: 'system-ui',
      }}
    >
      {/* ⬅️ LEFT PANEL */}
      <div
        style={{
          width: '350px',
          backgroundColor: 'white',
          borderRight: '1px solid #e5e7eb',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          overflowY: 'auto',
        }}
      >
        <Link
          to="/dashboard"
          style={{
            display: 'inline-block',
            textDecoration: 'none',
            color: '#6B7280',
            fontSize: '0.9rem',
            fontWeight: '500',
          }}
        >
          ← Back to Dashboard
        </Link>

        <div>
          <h2
            style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              color: '#111827',
            }}
          >
            Builder Menu
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Editing: <strong style={{ color: brandColor }}>{title}</strong>
          </p>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#10b981',
              color: 'white',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: isSaving ? 'wait' : 'pointer',
            }}
          >
            {isSaving ? 'Saving...' : '💾 Save Changes'}
          </button>

          {/* 👈 ADD THIS NEW BLOCK RIGHT HERE 👇 */}
          {slug && (
            <a
              href={`/s/${slug}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'block',
                marginTop: '1rem',
                textAlign: 'center',
                color: brandColor,
                textDecoration: 'underline',
                fontSize: '0.9rem',
                fontWeight: 'bold',
              }}
            >
              Open Live Survey ↗
            </a>
          )}
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: 0 }} />

        <div>
          <h3
            style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}
          >
            Design & Branding
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4B5563' }}>
                Primary Theme Color
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '0.25rem',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                />
                <input
                  type="text"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    fontSize: '0.9rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '0.25rem',
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4B5563' }}>
                Logo Image URL
              </label>
              <input
                type="url"
                placeholder="https://example.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                style={{
                  padding: '0.5rem',
                  fontSize: '0.9rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.25rem',
                }}
              />
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: 0 }} />

        <div>
          <h3
            style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}
          >
            Add Fields
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => addQuestion('text')}
              style={{
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                border: '1px solid #d1d5db',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: '500',
              }}
            >
              + Short Answer
            </button>
            <button
              onClick={() => addQuestion('textarea')}
              style={{
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                border: '1px solid #d1d5db',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: '500',
              }}
            >
              + Long Paragraph
            </button>
            <button
              onClick={() => addQuestion('rating')}
              style={{
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                border: '1px solid #d1d5db',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: '500',
              }}
            >
              + 1-5 Rating
            </button>
            <button
              onClick={() => addQuestion('multiple-choice')}
              style={{
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                border: '1px solid #d1d5db',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: '500',
              }}
            >
              + Multiple Choice
            </button>
          </div>
        </div>
      </div>

      {/* ➡️ RIGHT PANEL */}
      <div
        style={{
          flex: 1,
          padding: '3rem',
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '600px',
            backgroundColor: 'white',
            padding: '3rem',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            height: 'fit-content',
          }}
        >
          {logoUrl && (
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-start' }}>
              <img
                src={logoUrl}
                alt="Survey Logo"
                style={{ maxHeight: '50px', maxWidth: '150px', objectFit: 'contain' }}
                onError={(e) => {
                  ;(e.target as HTMLElement).style.display = 'none'
                }}
              />
            </div>
          )}

          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '2rem',
              borderBottom: `4px solid ${brandColor}`,
              paddingBottom: '1rem',
              color: '#111827',
            }}
          >
            {title}
          </h1>

          {questions.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                color: '#9ca3af',
                padding: '3rem',
                border: '2px dashed #e5e7eb',
                borderRadius: '0.5rem',
              }}
            >
              Your survey is empty. Use the tools on the left to start customizing!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {questions.map((q, index) => (
                <div
                  key={q.id || index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    padding: '1.5rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    backgroundColor: '#ffffff',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <label style={{ fontWeight: 'bold', color: '#374151' }}>
                        Question {index + 1}
                      </label>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: 'white',
                          backgroundColor: brandColor,
                          padding: '0.25rem 0.5rem',
                          borderRadius: '1rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          fontWeight: 'bold',
                        }}
                      >
                        {q.type.replace('-', ' ')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        style={{
                          padding: '0.25rem 0.5rem',
                          cursor: index === 0 ? 'not-allowed' : 'pointer',
                          background: '#f3f4f6',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.25rem',
                          opacity: index === 0 ? 0.5 : 1,
                        }}
                      >
                        ⬆️
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === questions.length - 1}
                        style={{
                          padding: '0.25rem 0.5rem',
                          cursor: index === questions.length - 1 ? 'not-allowed' : 'pointer',
                          background: '#f3f4f6',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.25rem',
                          opacity: index === questions.length - 1 ? 0.5 : 1,
                        }}
                      >
                        ⬇️
                      </button>
                      <button
                        onClick={() => removeQuestion(index)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          cursor: 'pointer',
                          background: '#fee2e2',
                          border: '1px solid #fca5a5',
                          borderRadius: '0.25rem',
                          color: '#ef4444',
                          marginLeft: '0.5rem',
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={q.label}
                    onChange={(e) => updateQuestionLabel(index, e.target.value)}
                    placeholder="Type your question here..."
                    style={{
                      padding: '0.5rem',
                      fontSize: '1rem',
                      border: `1px solid ${brandColor}`,
                      borderRadius: '0.25rem',
                      outline: 'none',
                    }}
                  />

                  {/* DYNAMIC QUESTION RENDERER */}
                  {q.type === 'textarea' ? (
                    <textarea
                      disabled
                      placeholder="Respondent will type a long answer here..."
                      style={{
                        padding: '0.75rem',
                        backgroundColor: '#f9fafb',
                        border: '1px dashed #d1d5db',
                        marginTop: '0.5rem',
                        resize: 'none',
                      }}
                    />
                  ) : q.type === 'rating' ? (
                    <div
                      style={{
                        display: 'flex',
                        gap: '1.5rem',
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <label
                          key={num}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            color: '#6b7280',
                            fontWeight: '500',
                          }}
                        >
                          <input disabled type="radio" name={`rating-${index}`} /> {num}
                        </label>
                      ))}
                    </div>
                  ) : q.type === 'multiple-choice' ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        marginTop: '0.5rem',
                      }}
                    >
                      {(q.options || ['Option 1']).map((opt: string, optIndex: number) => (
                        <div
                          key={optIndex}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                          <input disabled type="radio" name={`mc-${index}`} />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateOption(index, optIndex, e.target.value)}
                            placeholder={`Option ${optIndex + 1}`}
                            style={{
                              flex: 1,
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '0.25rem',
                              fontSize: '0.9rem',
                            }}
                          />
                          <button
                            onClick={() => removeOption(index, optIndex)}
                            style={{
                              color: '#ef4444',
                              cursor: 'pointer',
                              background: 'none',
                              border: 'none',
                              fontSize: '1.2rem',
                              padding: '0 0.5rem',
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addOption(index)}
                        style={{
                          alignSelf: 'flex-start',
                          color: brandColor,
                          cursor: 'pointer',
                          background: 'none',
                          border: 'none',
                          fontWeight: 'bold',
                          fontSize: '0.85rem',
                          marginTop: '0.25rem',
                        }}
                      >
                        + Add Option
                      </button>
                    </div>
                  ) : (
                    <input
                      disabled
                      type="text"
                      placeholder="Respondent will type a short answer here..."
                      style={{
                        padding: '0.75rem',
                        backgroundColor: '#f9fafb',
                        border: '1px dashed #d1d5db',
                        marginTop: '0.5rem',
                      }}
                    />
                  )}
                </div>
              ))}

              <button
                disabled
                style={{
                  padding: '1rem',
                  backgroundColor: brandColor,
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  opacity: 0.8,
                  cursor: 'not-allowed',
                }}
              >
                Submit Response (Preview)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
