'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Clock, ArrowRight, Share2, Copy, CheckCircle2, XCircle, Gamepad2, ArrowLeft, AlertTriangle, Star } from 'lucide-react'

type Question = {
  id: string
  question_text: string
  options: string[]
  correct_index: number
  order_num: number
}

type Quiz = {
  id: string
  slug: string
  title: string
  category: string
  creator_name: string
  questions: Question[]
}

type LeaderboardEntry = {
  player_name: string
  score: number
  total: number
  time_taken_sec: number | null
  created_at: string
}

function AdSlot({ code }: { code?: string | null }) {
  if (code) {
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: code }} 
        className="my-6 w-full overflow-hidden rounded-2xl border border-border bg-surface p-4 text-center shadow-inner" 
      />
    )
  }
  return (
    <div className="my-6 p-4 rounded-2xl border border-dashed border-border bg-surface text-center text-[10px] text-text-muted font-bold tracking-widest uppercase select-none">
      Ad Space
    </div>
  )
}

function fmtTime(sec: number | null) {
  if (sec === null || sec === undefined) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

const MEDALS = ['🥇', '🥈', '🥉']

export default function PlayPage() {
  const params = useParams()
  const slug = params.slug as string

  const [quiz, setQuiz]         = useState<Quiz | null>(null)
  const [ads, setAds]           = useState<Record<string, string | boolean | null> | null>(null)
  const [loadingQuiz, setLoadingQuiz] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Game state
  const [phase, setPhase]           = useState<'name' | 'playing' | 'done'>('name')
  const [playerName, setPlayerName] = useState('')
  const [current, setCurrent]       = useState(0)
  const [selected, setSelected]     = useState<number | null>(null)
  const [score, setScore]           = useState(0)
  const [startTime, setStartTime]   = useState(0)
  const [timeTaken, setTimeTaken]   = useState(0)

  // Copy status
  const [copied, setCopied] = useState(false)

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [lbLoading, setLbLoading]     = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/quizzes/${slug}`).then(r => r.ok ? r.json() : null),
      fetch('/api/ads').then(r => r.json()).catch(() => null),
    ]).then(([quizData, adsData]) => {
      if (!quizData?.quiz) { 
        setNotFound(true)
        setLoadingQuiz(false)
        return 
      }
      setQuiz(quizData.quiz)
      setAds(adsData?.ads)
      setLoadingQuiz(false)
    })
  }, [slug])

  const fetchLeaderboard = useCallback(async (quizId: string) => {
    setLbLoading(true)
    try {
      const res = await fetch(`/api/scores?quiz_id=${quizId}`)
      const data = await res.json()
      setLeaderboard(data.leaderboard ?? [])
    } catch { /* silent */ } finally {
      setLbLoading(false)
    }
  }, [])

  const handleStart = () => {
    if (!playerName.trim()) return
    setPhase('playing')
    setStartTime(Date.now())
  }

  const handleSelect = useCallback(async (idx: number) => {
    if (selected !== null || !quiz) return
    setSelected(idx)
    const isCorrect = idx === quiz.questions[current].correct_index
    const newScore = isCorrect ? score + 1 : score
    if (isCorrect) setScore(newScore)

    await new Promise(r => setTimeout(r, 1100))

    if (current + 1 < quiz.questions.length) {
      setCurrent(c => c + 1)
      setSelected(null)
    } else {
      const secs = Math.round((Date.now() - startTime) / 1000)
      setTimeTaken(secs)
      try {
        await fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quiz_id: quiz.id,
            player_name: playerName,
            score: newScore,
            total: quiz.questions.length,
            time_taken_sec: secs,
          }),
        })
      } catch {}
      setPhase('done')
      fetchLeaderboard(quiz.id)
    }
  }, [selected, quiz, current, score, playerName, startTime, fetchLeaderboard])

  // Keyboard Shortcuts for Game
  useEffect(() => {
    if (phase !== 'playing' || selected !== null || !quiz) return

    const q = quiz.questions[current]
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase()
      let idx = -1
      if (key === 'A' || key === '1') idx = 0
      else if (key === 'B' || key === '2') idx = 1
      else if (key === 'C' || key === '3') idx = 2
      else if (key === 'D' || key === '4') idx = 3

      if (idx >= 0 && idx < q.options.length) {
        handleSelect(idx)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [phase, selected, current, quiz, handleSelect])

  const quizUrl = typeof window !== 'undefined' ? window.location.href : ''

  const handleCopy = () => {
    if (!quiz) return
    navigator.clipboard.writeText(`I scored ${score}/${quiz.questions.length} on "${quiz.title}"! Can you beat my score? Try it: ${quizUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── LOADING ───────────────────────────────────────────────────
  if (loadingQuiz) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none bg-dot-grid opacity-80" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-primary/5 rounded-full blur-[90px] pointer-events-none" />
        
        <div className="relative z-10 text-center">
          <div className="text-4xl mb-4 animate-float text-primary">🎯</div>
          <div className="w-12 h-1.5 bg-zinc-200/60 rounded-full mx-auto overflow-hidden relative">
            <div className="absolute h-full w-1/2 bg-gradient-to-r from-primary to-secondary rounded-full animate-shimmer" style={{ left: 0 }} />
          </div>
          <p className="text-text-secondary text-xs font-bold uppercase tracking-wider mt-4">Loading quiz...</p>
        </div>
      </div>
    )
  }

  // ── NOT FOUND ──────────────────────────────────────────────────
  if (notFound || !quiz) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden text-text-primary">
        <div className="absolute inset-0 z-0 pointer-events-none bg-dot-grid opacity-80" />
        <div className="relative z-10 w-full max-w-sm glass-card p-8 text-center border border-border shadow-md bg-surface">
          <div className="w-14 h-14 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto mb-6 text-rose-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="font-display text-2xl font-black mb-3">Quiz Not Found</h2>
          <p className="text-text-secondary text-xs leading-relaxed mb-6 font-semibold">
            This trivia challenge might have been deleted, or the URL contains a typo. Check your link and try again.
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-light transition-colors font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const q = quiz.questions[current]
  const pct = Math.round((score / quiz.questions.length) * 100)
  
  const resultMsg = pct >= 80 ? '👑 Mastermind Rank!'
    : pct >= 50 ? '🧠 Pretty sharp! Well done.'
    : '😅 Need to hit the books!'

  const radius = 70
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (pct / 100) * circumference

  return (
    <div className="min-h-screen bg-background relative flex flex-col text-text-primary overflow-x-hidden">
      {/* Background Dots Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-dot-grid opacity-90" />
      <div className="absolute inset-0 z-0 pointer-events-none bg-pastel-gradient opacity-95" />

      {/* Navbar */}
      <nav className="glass-panel sticky top-0 z-50 flex items-center justify-between px-6 py-4 md:px-10 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg">✦</span>
          <span className="text-gradient font-display font-black text-sm md:text-base tracking-tight">Quizly</span>
        </Link>
        {phase === 'playing' && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-primary/10 border border-primary/20 text-primary">
            <Trophy className="w-3.5 h-3.5" />
            <span>Score: {score}</span>
          </div>
        )}
      </nav>

      <main className="flex-1 max-w-xl mx-auto w-full px-6 py-12 relative z-10 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          
          {/* ── NAME ENTRY PHASE ──────────────────────── */}
          {phase === 'name' && (
            <motion.div
              key="name-entry"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary shadow-sm">
                  <Gamepad2 className="w-8 h-8" />
                </div>
                <h1 className="font-display text-3xl font-black tracking-tight mb-2 leading-tight">
                  {quiz.title}
                </h1>
                <p className="text-text-secondary text-xs font-bold uppercase tracking-wider mb-5">
                  by {quiz.creator_name}
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border text-[10px] font-bold text-text-secondary shadow-sm">
                  <span>{quiz.questions.length} Questions</span>
                  <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                  <span>Leaderboard Enabled</span>
                </div>
              </div>

              {ads?.player_start_enabled && <AdSlot code={ads.player_start_code as string} />}

              <div className="glass-card p-6 md:p-8 border border-border shadow-md mb-6 bg-surface">
                <div className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2.5">
                      Your Name
                    </label>
                    <input
                      value={playerName}
                      onChange={e => setPlayerName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleStart()}
                      placeholder="e.g. Captain Trivia"
                      className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none font-bold text-sm shadow-inner"
                      autoFocus
                    />
                  </div>

                  <button 
                    onClick={handleStart} 
                    disabled={!playerName.trim()}
                    className={`w-full py-4 rounded-2xl font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                      playerName.trim() 
                        ? 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] shadow-primary/10 border-0' 
                        : 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed shadow-none'
                    }`}
                  >
                    Start Trivia 🚀
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── QUESTION PLAYING PHASE ────────────────── */}
          {phase === 'playing' && (
            <motion.div
              key="playing-quiz"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full"
            >
              <div className="mb-8">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
                    Question {current + 1} of {quiz.questions.length}
                  </span>
                  <span className="text-xs font-bold text-primary">
                    {playerName}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-zinc-200/60 rounded-full border border-border overflow-hidden">
                  <motion.div 
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                    initial={{ width: `${(current / quiz.questions.length) * 100}%` }}
                    animate={{ width: `${((current) / quiz.questions.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Question Text */}
              <h2 className="font-display text-xl md:text-2xl font-black mb-8 leading-snug">
                {q.question_text}
              </h2>

              {/* Options Grid */}
              <div className="flex flex-col gap-3.5">
                {q.options.map((opt, idx) => {
                  const isSelected = selected === idx
                  const isCorrect = idx === q.correct_index
                  const isIncorrect = isSelected && !isCorrect
                  const showAnswers = selected !== null

                  let optionClass = "group w-full flex items-center justify-between p-4.5 rounded-2xl border text-left font-bold transition-all duration-300 relative overflow-hidden "
                  if (!showAnswers) {
                    optionClass += "bg-surface border-border hover:border-primary/25 hover:bg-surface-hover hover:translate-x-1.5 text-text-primary cursor-pointer"
                  } else {
                    if (isCorrect) {
                      optionClass += "bg-emerald-50 border-emerald-300 text-emerald-600 shadow-sm"
                    } else if (isIncorrect) {
                      optionClass += "bg-pink-50 border-rose-300 text-rose-500 shadow-sm"
                    } else {
                      optionClass += "bg-zinc-50 border-zinc-200 text-zinc-400 opacity-40 cursor-default"
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      disabled={showAnswers}
                      className={optionClass}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-display text-[11px] font-black transition-all ${
                          showAnswers && isCorrect 
                            ? 'bg-emerald-500 text-white' 
                            : showAnswers && isIncorrect 
                              ? 'bg-rose-500 text-white' 
                              : 'bg-background text-text-secondary border border-border'
                        }`}>
                          {['A', 'B', 'C', 'D'][idx]}
                        </span>
                        <span className="text-sm md:text-base pr-4 leading-normal font-semibold">{opt}</span>
                      </div>

                      {showAnswers && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      )}
                      {showAnswers && isIncorrect && (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      )}
                      {!showAnswers && (
                        <span className="text-[10px] text-text-muted font-bold font-mono px-1.5 py-0.5 rounded bg-zinc-100 border border-border opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          {['A', 'B', 'C', 'D'][idx]}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── RESULT & LEADERBOARD PHASE ───────────── */}
          {phase === 'done' && (
            <motion.div
              key="done-quiz"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full space-y-6"
            >
              {/* Score card summary */}
              <div className="glass-card p-6 md:p-8 text-center border border-border shadow-md bg-surface relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                  <Star className="w-40 h-40 text-primary animate-pulse" />
                </div>

                {/* Animated Score Ring */}
                <div className="relative w-40 h-40 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      className="stroke-zinc-100 fill-none"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="80"
                      cy="80"
                      r={radius}
                      className="stroke-primary fill-none"
                      strokeWidth="8"
                      strokeLinecap="round"
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      style={{ strokeDasharray: circumference }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-black font-display text-gradient leading-none">{score} / {quiz.questions.length}</span>
                    <span className="text-[10px] text-text-muted mt-1 font-bold tracking-widest uppercase">{pct}% accuracy</span>
                  </div>
                </div>

                {ads?.result_page_enabled && <AdSlot code={ads.result_page_code as string} />}

                <h2 className="font-display text-2xl font-black mb-2 text-text-primary">
                  {resultMsg}
                </h2>
                <p className="text-text-secondary text-xs font-semibold mb-4 leading-relaxed">
                  Congratulations {playerName}! You completed the trivia challenges in <span className="text-text-primary">{fmtTime(timeTaken)}</span>.
                </p>

                {/* Share Deck */}
                <div className="border-t border-border pt-5 mt-5">
                  <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3.5">
                    Share your rank with friends
                  </div>
                  <div className="flex gap-2 justify-center flex-wrap">
                    <button 
                      onClick={handleCopy} 
                      className={`px-4.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        copied 
                          ? 'bg-emerald-50 border border-emerald-250 text-emerald-600' 
                          : 'bg-background border border-border hover:bg-surface text-text-primary shadow-sm'
                      }`}
                    >
                      <Copy className="w-3.5 h-3.5 text-primary" />
                      <span>{copied ? 'Copied score!' : 'Copy Score'}</span>
                    </button>
                    <button 
                      onClick={() => window.open(`https://twitter.com/intent/tweet?text=I scored ${score}/${quiz.questions.length} on "${quiz.title}"! Try it and beat my rank: ${quizUrl}`)} 
                      className="px-4.5 py-2.5 bg-[#1DA1F2]/5 border border-[#1DA1F2]/15 text-[#1DA1F2] rounded-xl text-xs font-bold hover:bg-[#1DA1F2]/10 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Post on X</span>
                    </button>
                    <button 
                      onClick={() => window.open(`https://wa.me/?text=I scored ${score}/${quiz.questions.length} on "${quiz.title}"! Try it and beat my rank: ${quizUrl}`)} 
                      className="px-4.5 py-2.5 bg-[#25D366]/5 border border-[#25D366]/15 text-[#25D366] rounded-xl text-xs font-bold hover:bg-[#25D366]/10 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Leaderboard panel ────────────────────── */}
              <div className="glass-card p-6 border border-border shadow-sm bg-surface">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                    <Trophy className="w-4.5 h-4.5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-text-primary">Leaderboard Rankings</h3>
                    <p className="text-[10px] text-text-secondary font-semibold">Global scores for {quiz.title}</p>
                  </div>
                </div>

                {lbLoading ? (
                  <div className="text-center py-6 text-text-muted text-xs font-bold uppercase tracking-wider">
                    Loading rankings...
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-6 text-text-muted text-xs font-semibold">
                    No records on this leaderboard yet. Be the first to claim #1!
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {leaderboard.map((entry, rank) => {
                      const isYou = entry.player_name.trim().toLowerCase() === playerName.trim().toLowerCase()
                      const entryPct = Math.round((entry.score / entry.total) * 100)
                      return (
                        <div 
                          key={rank} 
                          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                            isYou 
                              ? 'bg-primary/5 border-primary/30 shadow-inner' 
                              : 'bg-background border-border'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Rank Indicator */}
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-display text-[10px] font-black ${
                              rank < 3 ? 'bg-zinc-100 border border-border' : 'text-text-secondary font-mono'
                            }`}>
                              {rank < 3 ? MEDALS[rank] : `#${rank + 1}`}
                            </div>

                            <div className="min-w-0">
                              <div className={`font-bold text-sm truncate flex items-center gap-1.5 ${
                                isYou ? 'text-primary' : 'text-text-primary'
                              }`}>
                                {entry.player_name}
                                {isYou && (
                                  <span className="text-[9px] font-bold bg-primary px-1.5 py-0.5 rounded-md text-white select-none">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-text-muted flex items-center gap-1.5 mt-0.5 font-semibold">
                                <Clock className="w-3 h-3 text-text-muted" />
                                <span>{fmtTime(entry.time_taken_sec)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0 flex flex-col items-end pl-2">
                            <span className="text-xs font-black text-text-primary">
                              {entry.score} / {entry.total}
                            </span>
                            <div className="w-16 h-1 bg-zinc-100 rounded-full mt-1.5 overflow-hidden border border-zinc-200/60">
                              <div 
                                className="h-full rounded-full" 
                                style={{
                                  width: `${entryPct}%`,
                                  background: isYou
                                    ? 'linear-gradient(90deg, #7c3aed, #ec4899)'
                                    : rank === 0
                                      ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                                      : '#8e8e93'
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Backing buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link 
                  href="/create" 
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs text-center hover:opacity-95 transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-1 cursor-pointer border-0"
                >
                  Create Your Own Quiz <ArrowRight className="w-4 h-4" />
                </Link>
                <Link 
                  href="/" 
                  className="flex-1 py-3.5 rounded-xl bg-background border border-border text-text-secondary hover:bg-surface font-bold text-xs text-center transition-all shadow-sm cursor-pointer"
                >
                  Browse Home
                </Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  )
}
