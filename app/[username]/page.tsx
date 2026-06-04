'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, User, Sparkles, Heart, Share2, Camera } from 'lucide-react'

function Confetti() {
  const [pieces, setPieces] = useState<{ id: number; left: string; delay: string; size: string; color: string }[]>([])
  
  useEffect(() => {
    const colors = ['#7c3aed', '#8b5cf6', '#ec4899', '#0ea5e9', '#ffb703', '#fb8500', '#2ec4b6']
    const newPieces = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3.5}s`,
      size: `${Math.random() * 8 + 6}px`,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))
    const t = setTimeout(() => setPieces(newPieces), 0)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            animationDelay: p.delay,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  )
}

interface QuestionData {
  id: string
  question_text: string
  question_type: string
  category: string
  options: { text: string; dimensions: Record<string, number> }[]
  order_num: number
}

const cardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring' as const, stiffness: 300, damping: 26 },
      opacity: { duration: 0.2 },
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
    scale: 0.98,
    transition: {
      x: { type: 'spring' as const, stiffness: 300, damping: 26 },
      opacity: { duration: 0.2 },
    },
  }),
}


interface ProfileData {
  id: string
  slug: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  interests: string[]
}

export default function AnswerPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [questions, setQuestions] = useState<QuestionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Answer flow state
  const [started, setStarted] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)
  const [direction, setDirection] = useState(1)
  const [answers, setAnswers] = useState<Record<string, { value: string; index: number }>>({})
  const [respondentName, setRespondentName] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [teaser, setTeaser] = useState<{ total_responses: number; display_name: string; archetype: string | null; archetype_emoji: string | null } | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    fetch(`/api/profiles/${username}/questions`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setLoading(false); return }
        setProfile(data.profile)
        setQuestions(data.questions ?? [])
        setLoading(false)
      })
      .catch(() => { setError('Failed to load'); setLoading(false) })
  }, [username])

  useEffect(() => {
    if (submitted) {
      fetch(`/api/profiles/${username}/teaser`)
        .then(r => r.json())
        .then(data => {
          if (!data.error) {
            setTeaser(data)
          }
        })
        .catch(() => {})
    }
  }, [submitted, username])

  const handleAnswer = useCallback((questionId: string, optionText: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: { value: optionText, index: optionIndex } }))
    // Auto-advance after short delay
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setDirection(1)
        setCurrentQ(q => q + 1)
      }
    }, 400)
  }, [currentQ, questions.length])

  // Keyboard navigation shortcuts
  const question = questions[currentQ]
  useEffect(() => {
    if (!started || submitted || !question) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing on input focus
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return

      const key = e.key.toUpperCase()
      const index = ['A', 'B', 'C', 'D'].indexOf(key) !== -1 
        ? ['A', 'B', 'C', 'D'].indexOf(key) 
        : ['1', '2', '3', '4'].indexOf(key)

      if (index !== -1 && question.options && question.options[index]) {
        handleAnswer(question.id, question.options[index].text, index)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [started, submitted, currentQ, question, handleAnswer])

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const answerPayload = Object.entries(answers).map(([qId, a]) => ({
        question_id: qId,
        answer_value: a.value,
        answer_index: a.index,
      }))

      const res = await fetch(`/api/profiles/${username}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          respondent_name: isAnonymous ? undefined : respondentName.trim(),
          is_anonymous: isAnonymous,
          answers: answerPayload,
        }),
      })

      if (!res.ok) throw new Error('Failed to submit')
      setSubmitted(true)
    } catch {
      setError('Failed to submit responses')
    } finally {
      setSubmitting(false)
    }
  }

  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length
  const progress = questions.length > 0 ? (Object.keys(answers).length / questions.length) * 100 : 0

  // ─── Loading ──────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none bg-dot-grid opacity-80" />
        <div className="w-12 h-12 bg-surface border border-border rounded-2xl flex items-center justify-center text-2xl shadow-sm animate-pulse-glow">
          🪞
        </div>
      </div>
    )
  }

  // ─── Error / Not Found ────────────────────────
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none bg-dot-grid opacity-80" />
        <div className="text-4xl mb-2">😕</div>
        <h1 className="font-display text-xl font-bold text-text-primary">Profile not found</h1>
        <p className="text-text-secondary text-xs font-semibold">{error || 'This mirror doesn\'t exist.'}</p>
        <Link href="/" className="mt-4 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs rounded-xl hover:opacity-90 transition-all cursor-pointer">
          Go Home
        </Link>
      </div>
    )
  }

  const handleShareStory = async () => {
    const text = `I just answered questions about ${profile?.display_name || 'my friend'} on Social Mirror! 🪞 Reveal their archetype here: ${window.location.origin}/${username}`
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 4000)
    } catch (err) {
      console.error(err)
    }
  }

  // ─── Submitted! ───────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <Confetti />
        <div className="absolute inset-0 z-0 pointer-events-none bg-dot-grid opacity-80" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
          className="relative z-10 glass-card p-6 md:p-8 text-center max-w-md w-full border border-border shadow-md bg-surface"
        >
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
            className="w-12 h-12 bg-pink-50 border border-pink-200 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm"
          >
            <Heart className="w-6 h-6 text-secondary" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="font-display text-xl md:text-2xl font-black mb-2 text-text-primary"
          >
            You&apos;re amazing!
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="text-text-secondary text-xs md:text-sm leading-relaxed mb-6 font-semibold"
          >
            Your responses about <strong className="text-text-primary">{profile.display_name}</strong> have been saved.
            They will help generate their Social Mirror report.
          </motion.p>

          {/* Teaser Preview Block */}
          {teaser && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-4 rounded-xl bg-background border border-border mb-6 text-left shadow-inner"
            >
              <div className="text-[9px] font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5 font-display">
                <Sparkles className="w-3 h-3 text-primary animate-pulse" /> Teaser Preview
              </div>
              <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                {teaser.total_responses >= 3 ? (
                  <>
                    Based on {teaser.total_responses} responses, {teaser.display_name} might be a{" "}
                    <span className="blur-teaser inline-block px-1.5 py-0.5 rounded bg-zinc-200 text-text-primary font-extrabold select-none">
                      {teaser.archetype}
                    </span>
                    . Your answers just shifted their scores!
                  </>
                ) : (
                  <>
                    Based on {teaser.total_responses} response{teaser.total_responses !== 1 ? 's' : ''}, {teaser.display_name}&apos;s archetype is starting to shape up... Add yours to reveal it!
                  </>
                )}
              </p>
            </motion.div>
          )}

          <div className="space-y-3 relative z-10">
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Link href="/create" className="flex items-center justify-center gap-1.5 w-full px-5 py-3.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl text-xs md:text-sm font-bold transition-all shadow-sm hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] cursor-pointer">
                Create Your Own Mirror <Sparkles className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              onClick={handleShareStory}
              className="flex items-center justify-center gap-1.5 w-full px-5 py-3.5 bg-background border border-border text-text-primary rounded-xl text-xs md:text-sm font-bold transition-all hover:bg-surface-hover hover:border-primary/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <Camera className="w-4 h-4 text-secondary" /> Share to Instagram Story
            </motion.button>
          </div>

          <AnimatePresence>
            {copySuccess && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute bottom-4 left-4 right-4 bg-zinc-900 border border-zinc-700 text-white text-[11px] font-bold py-2.5 px-3 rounded-xl shadow-md z-20 flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5 text-accent animate-pulse" /> Link & sticker text copied to clipboard!
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    )
  }

  // ─── Welcome / Start Screen ───────────────────
  if (!started) {
    const initials = profile.display_name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none bg-dot-grid opacity-80" />
        <div className="absolute inset-0 z-0 pointer-events-none bg-pastel-gradient opacity-90" />
        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md text-center"
        >
          {/* Avatar */}
          <div className="w-20 h-20 rounded-3xl mx-auto mb-5 bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-display font-black text-white shadow-lg shadow-primary/10">
            {initials}
          </div>

          <h1 className="font-display text-2xl md:text-3xl font-black mb-2 text-text-primary leading-tight">
            Answer about <span className="text-gradient">{profile.display_name}</span>
          </h1>

          {profile.bio && (
            <p className="text-text-secondary text-sm italic mb-3 font-semibold">
              &quot;{profile.bio}&quot;
            </p>
          )}

          <p className="text-text-muted text-xs mb-8 font-bold">
            {questions.length} perception questions &middot; takes 2 mins
          </p>

          {/* Identity toggle */}
          <div className="glass-card p-5 mb-6.5 text-left border border-border shadow-sm bg-surface">
            <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-3">
              How do you want to respond?
            </div>
            <div className="flex gap-3 mb-1">
              <button
                onClick={() => setIsAnonymous(true)}
                className={`flex-1 py-3 px-3.5 rounded-xl text-xs md:text-sm font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                  isAnonymous 
                    ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                    : 'bg-background border-border text-text-secondary hover:bg-surface-hover'
                }`}
              >
                🕶️ Anonymous
              </button>
              <button
                onClick={() => setIsAnonymous(false)}
                className={`flex-1 py-3 px-3.5 rounded-xl text-xs md:text-sm font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                  !isAnonymous 
                    ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                    : 'bg-background border-border text-text-secondary hover:bg-surface-hover'
                }`}
              >
                <User className="w-3.5 h-3.5" /> With Name
              </button>
            </div>
            {!isAnonymous && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 overflow-hidden">
                <input
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-3 text-xs md:text-sm text-text-primary font-bold focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                  type="text"
                  placeholder="Enter your name"
                  value={respondentName}
                  onChange={e => setRespondentName(e.target.value)}
                />
              </motion.div>
            )}
          </div>

          <button
            onClick={() => setStarted(true)}
            disabled={!isAnonymous && !respondentName.trim()}
            className={`flex items-center justify-center gap-1.5 w-full py-3.5 rounded-xl text-xs md:text-sm font-black text-white transition-all shadow-md cursor-pointer ${
              (!isAnonymous && !respondentName.trim()) 
                ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed' 
                : 'bg-gradient-to-r from-primary to-secondary hover:opacity-95'
            }`}
          >
            Start Answering <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    )
  }

  // ─── Question Flow ────────────────────────────
  if (!question) return null

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden text-text-primary">
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-dot-grid opacity-80" />
      <div className="absolute inset-0 z-0 pointer-events-none bg-pastel-gradient opacity-90" />

      {/* Progress Bar */}
      <div className="sticky top-0 z-50">
        <div className="w-full h-1 bg-zinc-200/60">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="h-full bg-gradient-to-r from-primary to-secondary shadow-[0_0_8px_rgba(124,58,237,0.15)]"
          />
        </div>
        <div className="glass-panel flex items-center justify-between px-6 py-3 border-b border-border">
          <span className="text-[10px] md:text-xs font-bold text-text-secondary">
            {Object.keys(answers).length}/{questions.length} answered
          </span>
          <span className="text-[10px] md:text-xs font-bold text-primary font-display">
            for {profile.display_name}
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={question.id}
            custom={direction}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full max-w-xl"
          >
            {/* Question number */}
            <div className="inline-flex px-3.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-[10px] font-bold text-primary mb-5 font-display">
              Question {currentQ + 1}
            </div>

            {/* Question text */}
            <h2 className="font-display text-xl md:text-2xl lg:text-3xl font-black leading-snug mb-6 text-text-primary">
              {question.question_text}
            </h2>

            {/* Options */}
            <div className="flex flex-col gap-3">
              {question.options?.map((opt, i) => {
                const isSelected = answers[question.id]?.index === i
                const letter = String.fromCharCode(65 + i)
                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                    onClick={() => handleAnswer(question.id, opt.text, i)}
                    className={`
                      w-full flex items-center gap-3.5 p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer
                      ${isSelected 
                        ? 'bg-primary/10 border-primary shadow-sm z-10 relative' 
                        : 'bg-surface border-border hover:border-primary/20 hover:bg-surface-hover'}
                    `}
                  >
                    <div className={`
                       w-8.5 h-8.5 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-black transition-colors relative
                      ${isSelected ? 'bg-primary text-white shadow-sm' : 'bg-background border border-border text-text-secondary'}
                    `}>
                      {isSelected ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span>{letter}</span>
                      )}
                      <span className="absolute bottom-[2px] right-[2px] text-[7px] font-medium text-text-muted/60 hidden sm:inline">
                        {i + 1}
                      </span>
                    </div>
                    <span className={`text-sm md:text-base font-semibold ${isSelected ? 'text-primary font-bold' : 'text-text-primary'}`}>
                      {opt.text}
                    </span>
                  </motion.button>
                )
              })}
            </div>

            {/* Navigation */}
            <div className="flex gap-4 mt-8">
              {currentQ > 0 && (
                <button
                  onClick={() => { setDirection(-1); setCurrentQ(q => q - 1) }}
                  className="flex items-center justify-center gap-1.5 flex-1 max-w-[120px] bg-background border border-border text-text-secondary hover:bg-surface hover:border-primary/20 rounded-xl py-3.5 text-xs md:text-sm font-bold transition-all shadow-sm cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Prev
                </button>
              )}
              {currentQ < questions.length - 1 ? (
                <button
                  onClick={() => { if (answers[question.id]) { setDirection(1); setCurrentQ(q => q + 1) } }}
                  disabled={!answers[question.id]}
                  className={`flex items-center justify-center gap-1.5 flex-1 rounded-xl py-3.5 text-xs md:text-sm font-bold transition-all shadow-md cursor-pointer ${
                    answers[question.id] 
                      ? 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-95' 
                      : 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed shadow-none'
                  }`}
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : allAnswered ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`flex items-center justify-center gap-1.5 flex-1 rounded-xl py-3.5 text-xs md:text-sm font-bold transition-all shadow-lg cursor-pointer ${
                    submitting 
                      ? 'opacity-40 cursor-not-allowed bg-gradient-to-r from-primary to-secondary text-white' 
                      : 'bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white'
                  }`}
                >
                  {submitting ? 'Submitting...' : 'Submit Responses'} <Sparkles className="w-4 h-4" />
                </button>
              ) : (
                <button disabled className="flex-1 bg-zinc-100 text-zinc-400 border border-zinc-200 rounded-xl py-3.5 text-xs md:text-sm font-bold cursor-not-allowed">
                  Answer all questions
                </button>
              )}
            </div>
            
            {/* Keyboard tips */}
            <div className="hidden sm:block text-center mt-6 text-[10px] text-text-muted font-bold">
              💡 Tip: Use keyboard keys <span className="px-1.5 py-0.5 rounded bg-zinc-100 font-bold border border-border text-zinc-800">A</span> - <span className="px-1.5 py-0.5 rounded bg-zinc-100 font-bold border border-border text-zinc-800">D</span> or <span className="px-1.5 py-0.5 rounded bg-zinc-100 font-bold border border-border text-zinc-800">1</span> - <span className="px-1.5 py-0.5 rounded bg-zinc-100 font-bold border border-border text-zinc-800">4</span> to answer quickly.
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
