'use client'

import { useState, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Lock, Download, Share2, Target, MessageCircle, BarChart3, Flame, Heart, ArrowLeft, CheckCircle2, Sparkles, ArrowRight, Camera, Eye, EyeOff } from 'lucide-react'
import type { ReportData } from '@/types/social-mirror'
import { TiltCard } from '@/components/TiltCard'

const DIMENSION_COLORS: Record<string, string> = {
  leadership: '#7c3aed',
  creativity: '#ec4899',
  empathy: '#10b981',
  ambition: '#f59e0b',
  humor: '#fb923c',
  trustworthiness: '#0ea5e9',
  intelligence: '#6366f1',
  charisma: '#f472b6',
  resilience: '#10b981',
  loyalty: '#a78bfa',
  confidence: '#fbbf24',
}

type TabType = 'report' | 'roast' | 'compliment'

const DIMENSION_DESCRIPTIONS: Record<string, string> = {
  leadership: 'Ability to guide, inspire, and organize others.',
  creativity: 'Thinking outside the box and generating original ideas.',
  empathy: 'Understanding and sharing the feelings of others.',
  ambition: 'Drive, motivation, and goal-oriented focus.',
  humor: 'Wit, playfulness, and bringing laughter.',
  trustworthiness: 'Reliability, honesty, and integrity.',
  intelligence: 'Problem-solving, critical thinking, and wisdom.',
  charisma: 'Personal charm and magnetic social appeal.',
  resilience: 'Capacity to recover quickly from difficulties.',
  loyalty: 'Faithfulness, devotion, and steadfast support.',
  confidence: 'Self-assurance, poise, and belief in oneself.',
}

function PasscodeGrid({ value, onChange, showPin, labelId }: { value: string; onChange: (v: string) => void; showPin: boolean; labelId: string }) {
  const digits = value.split('')
  const cells = [0, 1, 2, 3]

  return (
    <div className="relative flex items-center justify-center gap-3.5 py-3">
      {/* Hidden input for mobile keyboard and accessibility */}
      <input
        id={labelId}
        type="text"
        pattern="[0-9]*"
        inputMode="numeric"
        maxLength={4}
        value={value}
        onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-25"
      />
      {cells.map(idx => {
        const char = digits[idx]
        const isFocused = value.length === idx || (value.length === 4 && idx === 3)
        return (
          <div
            key={idx}
            className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-lg font-bold transition-all duration-200 bg-[#fcfbf9] ${isFocused
                ? 'border-text-primary shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] scale-105'
                : 'border-border text-text-muted'
              }`}
          >
            {char ? (
              showPin ? (
                <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-display font-black text-text-primary">{char}</motion.span>
              ) : (
                <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="w-3.5 h-3.5 rounded-full bg-text-primary" />
              )
            ) : (
              <span className="text-text-muted/40 font-light">—</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TiltIdentityCard({ src }: { src: string }) {
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [sheenX, setSheenX] = useState(50)
  const [sheenY, setSheenY] = useState(50)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const px = x / rect.width - 0.5
    const py = y / rect.height - 0.5

    setRotateY(px * 16)
    setRotateX(-py * 16)

    setSheenX((x / rect.width) * 100)
    setSheenY((y / rect.height) * 100)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        scale: isHovered ? 1.03 : 1,
      }}
      transition={{ type: 'spring', stiffness: 220, damping: 22, mass: 0.8 }}
      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
      className="relative overflow-hidden rounded-2xl border-2 border-text-primary shadow-[6px_6px_0px_0px_rgba(9,9,11,1)] max-w-xs w-full aspect-[3/4] cursor-pointer bg-zinc-950 group"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Social Identity Card"
        className="w-full h-full object-cover select-none pointer-events-none"
      />

      {/* Glare Sheen Overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-10 mix-blend-color-dodge transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 180px at ${sheenX}% ${sheenY}%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0) 80%)`,
          opacity: isHovered ? 1 : 0,
        }}
      />
      <div className="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none z-20" />
    </motion.div>
  )
}

function RadarChart({ scores }: { scores: Record<string, number> }) {
  const [isAnimated, setIsAnimated] = useState(false)
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; score: number } | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setIsAnimated(true), 150)
    return () => clearTimeout(t)
  }, [])

  const dims = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6) // Hexagon layout

  const cx = 150
  const cy = 150
  const r = 100

  // Calculate points
  const points = dims.map(([dim, score], i) => {
    const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2
    const val = score / 100
    const x = cx + r * val * Math.cos(angle)
    const y = cy + r * val * Math.sin(angle)
    return { x, y, label: dim, score, angle }
  })

  const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ')
  const collapsedPointsStr = dims.map(() => `${cx},${cy}`).join(' ')
  const gridLevels = [0.25, 0.5, 0.75, 1]

  return (
    <div className="flex flex-col items-center justify-center p-2 relative">
      <svg width="300" height="300" viewBox="0 0 300 300" className="overflow-visible select-none drop-shadow-[0_4px_10px_rgba(9,9,11,0.06)]">
        {/* Grid Hexagons */}
        {gridLevels.map((lvl, index) => {
          const gridPoints = dims.map((_, i) => {
            const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2
            const x = cx + r * lvl * Math.cos(angle)
            const y = cy + r * lvl * Math.sin(angle)
            return `${x},${y}`
          }).join(' ')
          return (
            <polygon
              key={index}
              points={gridPoints}
              fill="none"
              stroke="rgba(9, 9, 11, 0.06)"
              strokeWidth="1.2"
              strokeDasharray={lvl < 1 ? "4 4" : "none"}
            />
          )
        })}

        {/* Axis Lines & Labels */}
        {points.map((p, i) => {
          const ox = cx + r * Math.cos(p.angle)
          const oy = cy + r * Math.sin(p.angle)
          const lx = cx + (r + 18) * Math.cos(p.angle)
          const ly = cy + (r + 12) * Math.sin(p.angle)

          let textAnchor: "middle" | "start" | "end" = "middle"
          if (Math.cos(p.angle) > 0.1) textAnchor = "start"
          else if (Math.cos(p.angle) < -0.1) textAnchor = "end"

          return (
            <g key={i}>
              <line x1={cx} y1={cy} x2={ox} y2={oy} stroke="rgba(9, 9, 11, 0.05)" strokeWidth="1" />
              <text
                x={lx}
                y={ly}
                textAnchor={textAnchor}
                className="text-[10px] font-bold fill-zinc-650 capitalize font-mono tracking-tight"
                alignmentBaseline="middle"
              >
                {p.label}
              </text>
            </g>
          )
        })}

        {/* Filled Data Polygon with drawing path transition */}
        <motion.polygon
          animate={{ points: isAnimated ? pointsStr : collapsedPointsStr }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          fill="rgba(9, 9, 11, 0.05)"
          stroke="#09090b"
          strokeWidth="2.5"
        />

        {/* Pulsing center beacon */}
        <circle cx={cx} cy={cy} r="3" fill="#09090b" />
        <motion.circle
          cx={cx}
          cy={cy}
          r="3"
          fill="none"
          stroke="#09090b"
          strokeWidth="1"
          animate={{ scale: [1, 3.5], opacity: [0.5, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
        />

        {/* Data points + invisible hover targets */}
        {points.map((p, i) => (
          <g key={i}>
            <motion.circle
              animate={{ cx: isAnimated ? p.x : cx, cy: isAnimated ? p.y : cy }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              r="4.5"
              fill={DIMENSION_COLORS[p.label] ?? '#09090b'}
              stroke="#09090b"
              strokeWidth="2.5"
            />
            <motion.circle
              animate={{ cx: isAnimated ? p.x : cx, cy: isAnimated ? p.y : cy }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              r="18"
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
              onTouchStart={() => setHoveredPoint(p)}
              onTouchEnd={() => setHoveredPoint(null)}
            />
          </g>
        ))}
      </svg>

      {/* Tooltip Overlay */}
      <AnimatePresence>
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 5 }}
            className="absolute z-30 pointer-events-none p-3.5 bg-zinc-950/95 text-white text-xs rounded-xl shadow-xl max-w-[200px] border border-zinc-800 backdrop-blur-md"
            style={{
              left: hoveredPoint.x,
              top: hoveredPoint.y - 12,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="font-bold font-mono capitalize flex items-center justify-between gap-2.5 mb-1 text-zinc-100">
              <span>{hoveredPoint.label}</span>
              <span className="font-black" style={{ color: DIMENSION_COLORS[hoveredPoint.label] ?? '#7c3aed' }}>
                {hoveredPoint.score}%
              </span>
            </div>
            <div className="text-[10px] text-zinc-300 font-semibold leading-normal font-sans">
              {DIMENSION_DESCRIPTIONS[hoveredPoint.label] ?? 'Your rating in this dimension.'}
            </div>
            <div className="absolute left-1/2 bottom-0 w-2 h-2 bg-zinc-950/95 border-r border-b border-zinc-800 rotate-45 -translate-x-1/2 translate-y-1/2" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ReportPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [pinSubmitted, setPinSubmitted] = useState(false)
  const [mirrorUnlocking, setMirrorUnlocking] = useState(false)
  const [loading, setLoading] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState('')
  const [report, setReport] = useState<ReportData | null>(null)
  const [tab, setTab] = useState<TabType>('report')
  const [responseCount, setResponseCount] = useState(0)
  const [revealStep, setRevealStep] = useState(0)
  const [timeline, setTimeline] = useState<Array<{ id: string; created_at: string; respondent_name: string; is_anonymous: boolean }> | null>(null)

  // Fetch response count on load
  useEffect(() => {
    fetch(`/api/profiles/${username}/responses`)
      .then(r => r.json())
      .then(data => {
        setResponseCount(data.total ?? 0)
        setTimeline(data.responses ?? [])
      })
      .catch(() => { })
  }, [username])

  const handleUnlock = async (isRegen = false) => {
    if (!pin.trim()) return
    if (isRegen) setRegenerating(true)
    else setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/profiles/${username}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, regenerate: isRegen }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate report')

      setReport(data.report)

      if (!isRegen) {
        setMirrorUnlocking(true)
        setTimeout(() => {
          setMirrorUnlocking(false)
          setPinSubmitted(true)

          // Fetch latest response details (PIN-gated)
          fetch(`/api/profiles/${username}/responses?pin=${encodeURIComponent(pin)}`)
            .then(r => r.json())
            .then(d => {
              setResponseCount(d.total ?? 0)
              setTimeline(d.responses ?? [])
            })
            .catch(() => { })

          // Staggered reveal animation
          for (let i = 1; i <= 6; i++) {
            setTimeout(() => setRevealStep(i), i * 300)
          }
        }, 1800)
      } else {
        // Fetch latest response details (PIN-gated)
        fetch(`/api/profiles/${username}/responses?pin=${encodeURIComponent(pin)}`)
          .then(r => r.json())
          .then(d => {
            setResponseCount(d.total ?? 0)
            setTimeline(d.responses ?? [])
          })
          .catch(() => { })
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
      setRegenerating(false)
    }
  }

  // Auto-submit when exactly 4 digits are entered
  useEffect(() => {
    if (pin.length === 4 && !pinSubmitted && !mirrorUnlocking && !loading) {
      const t = setTimeout(() => {
        handleUnlock(false)
      }, 50)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, pinSubmitted, mirrorUnlocking, loading])

  const handleDownloadCard = async (format = 'standard') => {
    try {
      const url = `/api/profiles/${username}/card?pin=${encodeURIComponent(pin)}&format=${format}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to generate card image')
      const blob = await res.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `social-mirror-${username}-${format}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(blobUrl)
    } catch {
      alert('Failed to download card. Please try again!')
    }
  }

  const handleShareCard = async () => {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/${username}` : ''
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Social Mirror',
          text: `Check out my Social Mirror archetype card! 🪞`,
          url: shareUrl,
        })
      } catch (err) {
        console.log('Share failed:', err)
      }
    } else {
      try {
        await navigator.clipboard.writeText(`Reveal my Social Mirror archetype here: ${shareUrl}`)
        alert('Share link copied to clipboard!')
      } catch {
        alert('Failed to copy link.')
      }
    }
  }

  // ─── PIN Gate ─────────────────────────────────
  if (!pinSubmitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden text-text-primary">
        <div className="absolute inset-0 z-0 pointer-events-none bg-dot-grid opacity-90" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-sm glass-card p-6 md:p-8 text-center border border-border bg-surface"
        >
          <div className="w-12 h-12 bg-[#fcfbf9] border-2 border-text-primary rounded-2xl flex items-center justify-center mx-auto mb-5 text-text-primary shadow-[2.5px_2.5px_0px_0px_rgba(9,9,11,1)]">
            <Lock className="w-5 h-5" />
          </div>

          <h1 className="font-display text-xl md:text-2xl font-black mb-2 text-text-primary tracking-tight">Unlock Your Report</h1>
          <p className="text-text-secondary text-xs mb-6 font-semibold">
            Enter the access PIN you set during creation.
          </p>

          {/* Response count */}
          <div className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold mb-7 border-2 border-text-primary font-mono bg-white shadow-[1.5px_1.5px_0px_0px_rgba(9,9,11,1)]
            ${responseCount >= 3 ? 'text-emerald-600' : 'text-pink-500'}
          `}>
            {responseCount >= 3 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <span className="text-xs">⏳</span>}
            <span>{responseCount} response{responseCount !== 1 ? 's' : ''} collected</span>
            {responseCount < 3 && <span className="opacity-75 font-semibold">({3 - responseCount} more needed)</span>}
          </div>

          <div className="space-y-4">
            <div className="relative flex flex-col items-center">
              <PasscodeGrid
                value={pin}
                onChange={setPin}
                showPin={showPin}
                labelId="report-pin"
              />
              <button
                onClick={() => setShowPin(!showPin)}
                className="mt-3.5 text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer flex items-center gap-1.5 font-bold font-mono"
                type="button"
              >
                {showPin ? <><EyeOff className="w-3.5 h-3.5" /> Hide Digits</> : <><Eye className="w-3.5 h-3.5" /> Show Digits</>}
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-50 border-2 border-red-200 text-red-500 text-xs font-bold"
              >
                {error}
              </motion.div>
            )}

            <button
              onClick={() => handleUnlock(false)}
              disabled={loading || pin.length !== 4}
              className={`w-full py-3.5 rounded-2xl font-black text-xs md:text-sm transition-all cursor-pointer ${(loading || pin.length !== 4)
                  ? 'bg-zinc-150 text-zinc-400 border border-zinc-200 cursor-not-allowed shadow-none'
                  : 'btn-premium-solid'
                }`}
            >
              {loading ? 'Unlocking...' : 'Unlock Report 🪞'}
            </button>
          </div>

          <Link href={`/${username}`} className="inline-flex items-center gap-1 mt-6 text-xs text-text-secondary hover:text-text-primary transition-colors font-bold cursor-pointer font-mono uppercase tracking-wider">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to share link
          </Link>
        </motion.div>
      </div>
    )
  }

  // ─── Report View ──────────────────────────────
  if (!report) return null

  const topScores = Object.entries(report.scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)

  return (
    <div className="min-h-screen bg-background relative flex flex-col text-text-primary overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-dot-grid opacity-90" />
      <div className="absolute inset-0 z-0 pointer-events-none bg-pastel-gradient opacity-90" />

      {/* Header */}
      <nav className="glass-panel sticky top-0 z-50 flex items-center justify-between px-6 py-4 md:px-10 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg">🪞</span>
          <span className="font-display font-black text-sm md:text-base tracking-tight text-text-primary">Social Mirror</span>
        </Link>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleUnlock(true)}
            disabled={regenerating}
            className="px-3.5 py-1.5 rounded-xl btn-premium-outline text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-none"
          >
            <Sparkles className={`w-3 h-3 ${regenerating ? 'animate-spin' : ''}`} />
            {regenerating ? 'Syncing...' : 'Sync Data'}
          </button>
          <div className="px-3.5 py-1.5 rounded-xl border-2 border-text-primary bg-white text-[10px] font-bold text-text-primary flex items-center gap-1 shadow-[1.5px_1.5px_0px_0px_rgba(9,9,11,1)] font-mono">
            <BarChart3 className="w-3 h-3" /> {report.response_count} RESPONSES
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 relative z-10">

        {/* Archetype Hero */}
        {revealStep >= 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="text-5xl md:text-7xl mb-5 drop-shadow-sm">{report.archetype_emoji}</div>
            <div className="font-display text-3xl md:text-5xl lg:text-6xl font-black text-text-primary mb-3.5 tracking-tighter leading-tight">
              {report.archetype}
            </div>
            <p className="text-text-secondary text-xs sm:text-sm md:text-base leading-relaxed max-w-lg mx-auto font-semibold">
              {report.archetype_description}
            </p>
          </motion.div>
        )}

        {/* Tab Switcher */}
        <div className="flex bg-[#fcfbf9] p-1 rounded-2xl border-2 border-text-primary shadow-sm mb-8 relative">
          {[
            { id: 'report' as TabType, label: 'Report', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'roast' as TabType, label: 'Roast', icon: <Flame className="w-4 h-4" /> },
            { id: 'compliment' as TabType, label: 'Compliment', icon: <Heart className="w-4 h-4" /> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 relative flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs md:text-sm font-bold transition-colors duration-300 cursor-pointer ${tab === t.id
                  ? 'text-white'
                  : 'text-text-secondary hover:bg-zinc-150'
                }`}
              style={{ color: tab === t.id ? '#faf8f5' : 'var(--color-text-secondary)' }}
            >
              {tab === t.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-text-primary rounded-xl shadow-[2px_2px_0px_0px_rgba(9,9,11,0.15)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {t.icon} {t.label}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Standard Report Tab ──────────────── */}
          {tab === 'report' && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Scores */}
              {revealStep >= 2 && (
                <TiltCard
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  accentColor="rgba(9, 9, 11, 0.15)"
                  borderRadius={28}
                >
                  <div className="glass-card p-5 md:p-7 border border-border shadow-md bg-surface h-full hover:card-offset hover:border-text-primary transition-all duration-300">
                    <h3 className="font-display text-base md:text-lg font-black mb-5 flex items-center gap-1.5 text-text-primary">
                      <BarChart3 className="w-4.5 h-4.5 text-text-primary" /> Character Dimension Radar
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      {/* Radar Chart */}
                      <RadarChart scores={report.scores} />

                      {/* Score Bars */}
                      <div className="space-y-3">
                        {topScores.map(([dim, score], i) => (
                          <motion.div
                            key={dim}
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                          >
                            <div className="flex justify-between items-end mb-1">
                              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider font-mono">{dim}</span>
                              <span className="text-xs font-black font-mono" style={{ color: DIMENSION_COLORS[dim] ?? '#a78bfa' }}>
                                {score}%
                              </span>
                            </div>
                            <div className="w-full h-2.5 bg-[#f5f3f0] rounded-full overflow-hidden border-2 border-text-primary">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${score}%` }}
                                transition={{ delay: 0.25 + i * 0.08, duration: 1, type: 'spring', bounce: 0.25 }}
                                className="h-full rounded-full border-r border-text-primary"
                                style={{ background: DIMENSION_COLORS[dim] ?? '#a78bfa' }}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TiltCard>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                {revealStep >= 3 && (
                  <TiltCard
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    accentColor="rgba(9, 9, 11, 0.15)"
                    borderRadius={24}
                  >
                    <div className="glass-card p-5 md:p-6 border border-border bg-surface h-full hover:card-offset hover:border-text-primary transition-all duration-300">
                      <h3 className="font-display text-base font-black mb-4.5 flex items-center gap-1.5 text-text-primary">
                        <Sparkles className="w-4.5 h-4.5 text-text-primary" /> Key Strengths
                      </h3>
                      <div className="space-y-3">
                        {report.strengths.map((s, i) => (
                          <div key={i} className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#fcfbf9] border-2 border-text-primary text-text-primary text-xs md:text-sm font-bold shadow-[2px_2px_0px_0px_rgba(9,9,11,1)]">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TiltCard>
                )}

                {/* Weaknesses */}
                {revealStep >= 4 && (
                  <TiltCard
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    accentColor="rgba(9, 9, 11, 0.15)"
                    borderRadius={24}
                  >
                    <div className="glass-card p-5 md:p-6 border border-border bg-surface h-full hover:card-offset hover:border-text-primary transition-all duration-300">
                      <h3 className="font-display text-base font-black mb-4.5 flex items-center gap-1.5 text-text-primary">
                        <Target className="w-4.5 h-4.5 text-text-primary" /> Growth Areas
                      </h3>
                      <div className="space-y-3">
                        {report.weaknesses.map((w, i) => (
                          <div key={i} className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#fcfbf9] border-2 border-text-primary text-text-primary text-xs md:text-sm font-bold shadow-[2px_2px_0px_0px_rgba(9,9,11,1)]">
                            <ArrowRight className="w-4 h-4 text-text-primary shrink-0 mt-0.5" />
                            <span>{w}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TiltCard>
                )}
              </div>

              {/* Hidden Talent + Friend Impression */}
              {revealStep >= 5 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TiltCard
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    accentColor="rgba(9, 9, 11, 0.15)"
                    borderRadius={24}
                  >
                    <div className="glass-card p-5 md:p-6 relative overflow-hidden group border border-border bg-surface h-full hover:card-offset hover:border-text-primary transition-all duration-300">
                      <div className="absolute top-0 right-0 p-4 opacity-[0.04] transform translate-x-3 -translate-y-3 group-hover:scale-105 transition-transform duration-500 pointer-events-none">
                        <Sparkles className="w-20 h-20 text-text-primary" />
                      </div>
                      <div className="w-9 h-9 bg-background border-2 border-text-primary text-text-primary rounded-xl flex items-center justify-center mb-3.5 shadow-[1.5px_1.5px_0px_0px_rgba(9,9,11,1)]">
                        <Target className="w-4.5 h-4.5" />
                      </div>
                      <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 font-mono">Hidden Talent</div>
                      <div className="text-xs md:text-sm text-text-primary font-bold leading-relaxed relative z-10">
                        {report.hidden_talent}
                      </div>
                    </div>
                  </TiltCard>

                  <TiltCard
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    accentColor="rgba(9, 9, 11, 0.15)"
                    borderRadius={24}
                  >
                    <div className="glass-card p-5 md:p-6 relative overflow-hidden group border border-border bg-surface h-full hover:card-offset hover:border-text-primary transition-all duration-300">
                      <div className="absolute top-0 right-0 p-4 opacity-[0.04] transform translate-x-3 -translate-y-3 group-hover:scale-105 transition-transform duration-500 pointer-events-none">
                        <MessageCircle className="w-20 h-20 text-text-primary" />
                      </div>
                      <div className="w-9 h-9 bg-background border-2 border-text-primary text-text-primary rounded-xl flex items-center justify-center mb-3.5 shadow-[1.5px_1.5px_0px_0px_rgba(9,9,11,1)]">
                        <MessageCircle className="w-4.5 h-4.5" />
                      </div>
                      <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 font-mono">Friend Impression</div>
                      <div className="text-xs md:text-sm text-text-primary font-bold leading-relaxed relative z-10">
                        {report.friend_impression}
                      </div>
                    </div>
                  </TiltCard>
                </div>
              )}

              {/* Timeline Section */}
              {revealStep >= 5 && timeline && timeline.length > 0 && (
                <TiltCard
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  accentColor="rgba(9, 9, 11, 0.1)"
                  borderRadius={28}
                >
                  <div className="glass-card p-5 md:p-7 border border-border shadow-sm bg-surface h-full hover:card-offset hover:border-text-primary transition-all duration-300">
                    <h3 className="font-display text-base md:text-lg font-black mb-5 flex items-center gap-1.5 text-text-primary">
                      <CheckCircle2 className="w-4.5 h-4.5 text-text-primary" /> Submission History
                    </h3>
                    <div className="relative border-l-2 border-text-primary ml-3 pl-5 space-y-5">
                      {timeline.map((item) => {
                        const date = new Date(item.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        return (
                          <div key={item.id} className="relative">
                            {/* Timeline bullet */}
                            <div className="absolute -left-[26px] top-1 w-3.5 h-3.5 rounded-full border-2 border-text-primary bg-background shadow-sm" />
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                              <span className="text-xs md:text-sm font-bold text-text-primary">
                                {item.is_anonymous ? '🕶️ An anonymous friend' : `👤 ${item.respondent_name}`} completed the mirror
                              </span>
                              <span className="text-[10px] md:text-xs font-bold text-text-muted font-mono">{date}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </TiltCard>
              )}

              {/* Social Identity Card */}
              {revealStep >= 6 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="pt-6 border-t border-border"
                >
                  <h3 className="font-display text-base md:text-lg font-black mb-6 flex items-center gap-1.5 text-text-primary">
                    <Share2 className="w-4.5 h-4.5 text-text-primary" /> Social Identity Card
                  </h3>

                  {/* Asymmetrical layout: Card Left, Details & Downloads Right */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-5 flex justify-center">
                      <TiltIdentityCard src={`/api/profiles/${username}/card?pin=${encodeURIComponent(pin)}`} />
                    </div>

                    <div className="md:col-span-7 space-y-4">
                      <h4 className="font-display text-lg md:text-xl font-black text-text-primary tracking-tight">Export Your Card</h4>
                      <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                        Download your server-rendered Social Identity Card in high definition. Formatted perfectly for sharing on Instagram stories, Snapchat, or save it to your phone.
                      </p>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2 relative z-10 w-full">
                        <button
                          onClick={() => handleDownloadCard('standard')}
                          className="btn-premium-solid flex items-center justify-center gap-1.5 py-3 px-5 rounded-xl text-xs font-bold cursor-pointer animate-none transition-all"
                        >
                          <Download className="w-4 h-4" /> Download Card
                        </button>
                        <button
                          onClick={() => handleDownloadCard('story')}
                          className="btn-premium-outline flex items-center justify-center gap-1.5 py-3 px-5 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          <Camera className="w-4 h-4 text-text-primary" /> Story (9:16)
                        </button>
                        <button
                          onClick={handleShareCard}
                          className="btn-premium-outline flex items-center justify-center gap-1.5 py-3 px-5 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          <Share2 className="w-4 h-4 text-text-primary" /> Share Link
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── Roast Tab ────────────────────────── */}
          {tab === 'roast' && (
            <motion.div
              key="roast"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="glass-card p-6 md:p-10 text-center relative overflow-hidden border-2 border-text-primary bg-surface shadow-[4px_4px_0px_0px_rgba(9,9,11,1)]">
                <div className="absolute top-0 right-0 p-6 opacity-[0.04] pointer-events-none">
                  <Flame className="w-40 h-40 text-text-primary" />
                </div>
                <div className="text-4xl mb-4 relative z-10">🔥</div>
                <h3 className="font-display text-lg md:text-xl font-black mb-5 text-text-primary relative z-10 tracking-tight">
                  Your Social Roast
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-text-primary leading-relaxed max-w-xl mx-auto font-serif-editorial italic font-normal relative z-10">
                  &quot;{report.roast}&quot;
                </p>
                <div className="mt-7 pt-4.5 border-t border-border text-[10px] md:text-xs font-bold text-text-muted relative z-10 font-mono">
                  Based on {report.response_count} response{report.response_count !== 1 ? 's' : ''}. All in good fun! 😂
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Compliment Tab ────────────────────── */}
          {tab === 'compliment' && (
            <motion.div
              key="compliment"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="glass-card p-6 md:p-10 text-center relative overflow-hidden border-2 border-text-primary bg-surface shadow-[4px_4px_0px_0px_rgba(9,9,11,1)]">
                <div className="absolute top-0 left-0 p-6 opacity-[0.04] pointer-events-none">
                  <Heart className="w-40 h-40 text-text-primary" />
                </div>
                <div className="text-4xl mb-4 relative z-10">💖</div>
                <h3 className="font-display text-lg md:text-xl font-black mb-5 text-text-primary relative z-10 tracking-tight">
                  Your Social Compliment
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-text-primary leading-relaxed max-w-xl mx-auto font-serif-editorial italic font-normal relative z-10">
                  &quot;{report.compliment}&quot;
                </p>
                <div className="mt-7 pt-4.5 border-t border-border text-[10px] md:text-xs font-bold text-text-muted relative z-10 font-mono">
                  Based on {report.response_count} response{report.response_count !== 1 ? 's' : ''}. Woven with care! 🥰
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Cinematic Mirror Reveal Unlock Transition */}
      <AnimatePresence>
        {mirrorUnlocking && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md text-text-primary"
          >
            <div className="absolute inset-0 pointer-events-none bg-dot-grid opacity-80" />

            <div className="relative flex flex-col items-center text-center px-6">
              {/* Pulsing mirror emoji inside a glowing ring */}
              <div className="relative mb-8">
                <motion.div
                  animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="w-24 h-24 bg-[#fcfbf9] border-2 border-text-primary rounded-full flex items-center justify-center text-5xl shadow-[4px_4px_0px_0px_rgba(9,9,11,1)]"
                >
                  🪞
                </motion.div>
                {/* Ripple wave */}
                <motion.div
                  animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full border border-text-primary pointer-events-none"
                />
              </div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-display text-2xl md:text-3xl font-black mb-2 tracking-tight text-text-primary"
              >
                Reflecting Your Identity...
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.4 }}
                className="text-xs font-bold uppercase tracking-wider text-text-secondary animate-pulse font-mono"
              >
                Scanning social coordinates
              </motion.p>
            </div>

            {/* Glowing Scanline sweep */}
            <motion.div
              initial={{ top: '0%' }}
              animate={{ top: '100%' }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-text-primary to-transparent shadow-[0_0_12px_rgba(9,9,11,0.5)] z-50 pointer-events-none"
            />
            {/* Secondary scanning wash */}
            <motion.div
              initial={{ top: '-10%', opacity: 0.3 }}
              animate={{ top: '100%', opacity: 0 }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              className="absolute left-0 right-0 h-40 bg-gradient-to-b from-text-primary/10 to-transparent pointer-events-none"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
