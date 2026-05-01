'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Share2, Copy, RefreshCw, Download, Check } from 'lucide-react'

/* ─── types ──────────────────────────────────────────────────── */
interface ResultScreenUIProps {
  title?: string
  description?: string
  avatar?: string
  quizTitle?: string
  score?: number
  total?: number
  timeSec?: number
  onShare?: (platform: string) => void
  onTryAnother?: () => void
}

/* ─── confetti particle ──────────────────────────────────────── */
const CONFETTI_COLORS = ['#FF6B9D', '#C77DFF', '#00D4FF', '#FFD60A', '#06D6A0']
const CONFETTI_COUNT  = 38

function Confetti() {
  const particles = Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left:  `${(i / CONFETTI_COUNT) * 100}%`,
    delay: (i * 0.04) % 1.2,
    dur:   2 + (i % 4) * 0.4,
    size:  6 + (i % 3) * 3,
    rotate: i % 2 === 0 ? 360 : -360,
  }))

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: 0, opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', rotate: p.rotate, opacity: [1, 1, 0] }}
          transition={{ duration: p.dur, delay: p.delay, ease: 'easeIn' }}
          style={{
            position: 'absolute',
            left: p.left,
            top: 0,
            width: p.size,
            height: p.size,
            borderRadius: p.id % 3 === 0 ? '50%' : 3,
            background: p.color,
          }}
        />
      ))}
    </div>
  )
}

function fmt(sec?: number) {
  if (!sec) return null
  const m = Math.floor(sec / 60), s = sec % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

/* ─── share button ───────────────────────────────────────────── */
function ShareBtn({ id, label, icon: Icon, bg, color = '#fff', onClick }: {
  id: string; label: string; icon: React.ElementType
  bg: string; color?: string; onClick: () => void
}) {
  return (
    <motion.button
      id={id}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '13px 0', borderRadius: 16, border: 'none',
        background: bg, color, cursor: 'pointer',
        fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14,
        boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
      }}
    >
      <Icon size={16} />
      {label}
    </motion.button>
  )
}

/* ─── component ─────────────────────────────────────────────── */
export function ResultScreenUI({
  title       = 'The Strategist 🧠🔥',
  description = "You're a mastermind who thinks three steps ahead! You analyse situations deeply and make calculated decisions. People come to you for advice because you always see the bigger picture.",
  avatar      = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  quizTitle   = 'Which Gen-Z Icon Are You?',
  score,
  total,
  timeSec,
  onShare,
  onTryAnother,
}: ResultScreenUIProps) {
  const [confetti, setConfetti] = useState(false)
  const [copied, setCopied]     = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setConfetti(true), 300)
    const t2 = setTimeout(() => setConfetti(false), 3800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const handleCopy = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(window.location.href).catch(() => {})
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onShare?.('copy')
  }

  const pct = score != null && total ? Math.round((score / total) * 100) : null

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      fontFamily: 'var(--font-body)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px 60px',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* ambient blobs */}
      <motion.div
        animate={{ scale: [1, 1.18, 1], opacity: [0.18, 0.28, 0.18] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: -120, left: -100,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(199,125,255,0.35) 0%, transparent 68%)',
          pointerEvents: 'none',
        }}
      />
      <motion.div
        animate={{ scale: [1.18, 1, 1.18], opacity: [0.22, 0.14, 0.22] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', bottom: -100, right: -80,
          width: 360, height: 360, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,157,0.3) 0%, transparent 68%)',
          pointerEvents: 'none',
        }}
      />

      {/* confetti */}
      <AnimatePresence>{confetti && <Confetti />}</AnimatePresence>

      {/* ── main card ───────────────────────────────────────── */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%', maxWidth: 440, position: 'relative', zIndex: 1,
        }}
      >
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 30,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,107,157,0.08) inset',
        }}>

          {/* gradient top stripe */}
          <div style={{
            height: 5,
            background: 'linear-gradient(90deg, var(--pink), var(--purple), var(--cyan))',
          }} />

          <div style={{ padding: '30px 28px 28px' }}>

            {/* quiz title label */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              style={{ textAlign: 'center', marginBottom: 26 }}
            >
              <span style={{
                display: 'inline-block', padding: '4px 14px', borderRadius: 100,
                background: 'rgba(199,125,255,0.1)', border: '1px solid rgba(199,125,255,0.25)',
                color: 'var(--purple)', fontSize: 12, fontWeight: 600,
                fontFamily: 'var(--font-body)',
              }}>{quizTitle}</span>
            </motion.div>

            {/* avatar ring */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.28, type: 'spring', stiffness: 200, damping: 18 }}
              style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 24px' }}
            >
              {/* spinning ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                style={{
                  position: 'absolute', inset: -4,
                  borderRadius: '50%',
                  background: 'conic-gradient(var(--pink), var(--purple), var(--cyan), var(--pink))',
                  padding: 3,
                }}
              >
                <div style={{
                  width: '100%', height: '100%', borderRadius: '50%',
                  background: 'var(--surface)',
                }} />
              </motion.div>

              {/* avatar */}
              <div style={{
                position: 'absolute', inset: 4, borderRadius: '50%', overflow: 'hidden',
                border: '3px solid var(--bg)',
              }}>
                <img
                  src={avatar} alt="Result"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </motion.div>

            {/* result title */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
              style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 'clamp(26px, 6vw, 34px)', textAlign: 'center',
                lineHeight: 1.15, marginBottom: 14,
                background: 'linear-gradient(135deg, var(--pink), var(--purple), var(--cyan))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >{title}</motion.h1>

            {/* score row (optional) */}
            {pct !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.44 }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 14, marginBottom: 16,
                }}
              >
                <div style={{
                  padding: '5px 14px', borderRadius: 100,
                  background: 'rgba(6,214,160,0.1)', border: '1px solid rgba(6,214,160,0.3)',
                  fontSize: 13, fontWeight: 700, color: 'var(--green)',
                  fontFamily: 'var(--font-body)',
                }}>
                  {score}/{total} · {pct}%
                </div>
                {fmt(timeSec) && (
                  <div style={{
                    padding: '5px 14px', borderRadius: 100,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                    fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-body)',
                  }}>
                    ⏱ {fmt(timeSec)}
                  </div>
                )}
              </motion.div>
            )}

            {/* description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.48 }}
              style={{
                color: 'var(--muted)', textAlign: 'center',
                fontSize: 14, lineHeight: 1.7, marginBottom: 28,
              }}
            >{description}</motion.p>

            {/* divider */}
            <div style={{
              height: 1, background: 'var(--border)', marginBottom: 22,
            }} />

            {/* share label */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.54 }}
              style={{
                textAlign: 'center', fontWeight: 700, fontSize: 14,
                color: 'var(--text)', marginBottom: 14,
                fontFamily: 'var(--font-body)',
              }}
            >Share your result 🚀</motion.p>

            {/* share grid */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.58 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}
            >
              <ShareBtn
                id="share-whatsapp"
                label="WhatsApp"
                icon={Share2}
                bg="#25D366"
                onClick={() => onShare?.('whatsapp')}
              />
              <ShareBtn
                id="share-instagram"
                label="Instagram"
                icon={Download}
                bg="linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)"
                onClick={() => onShare?.('instagram')}
              />
            </motion.div>

            <motion.button
              id="share-copy"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCopy}
              style={{
                width: '100%', padding: '13px 0', borderRadius: 16, border: '1px solid var(--border)',
                background: copied ? 'rgba(6,214,160,0.1)' : 'var(--surface2)',
                color: copied ? 'var(--green)' : 'var(--muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                transition: 'background 0.2s ease, color 0.2s ease, border-color 0.2s ease',
                borderColor: copied ? 'rgba(6,214,160,0.35)' : 'var(--border)',
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </motion.button>
          </div>
        </div>

        {/* try another */}
        <motion.button
          id="result-try-another"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.68 }}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={onTryAnother}
          style={{
            width: '100%', marginTop: 14,
            padding: '16px 0', borderRadius: 20,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
            color: 'var(--text)', fontFamily: 'var(--font-body)',
            fontWeight: 700, fontSize: 15, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)')}
        >
          <RefreshCw size={17} /> Try Another Quiz
        </motion.button>

        {/* branding */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          style={{
            textAlign: 'center', marginTop: 22,
            fontSize: 12, color: 'var(--muted)',
            fontFamily: 'var(--font-body)',
          }}
        >Made with <span style={{
          background: 'linear-gradient(135deg, var(--pink), var(--purple))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', fontWeight: 700,
        }}>Quizly✦</span></motion.p>
      </motion.div>
    </div>
  )
}
