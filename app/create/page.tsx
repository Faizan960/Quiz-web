'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const CATEGORIES = [
  { id: 'besties', label: 'Besties 👯' },
  { id: 'couples', label: 'Couples 💑' },
  { id: 'kpop',   label: 'K-Pop 🎵' },
  { id: 'fun',    label: 'Just Fun 🎉' },
  { id: 'movies', label: 'Movies 🎬' },
  { id: 'gaming', label: 'Gaming 🎮' },
]

type Question = {
  question_text: string
  options: string[]
  correct_index: number
}

const emptyQuestion = (): Question => ({
  question_text: '',
  options: ['', '', '', ''],
  correct_index: 0,
})

// ── PRELOADED TEMPLATES ─────────────────────────────────────────────────────

const BESTIES_TEMPLATE: Question[] = [
  { question_text: "What's my go-to comfort food?", options: ['Pizza', 'Ice cream', 'Biryani', 'Instant noodles'], correct_index: 0 },
  { question_text: 'Which word describes me best?', options: ['Funny', 'Loyal', 'Chaotic', 'Chill'], correct_index: 0 },
  { question_text: 'What do I do first thing in the morning?', options: ['Check my phone', 'Make coffee', 'Go back to sleep', 'Exercise'], correct_index: 0 },
  { question_text: "What's my biggest fear?", options: ['Spiders', 'Being alone', 'Failing', 'Heights'], correct_index: 0 },
  { question_text: 'How do I handle stress?', options: ['Rant to friends', 'Sleep it off', 'Eat my feelings', 'Work harder'], correct_index: 0 },
  { question_text: 'Pick my signature emoji:', options: ['😂', '💀', '🥺', '✨'], correct_index: 0 },
  { question_text: 'What movie genre am I most like?', options: ['Rom-com', 'Thriller', 'Horror', 'Documentary'], correct_index: 0 },
  { question_text: 'What time do I usually sleep?', options: ['Before midnight', '12–2 AM', '2–4 AM', 'As the sun rises'], correct_index: 0 },
  { question_text: "What's my love language?", options: ['Words of affirmation', 'Quality time', 'Gift giving', 'Physical touch'], correct_index: 0 },
  { question_text: "When I'm bored I...", options: ['Scroll endlessly', 'Text random people', 'Watch videos', 'Actually do something productive'], correct_index: 0 },
]

const COUPLES_TEMPLATE: Question[] = [
  { question_text: 'Where was our first date?', options: ['Café', 'Park', 'Cinema', 'Restaurant'], correct_index: 0 },
  { question_text: 'What do I order at a café?', options: ['Latte', 'Black coffee', 'Matcha', 'Hot chocolate'], correct_index: 0 },
  { question_text: "What's my love language?", options: ['Quality time', 'Acts of service', 'Words of affirmation', 'Gifts'], correct_index: 0 },
  { question_text: 'How do I feel about PDA?', options: ['Love it', 'Only a little', 'Keep it private', 'Depends on mood'], correct_index: 0 },
  { question_text: 'What annoys me most?', options: ['Being ignored', 'Loud chewing', 'Being late', 'Unnecessary drama'], correct_index: 0 },
  { question_text: 'Our ideal date night is:', options: ['Movie at home', 'Dinner out', 'Late-night drive', 'Gaming together'], correct_index: 0 },
  { question_text: "What's my zodiac sign?", options: ['Fire sign', 'Earth sign', 'Air sign', 'Water sign'], correct_index: 0 },
  { question_text: 'How do I act when jealous?', options: ['Get quiet', 'Say it directly', 'Pretend I\'m fine', 'Make it obvious'], correct_index: 0 },
  { question_text: 'My go-to song for us?', options: ['A slow romantic ballad', 'An upbeat pop song', 'An R&B track', 'A nostalgic classic'], correct_index: 0 },
  { question_text: 'What gift would make me happiest?', options: ['Handwritten letter', 'Surprise trip', 'My fav food', 'Something personalised'], correct_index: 0 },
]

const TEMPLATES = [
  {
    id: 'besties',
    label: 'Besties Quiz 👯',
    desc: 'How well do your friends really know you?',
    color: '#FF6B9D',
    questions: BESTIES_TEMPLATE,
    category: 'besties' as const,
    titleTemplate: (name: string) => `${name}'s Besties Quiz`,
  },
  {
    id: 'couples',
    label: 'Couples Quiz 💑',
    desc: 'Does your partner truly know you inside out?',
    color: '#FF4D6D',
    questions: COUPLES_TEMPLATE,
    category: 'couples' as const,
    titleTemplate: (name: string) => `${name}'s Couples Quiz`,
  },
  {
    id: 'blank',
    label: 'Start from Scratch ✍️',
    desc: 'Build your own quiz with custom questions.',
    color: '#C77DFF',
    questions: [],
    category: '' as any,
    titleTemplate: (name: string) => `${name}'s Quiz`,
  },
]

export default function CreatePage() {
  const router = useRouter()

  // Step: 'template' | 'form'
  const [step, setStep] = useState<'template' | 'form'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<typeof TEMPLATES[0] | null>(null)

  const [title, setTitle]           = useState('')
  const [category, setCategory]     = useState('')
  const [creatorName, setCreatorName] = useState('')
  const [questions, setQuestions]   = useState<Question[]>([emptyQuestion()])
  const [loading, setLoading]       = useState(false)
  const [published, setPublished]   = useState(false)
  const [quizSlug, setQuizSlug]     = useState('')
  const [error, setError]           = useState('')

  const handlePickTemplate = (tpl: typeof TEMPLATES[0]) => {
    setSelectedTemplate(tpl)
    setStep('form')
    if (tpl.id !== 'blank') {
      setCategory(tpl.category)
      setQuestions(tpl.questions.map(q => ({ ...q })))
    } else {
      setCategory('')
      setQuestions([emptyQuestion()])
    }
    setTitle('')
  }

  // Auto-update title when name changes (for template-based quizzes)
  const handleNameChange = (name: string) => {
    setCreatorName(name)
    if (selectedTemplate && name.trim()) {
      setTitle(selectedTemplate.titleTemplate(name.trim()))
    }
  }

  const addQuestion = () => setQuestions(q => [...q, emptyQuestion()])

  const removeQuestion = (i: number) =>
    setQuestions(q => q.filter((_, idx) => idx !== i))

  const updateQ = (i: number, field: keyof Question, val: any) =>
    setQuestions(q => q.map((qq, idx) => idx === i ? { ...qq, [field]: val } : qq))

  const updateOption = (qi: number, oi: number, val: string) =>
    setQuestions(q => q.map((qq, idx) =>
      idx === qi ? { ...qq, options: qq.options.map((o, j) => j === oi ? val : o) } : qq
    ))

  const handlePublish = async () => {
    if (!title.trim())       return setError('Add a quiz title!')
    if (!category)           return setError('Pick a category!')
    if (!creatorName.trim()) return setError('Add your name!')
    for (const [i, q] of questions.entries()) {
      if (!q.question_text.trim()) return setError(`Question ${i+1} needs text!`)
      if (q.options.some(o => !o.trim())) return setError(`All options in Q${i+1} must be filled!`)
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, creator_name: creatorName, questions }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setQuizSlug(data.slug)
      setPublished(true)
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const quizUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/play/${quizSlug}`
    : `/play/${quizSlug}`

  const copyLink = () => navigator.clipboard.writeText(quizUrl)

  /* ── PUBLISHED ─────────────────────────────────────────────── */
  if (published) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Quiz is Live!</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 12 }}>Share this link with your people</p>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>They'll enter their name and play — scores show on the leaderboard 🏆</p>

        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 14, padding: '16px 20px', marginBottom: 20,
          fontFamily: 'monospace', fontSize: 14, color: 'var(--pink)',
          wordBreak: 'break-all',
        }}>{quizUrl}</div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
          {[
            { label: '📋 Copy Link', action: copyLink, bg: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' },
            { label: '🐦 Share on X', action: () => window.open(`https://twitter.com/intent/tweet?text=Can you beat my score? Play my quiz! ${quizUrl}`), bg: '#1DA1F2', color: 'white' },
            { label: '💬 WhatsApp',   action: () => window.open(`https://wa.me/?text=Play my quiz: ${quizUrl}`), bg: '#25D366', color: 'white' },
          ].map(b => (
            <button key={b.label} onClick={b.action} style={{
              padding: '10px 20px', borderRadius: 100, border: (b as any).border || 'none',
              background: b.bg, color: b.color, cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
            }}>{b.label}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => router.push(`/play/${quizSlug}`)} style={{
            padding: '12px 24px', borderRadius: 100,
            background: 'linear-gradient(135deg,var(--pink),var(--purple))',
            color: 'white', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontWeight: 600,
          }}>Preview Quiz</button>
          <button onClick={() => { setPublished(false); setStep('template'); setTitle(''); setCategory(''); setCreatorName(''); setQuestions([emptyQuestion()]) }} style={{
            padding: '12px 24px', borderRadius: 100,
            background: 'var(--surface)', color: 'var(--muted)',
            border: '1px solid var(--border)', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontWeight: 500,
          }}>Create Another</button>
        </div>
      </div>
    </div>
  )

  /* ── TEMPLATE PICKER ───────────────────────────────────────── */
  if (step === 'template') return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 32px', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)',
      }}>
        <Link href="/" style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22,
          background: 'linear-gradient(135deg,var(--pink),var(--purple))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          textDecoration: 'none',
        }}>Quizly✦</Link>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Create Your Quiz</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 40, fontSize: 15 }}>
          Pick a template to get started or build from scratch. Share the link — friends play, you see who wins 🏆
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {TEMPLATES.map(tpl => (
            <button
              key={tpl.id}
              onClick={() => handlePickTemplate(tpl)}
              style={{
                background: 'var(--surface)', border: `1px solid var(--border)`,
                borderRadius: 20, padding: '24px 28px', cursor: 'pointer',
                textAlign: 'left', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 20,
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = tpl.color; el.style.transform = 'translateX(4px)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.transform = '' }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                background: `${tpl.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26,
              }}>{tpl.id === 'besties' ? '👯' : tpl.id === 'couples' ? '💑' : '✍️'}</div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{tpl.label}</div>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>{tpl.desc}</div>
                {tpl.id !== 'blank' && (
                  <div style={{ fontSize: 12, color: tpl.color, marginTop: 6, fontWeight: 600 }}>
                    {tpl.questions.length} preloaded questions · customise before publishing
                  </div>
                )}
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 20, color: 'var(--muted)' }}>→</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  /* ── CREATOR FORM ──────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 32px', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)',
      }}>
        <button onClick={() => setStep('template')} style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22,
          background: 'linear-gradient(135deg,var(--pink),var(--purple))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          border: 'none', cursor: 'pointer', padding: 0,
        }}>Quizly✦</button>
        <span style={{ fontSize: 14, color: 'var(--muted)' }}>{questions.length} question{questions.length !== 1 ? 's' : ''}</span>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px' }}>
        <button onClick={() => setStep('template')} style={{
          background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer',
          fontFamily: 'var(--font-body)', fontSize: 13, marginBottom: 24, padding: 0,
        }}>← Back to templates</button>

        {selectedTemplate && selectedTemplate.id !== 'blank' && (
          <div style={{
            background: `${selectedTemplate.color}15`, border: `1px solid ${selectedTemplate.color}40`,
            borderRadius: 14, padding: '12px 18px', marginBottom: 28, fontSize: 13, color: selectedTemplate.color,
          }}>
            📋 Using <strong>{selectedTemplate.label}</strong> template — edit any question to personalise it for yourself!
          </div>
        )}

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
          {selectedTemplate?.id !== 'blank' ? 'Personalise Your Quiz' : 'Create Your Quiz'}
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: 40, fontSize: 15 }}>Fill in your name — your quiz link will be "<strong style={{color:'var(--pink)'}}>yourname&apos;s-quiz</strong>" ✨</p>

        {error && (
          <div style={{
            background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.25)',
            borderRadius: 12, padding: '12px 16px', marginBottom: 24,
            color: 'var(--red)', fontSize: 14,
          }}>❌ {error}</div>
        )}

        {/* Creator name — FIRST so title auto-fills */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Your Name</label>
          <input
            value={creatorName} onChange={e => handleNameChange(e.target.value)}
            placeholder="e.g. Alex"
            style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 18px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 15, outline: 'none' }}
          />
          {creatorName.trim() && (
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
              🔗 Your quiz link will be: <span style={{ color: 'var(--pink)' }}>/play/{creatorName.trim().toLowerCase().replace(/\s+/g, '-')}s-quiz-xxxxx</span>
            </div>
          )}
        </div>

        {/* Title */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Quiz Title</label>
          <input
            value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. How well do you know me?"
            style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 18px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 15, outline: 'none' }}
          />
        </div>

        {/* Category */}
        <div style={{ marginBottom: 32 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Category</label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id)} style={{
                padding: '10px 18px', borderRadius: 100, cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
                border: category === cat.id ? 'none' : '1px solid var(--border)',
                background: category === cat.id ? 'linear-gradient(135deg,var(--pink),var(--purple))' : 'var(--surface)',
                color: category === cat.id ? 'white' : 'var(--text)',
                transition: 'all 0.2s',
              }}>{cat.label}</button>
            ))}
          </div>
        </div>

        {/* Questions */}
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
          Questions <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— edit the answers to match YOUR truth!</span>
        </div>

        {questions.map((q, qi) => (
          <div key={qi} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 20, padding: 24, marginBottom: 16, position: 'relative',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--pink)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Question {qi + 1}</div>
            {questions.length > 1 && (
              <button onClick={() => removeQuestion(qi)} style={{
                position: 'absolute', top: 16, right: 16,
                background: 'rgba(255,77,109,0.1)', border: 'none', borderRadius: 8,
                color: 'var(--red)', padding: '6px 10px', cursor: 'pointer', fontSize: 12,
              }}>✕ Remove</button>
            )}
            <input
              value={q.question_text}
              onChange={e => updateQ(qi, 'question_text', e.target.value)}
              placeholder="Type your question here..."
              style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 15, outline: 'none', marginBottom: 14 }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {q.options.map((opt, oi) => (
                <div key={oi} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div
                    onClick={() => updateQ(qi, 'correct_index', oi)}
                    title="Mark as correct answer"
                    style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      border: q.correct_index === oi ? '2px solid var(--green)' : '2px solid var(--border)',
                      background: q.correct_index === oi ? 'rgba(6,214,160,0.15)' : 'transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, color: 'var(--green)',
                    }}
                  >{q.correct_index === oi ? '✓' : ''}</div>
                  <input
                    value={opt}
                    onChange={e => updateOption(qi, oi, e.target.value)}
                    placeholder={`Option ${oi + 1}`}
                    style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 14, outline: 'none' }}
                  />
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10 }}>☝️ Click the circle to mark the correct answer</div>
          </div>
        ))}

        <button onClick={addQuestion} style={{
          width: '100%', padding: 16, borderRadius: 14, marginBottom: 32,
          border: '2px dashed var(--border)', background: 'transparent',
          color: 'var(--muted)', fontFamily: 'var(--font-body)', fontSize: 15, cursor: 'pointer',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--pink)'; (e.currentTarget as HTMLElement).style.color = 'var(--pink)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--muted)' }}
        >+ Add Question</button>

        <button onClick={handlePublish} disabled={loading} style={{
          width: '100%', padding: 18, borderRadius: 14, border: 'none',
          background: loading ? 'rgba(255,107,157,0.4)' : 'linear-gradient(135deg,var(--pink),var(--purple))',
          color: 'white', fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
        }}>{loading ? 'Publishing...' : 'Publish Quiz 🚀'}</button>
      </div>
    </div>
  )
}
