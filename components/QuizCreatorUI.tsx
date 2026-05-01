'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Trash2, Image as ImageIcon, Save, Eye, ChevronDown, CheckCircle, GripVertical } from 'lucide-react'
import { BottomNav } from './BottomNav'

/* ─── types ──────────────────────────────────────────────────── */
interface AnswerOption { text: string; isCorrect: boolean }
interface QuestionDraft {
  id: number
  text: string
  options: AnswerOption[]
}

const CATEGORIES = ['Personality', 'Fun', 'Style', 'Food', 'Relationships', 'Creativity', 'K-Pop', 'Gaming', 'Movies']
const LABELS     = ['A', 'B', 'C', 'D']

let nextId = 2

function makeQuestion(id = 1): QuestionDraft {
  return {
    id,
    text: '',
    options: [
      { text: '', isCorrect: true  },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
  }
}

/* ─── shared input style ─────────────────────────────────────── */
const inputBase: React.CSSProperties = {
  width: '100%', background: 'var(--surface2)',
  border: '1px solid var(--border)', borderRadius: 14,
  padding: '13px 16px', color: 'var(--text)',
  fontFamily: 'var(--font-body)', fontSize: 14, outline: 'none',
  transition: 'border-color 0.2s ease',
}

function StyledInput({ id, placeholder, value, onChange, multiline }: {
  id?: string; placeholder: string; value: string
  onChange: (v: string) => void; multiline?: boolean
}) {
  const [focused, setFocused] = useState(false)
  const style: React.CSSProperties = {
    ...inputBase,
    borderColor: focused ? 'rgba(199,125,255,0.5)' : 'var(--border)',
    resize: 'none',
  }
  return multiline ? (
    <textarea id={id} rows={3} placeholder={placeholder} value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={style}
    />
  ) : (
    <input id={id} type="text" placeholder={placeholder} value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={style}
    />
  )
}

/* ─── question card ──────────────────────────────────────────── */
function QuestionCard({ q, index, onChange, onDelete }: {
  q: QuestionDraft; index: number
  onChange: (updated: QuestionDraft) => void
  onDelete: () => void
}) {
  const setCorrect = (optIdx: number) => {
    onChange({
      ...q,
      options: q.options.map((o, i) => ({ ...o, isCorrect: i === optIdx })),
    })
  }
  const setOptionText = (optIdx: number, text: string) => {
    onChange({
      ...q,
      options: q.options.map((o, i) => i === optIdx ? { ...o, text } : o),
    })
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 22, marginBottom: 14,
        overflow: 'hidden',
      }}
    >
      {/* card header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 18px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <GripVertical size={16} color="var(--muted)" style={{ cursor: 'grab', flexShrink: 0 }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '3px 12px', borderRadius: 100,
          background: 'linear-gradient(135deg, rgba(255,107,157,0.12), rgba(199,125,255,0.12))',
          border: '1px solid rgba(199,125,255,0.2)',
          fontSize: 12, fontWeight: 700,
          fontFamily: 'var(--font-body)',
          background: 'linear-gradient(135deg, var(--pink), var(--purple))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        } as React.CSSProperties}>
          Question {index + 1}
        </div>

        <motion.button
          id={`delete-q-${q.id}`}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.88 }}
          onClick={onDelete}
          style={{
            marginLeft: 'auto', background: 'none', border: 'none',
            cursor: 'pointer', color: 'var(--muted)',
            display: 'flex', alignItems: 'center',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--red)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--muted)')}
        >
          <Trash2 size={16} />
        </motion.button>
      </div>

      {/* card body */}
      <div style={{ padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* question text */}
        <div>
          <label style={{
            display: 'block', fontSize: 11, fontWeight: 600,
            color: 'var(--muted)', textTransform: 'uppercase',
            letterSpacing: '0.09em', marginBottom: 8,
            fontFamily: 'var(--font-body)',
          }}>Question Text</label>
          <StyledInput
            id={`q-${q.id}-text`}
            placeholder="Enter your question here…"
            value={q.text}
            onChange={v => onChange({ ...q, text: v })}
          />
        </div>

        {/* answers */}
        <div>
          <label style={{
            display: 'block', fontSize: 11, fontWeight: 600,
            color: 'var(--muted)', textTransform: 'uppercase',
            letterSpacing: '0.09em', marginBottom: 10,
            fontFamily: 'var(--font-body)',
          }}>Answer Options <span style={{ color: 'var(--green)', fontWeight: 500, textTransform: 'none', fontSize: 10 }}>· tap ✓ to mark correct</span></label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {q.options.map((opt, oi) => {
              const [focused, setFocused] = useState(false)
              return (
                <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* correct toggle */}
                  <motion.button
                    id={`q-${q.id}-correct-${oi}`}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setCorrect(oi)}
                    title="Mark as correct answer"
                    style={{
                      flexShrink: 0, width: 30, height: 30, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: opt.isCorrect
                        ? 'linear-gradient(135deg, var(--pink), var(--purple))'
                        : 'var(--surface2)',
                      border: opt.isCorrect ? 'none' : '1px solid var(--border)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800,
                      color: opt.isCorrect ? '#fff' : 'var(--muted)',
                      transition: 'background 0.2s ease',
                    }}
                  >
                    {opt.isCorrect ? <CheckCircle size={14} /> : LABELS[oi]}
                  </motion.button>

                  <input
                    id={`q-${q.id}-opt-${oi}`}
                    type="text"
                    placeholder={`Option ${LABELS[oi]}`}
                    value={opt.text}
                    onChange={e => setOptionText(oi, e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={{
                      ...inputBase,
                      padding: '10px 14px',
                      borderRadius: 12,
                      borderColor: opt.isCorrect
                        ? 'rgba(6,214,160,0.4)'
                        : focused ? 'rgba(199,125,255,0.4)' : 'var(--border)',
                      background: opt.isCorrect ? 'rgba(6,214,160,0.06)' : 'var(--surface2)',
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── main component ─────────────────────────────────────────── */
export function QuizCreatorUI() {
  const [activeTab, setActiveTab] = useState<'home' | 'create' | 'profile'>('create')
  const [title, setTitle]         = useState('')
  const [desc, setDesc]           = useState('')
  const [category, setCategory]   = useState('Personality')
  const [catOpen, setCatOpen]     = useState(false)
  const [questions, setQuestions] = useState<QuestionDraft[]>([makeQuestion(1)])
  const [published, setPublished] = useState(false)

  const addQuestion = () => {
    setQuestions(qs => [...qs, makeQuestion(nextId++)])
  }
  const deleteQuestion = (id: number) => {
    setQuestions(qs => qs.filter(q => q.id !== id))
  }
  const updateQuestion = (updated: QuestionDraft) => {
    setQuestions(qs => qs.map(q => q.id === updated.id ? updated : q))
  }

  const canPublish = title.trim().length > 0 && questions.every(q =>
    q.text.trim() && q.options.every(o => o.text.trim())
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-body)', paddingBottom: 120 }}>

      {/* ── sticky header ───────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(10,10,15,0.88)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20,
          background: 'linear-gradient(135deg, var(--pink), var(--purple))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>Create Quiz ✨</div>

        {/* question counter pill */}
        <div style={{
          padding: '5px 14px', borderRadius: 100,
          background: 'var(--surface)', border: '1px solid var(--border)',
          fontSize: 13, color: 'var(--muted)', fontWeight: 500,
        }}>
          {questions.length} question{questions.length !== 1 ? 's' : ''}
        </div>
      </nav>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px' }}>

        {/* ── Quiz Info card ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 24, padding: 24, marginBottom: 24,
          }}
        >
          {/* section label */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
          }}>
            <div style={{
              width: 4, height: 18, borderRadius: 2,
              background: 'linear-gradient(180deg, var(--pink), var(--purple))',
            }} />
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
            }}>Quiz Info</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* title */}
            <div>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 600,
                color: 'var(--muted)', textTransform: 'uppercase',
                letterSpacing: '0.09em', marginBottom: 8,
              }}>Quiz Title</label>
              <StyledInput
                id="quiz-title"
                placeholder="e.g., Which Gen-Z Icon Are You?"
                value={title} onChange={setTitle}
              />
            </div>

            {/* description */}
            <div>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 600,
                color: 'var(--muted)', textTransform: 'uppercase',
                letterSpacing: '0.09em', marginBottom: 8,
              }}>Description</label>
              <StyledInput
                id="quiz-desc"
                placeholder="Tell people what this quiz is about…"
                value={desc} onChange={setDesc} multiline
              />
            </div>

            {/* custom category dropdown */}
            <div>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 600,
                color: 'var(--muted)', textTransform: 'uppercase',
                letterSpacing: '0.09em', marginBottom: 8,
              }}>Category</label>

              <div style={{ position: 'relative' }}>
                <motion.button
                  id="quiz-category-toggle"
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setCatOpen(v => !v)}
                  style={{
                    ...inputBase,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer', borderColor: catOpen ? 'rgba(199,125,255,0.5)' : 'var(--border)',
                  }}
                >
                  <span>{category}</span>
                  <motion.span animate={{ rotate: catOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={16} color="var(--muted)" />
                  </motion.span>
                </motion.button>

                <AnimatePresence>
                  {catOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                        background: 'var(--surface2)', border: '1px solid var(--border)',
                        borderRadius: 14, overflow: 'hidden', zIndex: 20,
                        boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                      }}
                    >
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          onClick={() => { setCategory(cat); setCatOpen(false) }}
                          style={{
                            width: '100%', padding: '11px 16px',
                            background: cat === category ? 'rgba(199,125,255,0.1)' : 'none',
                            border: 'none', borderBottom: '1px solid var(--border)',
                            color: cat === category ? 'var(--purple)' : 'var(--text)',
                            fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: cat === category ? 600 : 400,
                            textAlign: 'left', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          }}
                        >
                          {cat}
                          {cat === category && <CheckCircle size={14} color="var(--purple)" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* thumbnail upload zone */}
            <div>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 600,
                color: 'var(--muted)', textTransform: 'uppercase',
                letterSpacing: '0.09em', marginBottom: 8,
              }}>Thumbnail</label>
              <motion.button
                id="quiz-thumbnail-upload"
                whileHover={{ borderColor: 'rgba(199,125,255,0.5)', scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                style={{
                  width: '100%', padding: '36px 0',
                  border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 18,
                  background: 'rgba(255,255,255,0.02)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 10,
                  cursor: 'pointer', transition: 'border-color 0.2s ease',
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: 'rgba(199,125,255,0.1)',
                  border: '1px solid rgba(199,125,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ImageIcon size={22} color="var(--purple)" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 3 }}>
                    Upload Image
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>PNG, JPG up to 5MB</div>
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── Questions ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 4, height: 18, borderRadius: 2,
                background: 'linear-gradient(180deg, var(--pink), var(--purple))',
              }} />
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
              }}>Questions</span>
            </div>

            <motion.button
              id="add-question-btn"
              whileHover={{ scale: 1.05, boxShadow: '0 6px 20px rgba(255,107,157,0.35)' }}
              whileTap={{ scale: 0.93 }}
              onClick={addQuestion}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 18px', borderRadius: 100, border: 'none',
                background: 'linear-gradient(135deg, var(--pink), var(--purple))',
                color: 'white', fontFamily: 'var(--font-body)',
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(255,107,157,0.25)',
              }}
            >
              <Plus size={15} /> Add Question
            </motion.button>
          </div>

          {/* empty state */}
          {questions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{
                textAlign: 'center', padding: '48px 24px',
                background: 'var(--surface)', border: '1px dashed rgba(255,255,255,0.08)',
                borderRadius: 22, color: 'var(--muted)', fontSize: 14,
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>💡</div>
              No questions yet — hit <strong>Add Question</strong> to get started.
            </motion.div>
          )}

          <AnimatePresence mode="popLayout">
            {questions.map((q, i) => (
              <QuestionCard
                key={q.id} q={q} index={i}
                onChange={updateQuestion}
                onDelete={() => deleteQuestion(q.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* ── action buttons ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}
        >
          <motion.button
            id="quiz-preview-btn"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{
              padding: '15px 0', borderRadius: 18,
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--muted)', fontFamily: 'var(--font-body)',
              fontWeight: 600, fontSize: 15, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'border-color 0.2s ease, color 0.2s ease',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(199,125,255,0.4)'; el.style.color = 'var(--purple)' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.color = 'var(--muted)' }}
          >
            <Eye size={18} /> Preview
          </motion.button>

          <motion.button
            id="quiz-publish-btn"
            whileHover={canPublish ? { scale: 1.03, boxShadow: '0 10px 28px rgba(255,107,157,0.4)' } : {}}
            whileTap={canPublish ? { scale: 0.97 } : {}}
            disabled={!canPublish}
            onClick={() => canPublish && setPublished(true)}
            style={{
              padding: '15px 0', borderRadius: 18, border: 'none',
              background: canPublish
                ? 'linear-gradient(135deg, var(--pink), var(--purple))'
                : 'rgba(255,107,157,0.2)',
              color: canPublish ? 'white' : 'rgba(255,255,255,0.3)',
              fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 15,
              cursor: canPublish ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: canPublish ? '0 6px 20px rgba(255,107,157,0.28)' : 'none',
              transition: 'background 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            <Save size={18} />
            {published ? '✓ Published!' : 'Publish Quiz'}
          </motion.button>
        </motion.div>

        {/* validation hint */}
        {!canPublish && (title.length > 0 || questions.some(q => q.text)) && (
          <motion.p
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: 'center', marginTop: 12,
              fontSize: 12, color: 'var(--muted)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Fill in the quiz title and all question fields to publish.
          </motion.p>
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
