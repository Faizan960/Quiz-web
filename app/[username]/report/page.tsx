'use client'

import { useState, useEffect, use, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Lock, Download, Share2, Target, MessageCircle, BarChart3, Flame, Heart, ArrowLeft, CheckCircle2, Sparkles, ArrowRight, Camera } from 'lucide-react'
import type { ReportData } from '@/types/social-mirror'

const DIMENSION_COLORS: Record<string, string> = {
  leadership: '#8B5CF6',
  creativity: '#EC4899',
  empathy: '#34D399',
  ambition: '#F59E0B',
  humor: '#FB923C',
  trustworthiness: '#06B6D4',
  intelligence: '#818CF8',
  charisma: '#F472B6',
  resilience: '#10B981',
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
    <div className="flex flex-col items-center justify-center p-2">
      <svg width="280" height="280" className="overflow-visible select-none">
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
              stroke="rgba(161, 140, 209, 0.15)"
              strokeWidth="1"
              strokeDasharray={lvl < 1 ? "3 3" : "none"}
            />
          )
        })}

        {/* Axis Lines & Labels */}
        {points.map((p, i) => {
          const ox = cx + r * Math.cos(p.angle)
          const oy = cy + r * Math.sin(p.angle)
          const lx = cx + (r + 18) * Math.cos(p.angle)
          const ly = cy + (r + 12) * Math.sin(p.angle)

          let textAnchor = "middle"
          if (Math.cos(p.angle) > 0.1) textAnchor = "start"
          else if (Math.cos(p.angle) < -0.1) textAnchor = "end"

          return (
            <g key={i}>
              <line x1={cx} y1={cy} x2={ox} y2={oy} stroke="rgba(161, 140, 209, 0.15)" strokeWidth="1" />
              <text
                x={lx}
                y={ly}
                textAnchor={textAnchor}
                className="text-[10px] md:text-xs font-bold fill-zinc-400 capitalize"
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
          fill="rgba(161, 140, 209, 0.25)"
          stroke="#a18cd1"
          strokeWidth="2.5"
          className="transition-all duration-1000 ease-out"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#a18cd1"
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />
        ))}

        <circle cx={cx} cy={cy} r="3" fill="rgba(161, 140, 209, 0.3)" />
      </svg>
    </div>
  )
}

export default function ReportPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const [pin, setPin] = useState('')
  const [pinSubmitted, setPinSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState('')
  const [report, setReport] = useState<ReportData | null>(null)
  const [tab, setTab] = useState<TabType>('report')
  const [responseCount, setResponseCount] = useState(0)
  const [revealStep, setRevealStep] = useState(0)
  const [timeline, setTimeline] = useState<any[] | null>(null)

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
          setTimeout(() => setRevealStep(i), i * 400)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-sm glass-card p-8 text-center"
        >
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          
          <h1 className="font-display text-2xl font-extrabold mb-2 text-text-primary">Unlock Your Report</h1>
          <p className="text-text-secondary text-sm mb-6">
            Enter the PIN you set when creating your mirror.
          </p>

          {/* Response count */}
          <div className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-8 transition-colors
            ${responseCount >= 3 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-orange-50 text-orange-600 border border-orange-200'}
          `}>
            {responseCount >= 3 ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-base">⏳</span>} 
            {responseCount} response{responseCount !== 1 ? 's' : ''} collected
            {responseCount < 3 && <span className="opacity-75 font-medium ml-1">({3 - responseCount} more needed)</span>}
          </div>

          <div className="space-y-4">
            <input
              className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-text-primary font-bold tracking-[0.3em] focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-center text-xl"
              type="password"
              placeholder="••••"
              value={pin}
              onChange={e => setPin(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleUnlock()}
              autoFocus
            />

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium"
              >
                {error}
              </motion.div>
            )}

            <button
              onClick={handleUnlock}
              disabled={loading || !pin.trim()}
              className={`w-full py-4 rounded-2xl font-bold transition-all ${
                (loading || !pin.trim())
                  ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 shadow-lg shadow-primary/30'
              }`}
            >
              {loading ? 'Unlocking...' : 'Unlock Report 🪞'}
            </button>
          </div>

          <Link href={`/${username}`} className="inline-flex items-center gap-1 mt-6 text-sm text-text-muted hover:text-text-primary transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to share link
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
    <div className="min-h-screen bg-background relative flex flex-col">
      <div className="absolute inset-0 z-0 pointer-events-none bg-pastel-gradient opacity-60" />

      {/* Header */}
      <nav className="glass-panel sticky top-0 z-50 flex items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🪞</span>
          <span className="text-gradient font-display font-extrabold text-lg">Social Mirror</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleUnlock(true)}
            disabled={regenerating}
            className="px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600 flex items-center gap-1.5 shadow-sm hover:bg-indigo-100 transition-colors"
          >
            <Sparkles className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
            {regenerating ? 'Syncing...' : 'Regenerate'}
          </button>
          <div className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-600 flex items-center gap-1.5 shadow-sm">
            <BarChart3 className="w-3.5 h-3.5" /> {report.response_count} responses
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 relative z-10">
        {/* Archetype Hero */}
        {revealStep >= 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="text-6xl md:text-8xl mb-6 drop-shadow-xl">{report.archetype_emoji}</div>
            <div className="font-display text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              {report.archetype}
            </div>
            <p className="text-text-secondary text-lg leading-relaxed max-w-lg mx-auto">
              {report.archetype_description}
            </p>
          </motion.div>
        )}

        {/* Tab Switcher */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-zinc-200 shadow-sm mb-8 relative">
          {[
            { id: 'report' as TabType, label: 'Report', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'roast' as TabType, label: 'Roast', icon: <Flame className="w-4 h-4" /> },
            { id: 'compliment' as TabType, label: 'Compliment', icon: <Heart className="w-4 h-4" /> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 relative flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-colors duration-300 ${
                tab === t.id 
                  ? 'text-white' 
                  : 'text-text-secondary hover:bg-zinc-50'
              }`}
            >
              {tab === t.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl shadow-md"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
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
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-6"
            >
              {/* Scores */}
              {revealStep >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6 md:p-8"
                >
                  <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-2 text-text-primary">
                    <BarChart3 className="w-5 h-5 text-primary" /> Your Personality Radar
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Radar Chart */}
                    <RadarChart scores={report.scores} />

                    {/* Score Bars */}
                    <div className="space-y-4">
                      {topScores.map(([dim, score], i) => (
                        <motion.div
                          key={dim}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <div className="flex justify-between items-end mb-1.5">
                            <span className="text-xs font-bold text-text-secondary capitalize">{dim}</span>
                            <span className="text-sm font-extrabold" style={{ color: DIMENSION_COLORS[dim] ?? '#818CF8' }}>
                              {score}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${score}%` }}
                              transition={{ delay: 0.3 + i * 0.1, duration: 1.2, type: 'spring', bounce: 0.3 }}
                              className="h-full rounded-full"
                              style={{ background: DIMENSION_COLORS[dim] ?? '#818CF8' }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                {revealStep >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 md:p-8"
                  >
                    <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2 text-text-primary">
                      <Sparkles className="w-5 h-5 text-emerald-500" /> Strengths
                    </h3>
                    <div className="space-y-3">
                      {report.strengths.map((s, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-900 text-sm font-medium">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          {s}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Weaknesses */}
                {revealStep >= 4 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 md:p-8"
                  >
                    <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2 text-text-primary">
                      <Target className="w-5 h-5 text-orange-500" /> Growth Areas
                    </h3>
                    <div className="space-y-3">
                      {report.weaknesses.map((w, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-orange-50 border border-orange-100 text-orange-900 text-sm font-medium">
                          <ArrowRight className="w-5 h-5 text-orange-500 shrink-0" />
                          {w}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Hidden Talent + Friend Impression */}
              {revealStep >= 5 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="glass-card p-6 md:p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                      <Sparkles className="w-24 h-24 text-primary" />
                    </div>
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center mb-4">
                      <Target className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Hidden Talent</div>
                    <div className="text-base text-text-primary font-medium leading-relaxed relative z-10">
                      {report.hidden_talent}
                    </div>
                  </div>
                  <div className="glass-card p-6 md:p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                      <MessageCircle className="w-24 h-24 text-pink-500" />
                    </div>
                    <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center mb-4">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Friend Impression</div>
                    <div className="text-base text-text-primary font-medium leading-relaxed relative z-10">
                      {report.friend_impression}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Timeline Section */}
              {revealStep >= 5 && timeline && timeline.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6 md:p-8"
                >
                  <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-2 text-text-primary">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Response History
                  </h3>
                  <div className="relative border-l-2 border-zinc-100 ml-4 pl-6 space-y-6">
                    {timeline.map((item, i) => {
                      const date = new Date(item.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      return (
                        <div key={item.id} className="relative">
                          {/* Timeline bullet */}
                          <div className="absolute -left-[31px] top-1 w-4.5 h-4.5 rounded-full border-4 border-white bg-primary shadow-sm" />
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                            <span className="text-sm font-bold text-text-primary">
                              {item.is_anonymous ? '🕶️ An anonymous friend' : `👤 ${item.respondent_name}`} completed the mirror
                            </span>
                            <span className="text-xs font-semibold text-text-muted">{date}</span>
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
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="pt-6"
                >
                  <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-2 text-text-primary">
                    <Share2 className="w-5 h-5 text-primary" /> Your Social Identity Card
                  </h3>

                  {/* Server-Side Card Preview */}
                  <div className="flex flex-col items-center gap-6 mb-8">
                    <div className="relative group overflow-hidden rounded-3xl border border-zinc-200/50 shadow-xl max-w-xs w-full aspect-[3/4]">
                      <img 
                        src={`/api/profiles/${username}/card?pin=${encodeURIComponent(pin)}`}
                        alt="Social Identity Card"
                        className="w-full h-full object-cover select-none"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                    <button 
                      onClick={() => handleDownloadCard('standard')} 
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30"
                    >
                      <Download className="w-5 h-5" /> Card
                    </button>
                    <button 
                      onClick={() => handleDownloadCard('story')} 
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-zinc-900/20"
                    >
                      <Camera className="w-5 h-5 text-pink-500" /> Story (9:16)
                    </button>
                    <button
                      onClick={() => handleShareCard('standard')}
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-white border border-zinc-200 text-zinc-800 rounded-2xl font-bold hover:bg-zinc-50 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:border-primary/30"
                    >
                      <Share2 className="w-5 h-5" /> Share
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
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <div className="glass-card p-8 md:p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Flame className="w-48 h-48 text-orange-500" />
                </div>
                <div className="text-6xl mb-6 relative z-10">🔥</div>
                <h3 className="font-display text-2xl font-extrabold mb-6 text-text-primary relative z-10">
                  Your Social Roast
                </h3>
                <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto font-medium relative z-10">
                  &quot;{report.roast}&quot;
                </p>
                <div className="mt-8 pt-6 border-t border-zinc-100 text-sm font-medium text-text-muted relative z-10">
                  Based on {report.response_count} friend responses. All in good fun! 😂
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Compliment Tab ────────────────────── */}
          {tab === 'compliment' && (
            <motion.div
              key="compliment"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <div className="glass-card p-8 md:p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 p-8 opacity-5">
                  <Heart className="w-48 h-48 text-pink-500" />
                </div>
                <div className="text-6xl mb-6 relative z-10">💖</div>
                <h3 className="font-display text-2xl font-extrabold mb-6 text-text-primary relative z-10">
                  Your Social Compliment
                </h3>
                <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto font-medium relative z-10">
                  &quot;{report.compliment}&quot;
                </p>
                <div className="mt-8 pt-6 border-t border-zinc-100 text-sm font-medium text-text-muted relative z-10">
                  Your friends really think you&apos;re special. {report.response_count} people can&apos;t be wrong. ✨
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
