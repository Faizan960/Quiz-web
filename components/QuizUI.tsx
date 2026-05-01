'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Trophy, Share2, RotateCcw, Clock, CheckCircle, XCircle } from 'lucide-react'

/* ─── types ──────────────────────────────────────────────────── */
interface Question {
  id: string
  question_text: string
  options: string[]
  correct_index: number
}

interface LeaderboardEntry {
  player_name: string
  score: number
  total: number
  time_taken_sec: number | null
}

interface QuizUIProps {
  title?: string
  category?: string
  creatorName?: string
  questions?: Question[]
  leaderboard?: LeaderboardEntry[]
  onBack?: () => void
  onShareScore?: (score: number, total: number) => void
}

/* ─── mock fallback ──────────────────────────────────────────── */
const MOCK_QUESTIONS: Question[] = [
  { id: '1', question_text: 'Which Gen-Z slang means "that was embarrassing"?', options: ['No cap', 'Slay', 'Caught in 4K', 'Bussin'], correct_index: 2 },
  { id: '2', question_text: 'What does "NPC" stand for in gaming culture?', options: ['Non-Player Character', 'New Player Code', 'No Personal Content', 'Next Player Call'], correct_index: 0 },
  { id: '3', question_text: 'Which app popularised the "For You Page"?', options: ['Instagram', 'Snapchat', 'TikTok', 'YouTube'], correct_index: 2 },
  { id: '4', question_text: '"Rizz" is most closely related to which skill?', options: ['Dancing', 'Cooking', 'Charisma', 'Gaming'], correct_index: 2 },
]

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { player_name: 'Sophie M.',  score: 4, total: 4, time_taken_sec: 28 },
  { player_name: 'Jake R.',    score: 3, total: 4, time_taken_sec: 35 },
  { player_name: 'Priya K.',   score: 3, total: 4, time_taken_sec: 41 },
]

const MEDALS = ['🥇', '🥈', '🥉']
const LABELS = ['A', 'B', 'C', 'D']

function fmt(sec: number | null) {
  if (!sec) return '—'
  const m = Math.floor(sec / 60), s = sec % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

/* ─── sub-screens ────────────────────────────────────────────── */
function NameScreen({ title, category, creator, total, onStart }: {
  title: string; category: string; creator: string; total: number
  onStart: (name: string) => void
}) {
  const [name, setName] = useState('')
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: 'center', padding: '48px 0' }}
    >
      <motion.div
        animate={{ rotate: [0, 10, 0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        style={{ fontSize: 64, marginBottom: 24, display: 'inline-block' }}
      >🎯</motion.div>

      {/* category chip */}
      <div style={{
        display: 'inline-block', padding: '4px 14px', borderRadius: 100,
        background: 'rgba(199,125,255,0.12)', border: '1px solid rgba(199,125,255,0.25)',
        color: 'var(--purple)', fontSize: 12, fontWeight: 600,
        fontFamily: 'var(--font-body)', marginBottom: 20,
      }}>{category}</div>

      <h1 style={{
        fontFamily: 'var(--font-display)', fontWeight: 800,
        fontSize: 'clamp(26px, 5vw, 38px)', lineHeight: 1.1, marginBottom: 12,
      }}>{title}</h1>

      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 4 }}>by {creator}</p>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 40 }}>
        {total} questions · your score goes on the leaderboard 🏆
      </p>

      {/* name input card */}
      <div style={{
        maxWidth: 340, margin: '0 auto 32px',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 20, padding: 24, textAlign: 'left',
      }}>
        <label style={{
          display: 'block', fontSize: 11, fontWeight: 600,
          color: 'var(--muted)', textTransform: 'uppercase',
          letterSpacing: '0.1em', marginBottom: 10,
          fontFamily: 'var(--font-body)',
        }}>Your Name</label>
        <input
          id="quiz-player-name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && name.trim() && onStart(name.trim())}
          placeholder="Enter your name…"
          autoFocus
          style={{
            width: '100%', background: 'var(--surface2)',
            border: '1px solid var(--border)', borderRadius: 12,
            padding: '13px 16px', color: 'var(--text)',
            fontFamily: 'var(--font-body)', fontSize: 15, outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => (e.target.style.borderColor = 'rgba(199,125,255,0.5)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />
      </div>

      <motion.button
        id="quiz-start-btn"
        whileHover={name.trim() ? { scale: 1.05, boxShadow: '0 10px 28px rgba(255,107,157,0.4)' } : {}}
        whileTap={name.trim() ? { scale: 0.95 } : {}}
        disabled={!name.trim()}
        onClick={() => onStart(name.trim())}
        style={{
          padding: '15px 44px', borderRadius: 100, border: 'none',
          background: name.trim()
            ? 'linear-gradient(135deg, var(--pink), var(--purple))'
            : 'rgba(255,107,157,0.2)',
          color: name.trim() ? 'white' : 'rgba(255,255,255,0.3)',
          fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 16,
          cursor: name.trim() ? 'pointer' : 'not-allowed',
          transition: 'background 0.2s ease',
        }}
      >Start Quiz 🚀</motion.button>
    </motion.div>
  )
}

function PlayScreen({ questions, playerName, onDone }: {
  questions: Question[]; playerName: string
  onDone: (score: number, timeSec: number) => void
}) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [startMs] = useState(() => Date.now())

  const q = questions[current]
  const progress = ((current) / questions.length) * 100

  const handlePick = useCallback(async (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    const correct = idx === q.correct_index
    const newScore = correct ? score + 1 : score
    if (correct) setScore(newScore)

    await new Promise(r => setTimeout(r, 950))

    if (current + 1 < questions.length) {
      setCurrent(c => c + 1)
      setSelected(null)
    } else {
      onDone(newScore, Math.round((Date.now() - startMs) / 1000))
    }
  }, [selected, q, score, current, questions.length, startMs, onDone])

  return (
    <div>
      {/* progress header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 10,
        }}>
          <span style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-body)' }}>
            Question {current + 1} / {questions.length}
          </span>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 13, color: 'var(--pink)', fontWeight: 600,
            fontFamily: 'var(--font-body)',
          }}>
            <Trophy size={13} />
            {score} pts
          </span>
        </div>

        {/* track */}
        <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 100, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              height: '100%', borderRadius: 100,
              background: 'linear-gradient(90deg, var(--pink), var(--purple))',
              boxShadow: '0 0 10px rgba(255,107,157,0.4)',
            }}
          />
        </div>
      </div>

      {/* question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        >
          {/* player chip */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 100, marginBottom: 20,
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
            fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-body)',
          }}>
            <span style={{ fontSize: 14 }}>👤</span> {playerName}
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 'clamp(20px, 4vw, 26px)', lineHeight: 1.3, marginBottom: 28,
          }}>{q.question_text}</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {q.options.map((opt, idx) => {
              const isCorrect  = idx === q.correct_index
              const isSelected = idx === selected
              const revealed   = selected !== null

              let bg     = 'var(--surface)'
              let border = '1px solid var(--border)'
              let color  = 'var(--text)'
              let icon   = null

              if (revealed) {
                if (isCorrect)  { bg = 'rgba(6,214,160,0.1)';  border = '1px solid var(--green)'; color = 'var(--green)';  icon = <CheckCircle size={16} /> }
                if (isSelected && !isCorrect) { bg = 'rgba(255,77,109,0.1)'; border = '1px solid var(--red)'; color = 'var(--red)'; icon = <XCircle size={16} /> }
              }

              return (
                <motion.button
                  key={idx}
                  id={`answer-option-${idx}`}
                  whileHover={!revealed ? { x: 6 } : {}}
                  whileTap={!revealed ? { scale: 0.98 } : {}}
                  onClick={() => handlePick(idx)}
                  disabled={revealed}
                  style={{
                    padding: '16px 20px', borderRadius: 16,
                    background: bg, border, color,
                    fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500,
                    textAlign: 'left', cursor: revealed ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 14,
                    transition: 'background 0.25s ease, border-color 0.25s ease, color 0.25s ease',
                  }}
                >
                  {/* letter badge */}
                  <span style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: revealed && isCorrect
                      ? 'rgba(6,214,160,0.2)'
                      : revealed && isSelected
                        ? 'rgba(255,77,109,0.2)'
                        : 'rgba(255,255,255,0.06)',
                    fontSize: 12, fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                    color: revealed ? 'inherit' : 'var(--muted)',
                  }}>
                    {LABELS[idx]}
                  </span>
                  <span style={{ flex: 1 }}>{opt}</span>
                  {icon && <span style={{ flexShrink: 0 }}>{icon}</span>}
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function ResultScreen({ score, total, timeSec, playerName, leaderboard, onRetry, onShare }: {
  score: number; total: number; timeSec: number; playerName: string
  leaderboard: LeaderboardEntry[]; onRetry: () => void; onShare: () => void
}) {
  const pct = Math.round((score / total) * 100)
  const msg = pct >= 80 ? '🔥 Crushed it!' : pct >= 50 ? '😄 Not bad at all!' : '😅 Room to grow!'
  const circumference = 2 * Math.PI * 52

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

      {/* score ring */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 24 }}>
          <svg width={128} height={128} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={64} cy={64} r={52} fill="none" stroke="var(--surface2)" strokeWidth={10} />
            <motion.circle
              cx={64} cy={64} r={52} fill="none"
              stroke="url(#ring-grad)" strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference * (1 - pct / 100) }}
              transition={{ duration: 1.1, ease: 'easeOut', delay: 0.2 }}
            />
            <defs>
              <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF6B9D" />
                <stop offset="100%" stopColor="#C77DFF" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26,
              background: 'linear-gradient(135deg, var(--pink), var(--purple))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>{score}/{total}</span>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{pct}%</span>
          </div>
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 26, marginBottom: 8,
        }}>{playerName}, {msg}</h2>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--muted)', fontSize: 13 }}>
          <Clock size={13} />
          {fmt(timeSec)}
        </div>
      </div>

      {/* action buttons */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 36, flexWrap: 'wrap' }}>
        <motion.button
          id="result-share-btn"
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={onShare}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '13px 28px', borderRadius: 100, border: 'none',
            background: 'linear-gradient(135deg, var(--pink), var(--purple))',
            color: 'white', fontFamily: 'var(--font-body)', fontWeight: 700,
            fontSize: 14, cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(255,107,157,0.3)',
          }}
        >
          <Share2 size={15} /> Share Score
        </motion.button>

        <motion.button
          id="result-retry-btn"
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '13px 24px', borderRadius: 100,
            background: 'var(--surface)', border: '1px solid var(--border)',
            color: 'var(--muted)', fontFamily: 'var(--font-body)',
            fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}
        >
          <RotateCcw size={14} /> Try Again
        </motion.button>
      </div>

      {/* leaderboard */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 24, overflow: 'hidden',
      }}>
        {/* header */}
        <div style={{
          padding: '20px 22px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Trophy size={18} color="var(--yellow)" />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Leaderboard</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>Top players this quiz</div>
          </div>
        </div>

        {/* entries */}
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--muted)', fontSize: 14 }}>
              You&apos;re the first! 🎉
            </div>
          ) : (
            leaderboard.map((entry, rank) => {
              const isYou    = entry.player_name === playerName
              const entryPct = Math.round((entry.score / entry.total) * 100)
              return (
                <motion.div
                  key={rank}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: rank * 0.06 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 14,
                    background: isYou ? 'rgba(255,107,157,0.08)' : 'var(--surface2)',
                    border: isYou ? '1px solid rgba(255,107,157,0.3)' : '1px solid var(--border)',
                  }}
                >
                  {/* rank */}
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: rank < 3 ? 'rgba(255,107,157,0.1)' : 'transparent',
                    fontSize: rank < 3 ? 16 : 12, fontWeight: 700,
                    color: rank >= 3 ? 'var(--muted)' : undefined,
                  }}>
                    {rank < 3 ? MEDALS[rank] : `#${rank + 1}`}
                  </div>

                  {/* name + time */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 600, fontSize: 14,
                      color: isYou ? 'var(--pink)' : 'var(--text)',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      {entry.player_name}
                      {isYou && (
                        <span style={{
                          fontSize: 10, background: 'var(--pink)', color: '#fff',
                          padding: '1px 6px', borderRadius: 100, fontWeight: 700,
                        }}>YOU</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={10} /> {fmt(entry.time_taken_sec)}
                    </div>
                  </div>

                  {/* score bar */}
                  <div style={{ width: 72, flexShrink: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: isYou ? 'var(--pink)' : 'var(--text)' }}>
                        {entry.score}/{entry.total}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--muted)' }}>{entryPct}%</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--surface)', borderRadius: 100, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${entryPct}%` }}
                        transition={{ duration: 0.7, delay: rank * 0.06 + 0.3 }}
                        style={{
                          height: '100%', borderRadius: 100,
                          background: isYou
                            ? 'linear-gradient(90deg, var(--pink), var(--purple))'
                            : rank === 0
                              ? 'linear-gradient(90deg, #FFD700, #FFA500)'
                              : 'rgba(199,125,255,0.45)',
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ─── main component ─────────────────────────────────────────── */
export function QuizUI({
  title       = 'Which Gen-Z Icon Are You? 🎭',
  category    = 'Personality',
  creatorName = 'Alex Johnson',
  questions   = MOCK_QUESTIONS,
  leaderboard = MOCK_LEADERBOARD,
  onBack,
  onShareScore,
}: QuizUIProps) {
  const [phase, setPhase]           = useState<'name' | 'playing' | 'done'>('name')
  const [playerName, setPlayerName] = useState('')
  const [score, setScore]           = useState(0)
  const [timeSec, setTimeSec]       = useState(0)

  const handleStart = (name: string) => {
    setPlayerName(name)
    setPhase('playing')
  }

  const handleDone = useCallback((s: number, t: number) => {
    setScore(s)
    setTimeSec(t)
    setPhase('done')
  }, [])

  const handleRetry = () => {
    setScore(0)
    setTimeSec(0)
    setPhase('name')
  }

  const handleShare = () => {
    onShareScore?.(score, questions.length)
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: `I got ${score}/${questions.length} on "${title}"!`, url: window.location.href })
        .catch(() => {})
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>

      {/* ── top nav ──────────────────────────────────────────── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <motion.button
          id="quiz-back-btn"
          whileTap={{ scale: 0.88 }}
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--muted)', fontFamily: 'var(--font-body)',
            fontSize: 14, fontWeight: 500,
          }}
        >
          <ArrowLeft size={18} /> Back
        </motion.button>

        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18,
          background: 'linear-gradient(135deg, var(--pink), var(--purple))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>Quizly✦</div>

        {/* category pill */}
        <div style={{
          padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600,
          background: 'rgba(199,125,255,0.12)', border: '1px solid rgba(199,125,255,0.25)',
          color: 'var(--purple)',
        }}>{category}</div>
      </nav>

      {/* ── content ─────────────────────────────────────────── */}
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px 80px' }}>
        <AnimatePresence mode="wait">
          {phase === 'name' && (
            <motion.div key="name" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <NameScreen
                title={title} category={category}
                creator={creatorName} total={questions.length}
                onStart={handleStart}
              />
            </motion.div>
          )}

          {phase === 'playing' && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PlayScreen
                questions={questions}
                playerName={playerName}
                onDone={handleDone}
              />
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ResultScreen
                score={score} total={questions.length}
                timeSec={timeSec} playerName={playerName}
                leaderboard={leaderboard}
                onRetry={handleRetry}
                onShare={handleShare}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
