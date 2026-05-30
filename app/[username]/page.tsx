'use client'

import { useState, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, User, Sparkles, Heart } from 'lucide-react'

interface QuestionData {
  id: string
  question_text: string
  question_type: string
  category: string
  options: { text: string; dimensions: Record<string, number> }[]
  order_num: number
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
  const [answers, setAnswers] = useState<Record<string, { value: string; index: number }>>({})
  const [respondentName, setRespondentName] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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

  const handleAnswer = (questionId: string, optionText: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: { value: optionText, index: optionIndex } }))
    // Auto-advance after short delay
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(q => q + 1)
      }
    }, 400)
  }

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-xl animate-pulse-glow">
          🪞
        </div>
      </div>
    )
  }

  // ─── Error / Not Found ────────────────────────
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="text-5xl mb-2">😕</div>
        <h1 className="font-display text-2xl font-bold text-text-primary">Profile not found</h1>
        <p className="text-text-secondary text-sm">{error || 'This mirror doesn\'t exist.'}</p>
        <Link href="/" className="mt-4 px-6 py-3 bg-zinc-900 text-white font-medium rounded-full hover:bg-zinc-800 transition-colors">
          Go Home
        </Link>
      </div>
    )
  }

  // ─── Submitted! ───────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
          className="relative z-10 glass-card p-10 text-center max-w-md w-full"
        >
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-500/20 animate-pulse-glow"
          >
            <Heart className="w-10 h-10 text-pink-500" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="font-display text-3xl font-extrabold mb-3 text-text-primary"
          >
            You&apos;re amazing!
          </h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="text-text-secondary text-base leading-relaxed mb-8"
          >
            Your responses about <strong className="text-text-primary">{profile.display_name}</strong> have been saved.
            They&apos;ll help build their Social Mirror report.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Link href="/create" className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold transition-all shadow-lg shadow-primary/30 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]">
              Create Your Own Mirror <Sparkles className="w-5 h-5" />
            </Link>
          </motion.div>
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
        <div className="absolute inset-0 z-0 pointer-events-none bg-pastel-gradient opacity-60" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md text-center"
        >
          {/* Avatar */}
          <div className="w-24 h-24 rounded-3xl mx-auto mb-6 bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl font-display font-extrabold text-white shadow-xl shadow-primary/30">
            {initials}
          </div>

          <h1 className="font-display text-3xl font-extrabold mb-3 text-text-primary">
            Answer about <span className="text-gradient">{profile.display_name}</span>
          </h1>

          {profile.bio && (
            <p className="text-text-secondary text-base italic mb-3">
              &quot;{profile.bio}&quot;
            </p>
          )}

          <p className="text-text-muted text-sm mb-10 font-medium">
            {questions.length} questions &middot; takes 2 minutes
          </p>

          {/* Identity toggle */}
          <div className="glass-card p-6 mb-8 text-left">
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">
              How do you want to respond?
            </div>
            <div className="flex gap-3 mb-2">
              <button
                onClick={() => setIsAnonymous(true)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all border flex items-center justify-center gap-2 ${
                  isAnonymous 
                    ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                    : 'bg-zinc-50 border-zinc-200 text-text-secondary hover:bg-zinc-100'
                }`}
              >
                🕶️ Anonymous
              </button>
              <button
                onClick={() => setIsAnonymous(false)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all border flex items-center justify-center gap-2 ${
                  !isAnonymous 
                    ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                    : 'bg-zinc-50 border-zinc-200 text-text-secondary hover:bg-zinc-100'
                }`}
              >
                <User className="w-4 h-4" /> With Name
              </button>
            </div>
            {!isAnonymous && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 overflow-hidden">
                <input
                  className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm text-text-primary font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
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
            className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-white transition-all shadow-xl shadow-primary/30 ${
              (!isAnonymous && !respondentName.trim()) 
                ? 'bg-zinc-300 shadow-none cursor-not-allowed text-zinc-500' 
                : 'bg-gradient-to-r from-primary to-secondary hover:opacity-90'
            }`}
          >
            Start Answering <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    )
  }

  // ─── Question Flow ────────────────────────────
  const question = questions[currentQ]
  if (!question) return null

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none bg-pastel-gradient opacity-20" />

      {/* Progress Bar */}
      <div className="sticky top-0 z-50">
        <div className="w-full h-1.5 bg-zinc-200">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="h-full bg-gradient-to-r from-primary to-secondary shadow-[0_0_10px_rgba(161,140,209,0.5)]"
          />
        </div>
        <div className="glass-panel flex items-center justify-between px-6 py-3 border-b-0 rounded-none">
          <span className="text-xs font-semibold text-text-muted">
            {Object.keys(answers).length}/{questions.length} answered
          </span>
          <span className="text-xs font-bold text-text-secondary">
            for {profile.display_name}
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-xl"
          >
            {/* Question number */}
            <div className="inline-flex px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mb-6">
              Question {currentQ + 1}
            </div>

            {/* Question text */}
            <h2 className="font-display text-2xl md:text-3xl font-bold leading-snug mb-8 text-text-primary">
              {question.question_text}
            </h2>

            {/* Options */}
            <div className="flex flex-col gap-3">
              {question.options?.map((opt, i) => {
                const isSelected = answers[question.id]?.index === i
                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(question.id, opt.text, i)}
                    className={`
                      w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-300
                      ${isSelected 
                        ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(161,140,209,0.3)] z-10 relative transform scale-[1.02]' 
                        : 'bg-white border-zinc-200 hover:border-primary/40 hover:bg-zinc-50'}
                    `}
                  >
                    <div className={`
                      w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold transition-colors
                      ${isSelected ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-zinc-100 text-text-muted'}
                    `}>
                      {isSelected ? <Check className="w-5 h-5" /> : String.fromCharCode(65 + i)}
                    </div>
                    <span className={`text-base md:text-lg font-medium ${isSelected ? 'text-primary font-bold' : 'text-text-primary'}`}>
                      {opt.text}
                    </span>
                  </motion.button>
                )
              })}
            </div>

            {/* Navigation */}
            <div className="flex gap-4 mt-10">
              {currentQ > 0 && (
                <button
                  onClick={() => setCurrentQ(q => q - 1)}
                  className="flex items-center justify-center gap-2 flex-1 max-w-[140px] bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-2xl py-4 font-bold transition-all shadow-sm"
                >
                  <ArrowLeft className="w-5 h-5" /> Prev
                </button>
              )}
              {currentQ < questions.length - 1 ? (
                <button
                  onClick={() => answers[question.id] && setCurrentQ(q => q + 1)}
                  disabled={!answers[question.id]}
                  className={`flex items-center justify-center gap-2 flex-1 rounded-2xl py-4 font-bold transition-all shadow-lg ${
                    answers[question.id] 
                      ? 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-zinc-900/20' 
                      : 'bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  Next <ArrowRight className="w-5 h-5" />
                </button>
              ) : allAnswered ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`flex items-center justify-center gap-2 flex-1 rounded-2xl py-4 font-bold transition-all shadow-xl shadow-primary/30 ${
                    submitting 
                      ? 'opacity-50 cursor-not-allowed bg-gradient-to-r from-primary to-secondary text-white' 
                      : 'bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white'
                  }`}
                >
                  {submitting ? 'Submitting...' : 'Submit Responses'} <Sparkles className="w-5 h-5" />
                </button>
              ) : (
                <button disabled className="flex-1 bg-zinc-100 text-zinc-400 rounded-2xl py-4 font-bold cursor-not-allowed">
                  Answer all questions
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
