'use client'

import { useState, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Lock, Download, Share2, Target, MessageCircle, BarChart3, Flame, Heart, ArrowLeft, CheckCircle2, Sparkles, ArrowRight, Camera, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import type { ReportData } from '@/types/social-mirror'

const DIMENSION_COLORS: Record<string, string> = {
  leadership: '#8B5CF6',
  creativity: '#EC4899',
  empathy: '#10B981',
  ambition: '#F59E0B',
  humor: '#FB923C',
  trustworthiness: '#06B6D4',
  intelligence: '#6366F1',
  charisma: '#F472B6',
  resilience: '#34D399',
  loyalty: '#A78BFA',
  confidence: '#FBBF24',
}

type TabType = 'report' | 'roast' | 'compliment'

function RadarChart({ scores }: { scores: Record<string, number> }) {
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
  const gridLevels = [0.25, 0.5, 0.75, 1]

  return (
    <div className="flex flex-col items-center justify-center p-2 relative">
      <svg width="280" height="280" className="overflow-visible select-none drop-shadow-[0_0_15px_rgba(124,58,237,0.15)]">
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
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="1.2"
              strokeDasharray={lvl < 1 ? "4 4" : "none"}
            />
          )
        })}

        {/* Axis Lines & Labels */}
        {points.map((p, i) => {
          const ox = cx + r * Math.cos(p.angle)
          const oy = cy + r * Math.sin(p.angle)
          const lx = cx + (r + 16) * Math.cos(p.angle)
          const ly = cy + (r + 10) * Math.sin(p.angle)

          let textAnchor: "middle" | "start" | "end" = "middle"
          if (Math.cos(p.angle) > 0.1) textAnchor = "start"
          else if (Math.cos(p.angle) < -0.1) textAnchor = "end"

          return (
            <g key={i}>
              <line x1={cx} y1={cy} x2={ox} y2={oy} stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
              <text
                x={lx}
                y={ly}
                textAnchor={textAnchor}
                className="text-[9px] font-bold fill-zinc-400 capitalize font-display tracking-tight"
                alignmentBaseline="middle"
              >
                {p.label}
              </text>
            </g>
          )
        })}

        {/* Filled Data Polygon */}
        <polygon
          points={pointsStr}
          fill="rgba(124, 58, 237, 0.2)"
          stroke="#7c3aed"
          strokeWidth="2"
          className="transition-all duration-1000 ease-out"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3.5"
            fill="#7c3aed"
            stroke="#07050f"
            strokeWidth="1.5"
          />
        ))}

        <circle cx={cx} cy={cy} r="3.5" fill="rgba(124, 58, 237, 0.4)" />
      </svg>
    </div>
  )
}

export default function ReportPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [pinSubmitted, setPinSubmitted] = useState(false)
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
      .catch(() => {})
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
      setPinSubmitted(true)

      // Fetch latest response details
      fetch(`/api/profiles/${username}/responses`)
        .then(r => r.json())
        .then(d => {
          setResponseCount(d.total ?? 0)
          setTimeline(d.responses ?? [])
        })
        .catch(() => {})

      if (!isRegen) {
        // Staggered reveal animation
        for (let i = 1; i <= 6; i++) {
          setTimeout(() => setRevealStep(i), i * 350)
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
      setRegenerating(false)
    }
  }

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

  const handleShareCard = async (format = 'standard') => {
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
        <div className="absolute inset-0 z-0 pointer-events-none bg-dot-grid opacity-70" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-sm glass-card p-6 md:p-8 text-center border border-white/5 shadow-2xl"
        >
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-5 text-primary-light shadow-sm">
            <Lock className="w-5 h-5" />
          </div>
          
          <h1 className="font-display text-xl md:text-2xl font-black mb-2 text-text-primary">Unlock Your Report</h1>
          <p className="text-text-secondary text-xs mb-6 font-medium">
            Enter the access PIN you set during creation.
          </p>

          {/* Response count */}
          <div className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold mb-7 border
            ${responseCount >= 3 ? 'bg-emerald-950/20 text-accent border-emerald-500/20' : 'bg-secondary/10 text-secondary border-secondary/20'}
          `}>
            {responseCount >= 3 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="text-xs">⏳</span>} 
            <span>{responseCount} response{responseCount !== 1 ? 's' : ''} collected</span>
            {responseCount < 3 && <span className="opacity-75 font-semibold">({3 - responseCount} more needed)</span>}
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                className="w-full bg-surface border border-white/5 rounded-2xl px-5 py-3.5 text-text-primary font-black tracking-[0.3em] focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all outline-none text-center text-lg shadow-inner"
                type={showPin ? 'text' : 'password'}
                placeholder="••••"
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                onKeyDown={e => e.key === 'Enter' && handleUnlock(false)}
                autoFocus
              />
              <button 
                onClick={() => setShowPin(!showPin)} 
                className="absolute right-4.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                type="button"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary text-xs font-semibold"
              >
                {error}
              </motion.div>
            )}

            <button
              onClick={() => handleUnlock(false)}
              disabled={loading || !pin.trim()}
              className={`w-full py-3.5 rounded-2xl font-black text-xs md:text-sm transition-all shadow-md cursor-pointer ${
                (loading || !pin.trim())
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-95'
              }`}
            >
              {loading ? 'Unlocking...' : 'Unlock Report 🪞'}
            </button>
          </div>

          <Link href={`/${username}`} className="inline-flex items-center gap-1 mt-6 text-xs text-text-secondary hover:text-text-primary transition-colors font-bold cursor-pointer">
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
      <div className="absolute inset-0 z-0 pointer-events-none bg-dot-grid opacity-75" />
      <div className="absolute inset-0 z-0 pointer-events-none bg-pastel-gradient opacity-50" />

      {/* Header */}
      <nav className="glass-panel sticky top-0 z-50 flex items-center justify-between px-6 py-4 md:px-10 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg drop-shadow-[0_0_8px_rgba(124,58,237,0.4)]">🪞</span>
          <span className="text-gradient font-display font-black text-sm md:text-base tracking-tight">Social Mirror</span>
        </Link>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleUnlock(true)}
            disabled={regenerating}
            className="px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/25 text-[10px] font-bold text-primary-light flex items-center gap-1 shadow-sm hover:bg-primary/20 transition-colors cursor-pointer"
          >
            <Sparkles className={`w-3 h-3 ${regenerating ? 'animate-spin' : ''}`} />
            {regenerating ? 'Syncing...' : 'Sync Data'}
          </button>
          <div className="px-3.5 py-1.5 rounded-xl bg-accent/10 border border-accent/25 text-[10px] font-bold text-accent flex items-center gap-1 shadow-sm">
            <BarChart3 className="w-3 h-3" /> {report.response_count} responses
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
            <div className="text-5xl md:text-7xl mb-5 drop-shadow-[0_0_15px_rgba(124,58,237,0.25)]">{report.archetype_emoji}</div>
            <div className="font-display text-3xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3.5 tracking-tight leading-tight">
              {report.archetype}
            </div>
            <p className="text-text-secondary text-xs sm:text-sm md:text-base leading-relaxed max-w-lg mx-auto font-medium">
              {report.archetype_description}
            </p>
          </motion.div>
        )}

        {/* Tab Switcher */}
        <div className="flex bg-surface/65 p-1 rounded-2xl border border-white/5 shadow-inner mb-8 relative">
          {[
            { id: 'report' as TabType, label: 'Report', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'roast' as TabType, label: 'Roast', icon: <Flame className="w-4 h-4" /> },
            { id: 'compliment' as TabType, label: 'Compliment', icon: <Heart className="w-4 h-4" /> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 relative flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs md:text-sm font-bold transition-colors duration-300 cursor-pointer ${
                tab === t.id 
                  ? 'text-white' 
                  : 'text-text-secondary hover:bg-surface-hover/50'
              }`}
            >
              {tab === t.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl shadow-md"
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
              className="space-y-5"
            >
              {/* Scores */}
              {revealStep >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-5 md:p-7 border border-white/5 shadow-xl"
                >
                  <h3 className="font-display text-base md:text-lg font-bold mb-5 flex items-center gap-1.5 text-text-primary">
                    <BarChart3 className="w-4.5 h-4.5 text-primary-light" /> Character Dimension Radar
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
                            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{dim}</span>
                            <span className="text-xs font-black" style={{ color: DIMENSION_COLORS[dim] ?? '#a78bfa' }}>
                              {score}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-white/3">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${score}%` }}
                              transition={{ delay: 0.25 + i * 0.08, duration: 1, type: 'spring', bounce: 0.25 }}
                              className="h-full rounded-full"
                              style={{ background: DIMENSION_COLORS[dim] ?? '#a78bfa' }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Strengths */}
                {revealStep >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-5 md:p-6 border border-white/5"
                  >
                    <h3 className="font-display text-base font-bold mb-4.5 flex items-center gap-1.5 text-text-primary">
                      <Sparkles className="w-4.5 h-4.5 text-accent" /> Key Strengths
                    </h3>
                    <div className="space-y-2.5">
                      {report.strengths.map((s, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-950/10 border border-emerald-500/15 text-emerald-300 text-xs md:text-sm font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Weaknesses */}
                {revealStep >= 4 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-5 md:p-6 border border-white/5"
                  >
                    <h3 className="font-display text-base font-bold mb-4.5 flex items-center gap-1.5 text-text-primary">
                      <Target className="w-4.5 h-4.5 text-secondary" /> Growth Areas
                    </h3>
                    <div className="space-y-2.5">
                      {report.weaknesses.map((w, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-secondary/5 border border-secondary/15 text-secondary text-xs md:text-sm font-semibold">
                          <ArrowRight className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Hidden Talent + Friend Impression */}
              {revealStep >= 5 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                  <div className="glass-card p-5 md:p-6 relative overflow-hidden group border border-white/5">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] transform translate-x-3 -translate-y-3 group-hover:scale-105 transition-transform duration-500 pointer-events-none">
                      <Sparkles className="w-20 h-20 text-primary" />
                    </div>
                    <div className="w-9 h-9 bg-primary/10 text-primary-light rounded-xl flex items-center justify-center mb-3.5">
                      <Target className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Hidden Talent</div>
                    <div className="text-xs md:text-sm text-text-primary font-semibold leading-relaxed relative z-10">
                      {report.hidden_talent}
                    </div>
                  </div>
                  <div className="glass-card p-5 md:p-6 relative overflow-hidden group border border-white/5">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] transform translate-x-3 -translate-y-3 group-hover:scale-105 transition-transform duration-500 pointer-events-none">
                      <MessageCircle className="w-20 h-20 text-pink-500" />
                    </div>
                    <div className="w-9 h-9 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center mb-3.5">
                      <MessageCircle className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Friend Impression</div>
                    <div className="text-xs md:text-sm text-text-primary font-semibold leading-relaxed relative z-10">
                      {report.friend_impression}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Timeline Section */}
              {revealStep >= 5 && timeline && timeline.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-5 md:p-7 border border-white/5 shadow-md"
                >
                  <h3 className="font-display text-base md:text-lg font-bold mb-5 flex items-center gap-1.5 text-text-primary">
                    <CheckCircle2 className="w-4.5 h-4.5 text-accent" /> Submission History
                  </h3>
                  <div className="relative border-l border-white/5 ml-3 pl-5 space-y-5">
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
                          <div className="absolute -left-[24.5px] top-1 w-2.5 h-2.5 rounded-full border border-background bg-primary shadow-sm" />
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                            <span className="text-xs md:text-sm font-semibold text-text-primary">
                              {item.is_anonymous ? '🕶️ An anonymous friend' : `👤 ${item.respondent_name}`} completed the mirror
                            </span>
                            <span className="text-[10px] md:text-xs font-bold text-text-muted">{date}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Social Identity Card */}
              {revealStep >= 6 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="pt-6"
                >
                  <h3 className="font-display text-base md:text-lg font-bold mb-5 flex items-center gap-1.5 text-text-primary">
                    <Share2 className="w-4.5 h-4.5 text-primary-light" /> Social Identity Card
                  </h3>

                  {/* Server-Side Card Preview with hover tilt animation */}
                  <div className="flex flex-col items-center gap-6 mb-7">
                    <motion.div 
                      whileHover={{ scale: 1.025, rotateY: 3, rotateX: -3 }}
                      className="relative overflow-hidden rounded-2xl border border-white/5 shadow-2xl max-w-xs w-full aspect-[3/4] cursor-pointer tilt-card"
                    >
                      <img 
                        src={`/api/profiles/${username}/card?pin=${encodeURIComponent(pin)}`}
                        alt="Social Identity Card"
                        className="w-full h-full object-cover select-none"
                      />
                    </motion.div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2.5 max-w-md mx-auto relative z-10">
                    <button 
                      onClick={() => handleDownloadCard('standard')} 
                      className="flex items-center justify-center gap-1.5 py-3.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl text-xs font-bold hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md shadow-primary/15 cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Card
                    </button>
                    <button 
                      onClick={() => handleDownloadCard('story')} 
                      className="flex items-center justify-center gap-1.5 py-3.5 bg-surface border border-white/5 text-text-primary rounded-xl text-xs font-bold hover:bg-surface-hover hover:border-white/10 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-sm cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-secondary" /> Story
                    </button>
                    <button
                      onClick={() => handleShareCard('standard')}
                      className="flex items-center justify-center gap-1.5 py-3.5 bg-surface border border-white/5 text-text-primary rounded-xl text-xs font-bold hover:bg-surface-hover hover:border-white/10 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-sm cursor-pointer"
                    >
                      <Share2 className="w-4 h-4 text-primary-light" /> Share
                    </button>
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
              <div className="glass-card p-6 md:p-10 text-center relative overflow-hidden border border-white/5 shadow-xl">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                  <Flame className="w-40 h-40 text-secondary animate-pulse" />
                </div>
                <div className="text-4xl mb-4 relative z-10">🔥</div>
                <h3 className="font-display text-lg md:text-xl font-black mb-5 text-text-primary relative z-10">
                  Your Social Roast
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-text-secondary leading-relaxed max-w-xl mx-auto font-semibold relative z-10">
                  &quot;{report.roast}&quot;
                </p>
                <div className="mt-7 pt-4.5 border-t border-white/5 text-[10px] md:text-xs font-bold text-text-muted relative z-10">
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
              <div className="glass-card p-6 md:p-10 text-center relative overflow-hidden border border-white/5 shadow-xl">
                <div className="absolute top-0 left-0 p-6 opacity-[0.03] pointer-events-none">
                  <Heart className="w-40 h-40 text-pink-500 animate-pulse" />
                </div>
                <div className="text-4xl mb-4 relative z-10">💖</div>
                <h3 className="font-display text-lg md:text-xl font-black mb-5 text-text-primary relative z-10">
                  Your Social Compliment
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-text-secondary leading-relaxed max-w-xl mx-auto font-semibold relative z-10">
                  &quot;{report.compliment}&quot;
                </p>
                <div className="mt-7 pt-4.5 border-t border-white/5 text-[10px] md:text-xs font-bold text-text-muted relative z-10">
                  Based on {report.response_count} response{report.response_count !== 1 ? 's' : ''}. Woven with care! 🥰
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

