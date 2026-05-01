'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bookmark, Zap } from 'lucide-react'

/* ─── types ──────────────────────────────────────────────────── */
interface QuizOption {
  id: string
  text: string
  emoji?: string
}

interface QuizPlayerUIProps {
  currentQuestion?: number
  totalQuestions?: number
  question?: string
  image?: string
  options?: QuizOption[]
  onAnswer?: (optionId: string) => void
  onExit?: () => void
}

/* ─── component ─────────────────────────────────────────────── */
export function QuizPlayerUI({
  currentQuestion = 3,
  totalQuestions  = 10,
  question        = 'Which activity sounds most like you on a Friday night?',
  image           = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
  options = [
    { id: 'a', text: 'Binge-watching my favourite show alone', emoji: '📺' },
    { id: 'b', text: 'Party hopping with my squad',            emoji: '🎉' },
    { id: 'c', text: 'Gaming marathon until sunrise',          emoji: '🎮' },
    { id: 'd', text: 'Creating content for my socials',        emoji: '📸' },
  ],
  onAnswer,
  onExit,
}: QuizPlayerUIProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [saved, setSaved]       = useState(false)
  const progress = (currentQuestion / totalQuestions) * 100

  const handlePick = (id: string) => {
    if (selected) return
    setSelected(id)
    setTimeout(() => {
      onAnswer?.(id)
      setSelected(null)
    }, 500)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      fontFamily: 'var(--font-body)',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* ── top bar ─────────────────────────────────────────── */}
      <div style={{ padding: '52px 22px 18px', flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 18,
        }}>
          {/* exit */}
          <motion.button
            id="quiz-player-exit"
            whileTap={{ scale: 0.88 }}
            onClick={onExit}
            style={{
              width: 40, height: 40, borderRadius: 14,
              background: 'var(--surface)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--muted)',
            }}
          >
            <X size={18} />
          </motion.button>

          {/* question counter */}
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 3,
            fontFamily: 'var(--font-display)', fontWeight: 700,
          }}>
            <span style={{
              fontSize: 22,
              background: 'linear-gradient(135deg, var(--pink), var(--purple))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>{currentQuestion}</span>
            <span style={{ fontSize: 14, color: 'var(--muted)' }}>/ {totalQuestions}</span>
          </div>

          {/* bookmark */}
          <motion.button
            id="quiz-player-save"
            whileTap={{ scale: 0.88 }}
            onClick={() => setSaved(v => !v)}
            style={{
              width: 40, height: 40, borderRadius: 14,
              background: saved
                ? 'linear-gradient(135deg, var(--pink), var(--purple))'
                : 'var(--surface)',
              border: saved ? 'none' : '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: saved ? '#fff' : 'var(--muted)',
              transition: 'background 0.2s ease',
            }}
          >
            <Bookmark size={17} fill={saved ? 'currentColor' : 'none'} />
          </motion.button>
        </div>

        {/* progress track */}
        <div style={{
          height: 6, background: 'var(--surface2)',
          borderRadius: 100, overflow: 'hidden',
          position: 'relative',
        }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            style={{
              position: 'absolute', inset: '0 auto 0 0',
              background: 'linear-gradient(90deg, var(--pink), var(--purple))',
              borderRadius: 100,
              boxShadow: '0 0 10px rgba(255,107,157,0.5)',
            }}
          />
          {/* shimmer */}
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'linear', repeatDelay: 0.4 }}
            style={{
              position: 'absolute', inset: 0, width: '40%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
            }}
          />
        </div>
      </div>

      {/* ── scrollable content ───────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 22px 40px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: 'spring', stiffness: 310, damping: 28 }}
          >

            {/* ── question card ──────────────────────────────── */}
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 26, overflow: 'hidden', marginBottom: 20,
            }}>
              {/* image */}
              {image && (
                <div style={{ position: 'relative', height: 210, overflow: 'hidden' }}>
                  <img
                    src={image} alt="Question visual"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  {/* bottom scrim */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, var(--surface) 0%, rgba(18,18,26,0.5) 45%, transparent 100%)',
                  }} />

                  {/* streak badge */}
                  <div style={{
                    position: 'absolute', top: 14, right: 14,
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'rgba(10,10,15,0.72)', backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,214,10,0.3)',
                    borderRadius: 100, padding: '5px 12px',
                    fontSize: 12, fontWeight: 600, color: '#FFD60A',
                    fontFamily: 'var(--font-body)',
                  }}>
                    <Zap size={12} fill="#FFD60A" color="#FFD60A" />
                    On a roll!
                  </div>
                </div>
              )}

              {/* question text */}
              <div style={{ padding: image ? '14px 22px 22px' : '26px 22px' }}>
                <h2 style={{
                  fontFamily: 'var(--font-display)', fontWeight: 800,
                  fontSize: 'clamp(19px, 4vw, 24px)', lineHeight: 1.3,
                  color: 'var(--text)',
                }}>{question}</h2>
              </div>
            </div>

            {/* ── options ────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {options.map((opt, i) => {
                const isSelected = selected === opt.id
                const dimmed     = selected !== null && !isSelected

                return (
                  <motion.button
                    key={opt.id}
                    id={`player-opt-${opt.id}`}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: dimmed ? 0.38 : 1, y: 0 }}
                    transition={{ delay: i * 0.055, type: 'spring', stiffness: 300, damping: 24 }}
                    whileHover={!selected ? { x: 5, scale: 1.01 } : {}}
                    whileTap={!selected ? { scale: 0.97 } : {}}
                    onClick={() => handlePick(opt.id)}
                    style={{
                      width: '100%', padding: '16px 18px',
                      borderRadius: 18, border: 'none',
                      cursor: selected ? 'default' : 'pointer',
                      textAlign: 'left', display: 'flex',
                      alignItems: 'center', gap: 14,
                      background: isSelected
                        ? 'linear-gradient(135deg, var(--pink), var(--purple))'
                        : 'var(--surface)',
                      outline: isSelected ? 'none' : `1px solid var(--border)`,
                      boxShadow: isSelected
                        ? '0 8px 24px rgba(255,107,157,0.35)'
                        : 'none',
                      transition: 'opacity 0.25s ease',
                    }}
                  >
                    {/* emoji */}
                    {opt.emoji && (
                      <motion.span
                        animate={isSelected ? { scale: [1, 1.35, 1] } : { scale: 1 }}
                        transition={{ duration: 0.35 }}
                        style={{ fontSize: 26, flexShrink: 0, lineHeight: 1 }}
                      >
                        {opt.emoji}
                      </motion.span>
                    )}

                    {/* text */}
                    <span style={{
                      flex: 1, fontSize: 15, fontWeight: isSelected ? 700 : 500,
                      lineHeight: 1.4,
                      color: isSelected ? '#fff' : 'var(--text)',
                      fontFamily: 'var(--font-body)',
                    }}>
                      {opt.text}
                    </span>

                    {/* selected indicator */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          style={{
                            flexShrink: 0,
                            width: 22, height: 22, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <div style={{
                            width: 8, height: 8, borderRadius: '50%', background: '#fff',
                          }} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                )
              })}
            </div>

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
