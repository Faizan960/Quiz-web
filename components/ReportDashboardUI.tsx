'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Key, Download, Copy, Check, Eye, Calendar, Sparkles } from 'lucide-react'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader } from './ui/Card'
import { Badge } from './ui/Badge'
import { PinEntry } from './ui/PinEntry'
import { useToast } from './ui/Toast'
import { Skeleton } from './ui/Skeleton'
import { PublicProfile } from '@/types/quiz'

// 7 dimensions for radar chart
const DIMENSIONS = [
  { key: 'charisma', label: 'Charisma' },
  { key: 'resilience', label: 'Resilience' },
  { key: 'loyalty', label: 'Loyalty' },
  { key: 'innovation', label: 'Innovation' },
  { key: 'confidence', label: 'Confidence' },
  { key: 'warmth', label: 'Warmth' },
  { key: 'wit', label: 'Wit' },
]

interface ReportData {
  scores: Record<string, number>
  archetype: {
    id: string
    name: string
    description: string
    roast: string
  }
  insights: Array<{
    type: 'strength' | 'blindspot' | 'surprising'
    title: string
    description: string
    emoji: string
  }>
  responseCount: number
  responses: Array<{
    id: string
    completed_at: string
    overall_score: number
    dimension_scores: Record<string, number>
    answers: Record<string, string>
  }>
}

interface ReportDashboardUIProps {
  profile: PublicProfile
  initialToken?: string
}

export const ReportDashboardUI: React.FC<ReportDashboardUIProps> = ({ profile, initialToken = '' }) => {
  const [token, setToken] = useState(initialToken)
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialToken)
  const [pin, setPin] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [copied, setCopied] = useState(false)
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null)

  const { error: toastError, success: toastSuccess } = useToast()

  // 1. Fetch dashboard data when authenticated
  useEffect(() => {
    if (!isAuthenticated || !token) return

    const loadData = async () => {
      setIsLoadingData(true)
      try {
        const res = await fetch(`/api/profiles/${profile.username}/report?token=${token}`)
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch report')
        }
        setReportData(data)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error loading dashboard'
        toastError(message)
        setIsAuthenticated(false)
        setToken('')
        localStorage.removeItem(`quizly_session_${profile.username}`)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [isAuthenticated, token, profile.username, toastError])

  // Check localStorage on mount for cached session token
  useEffect(() => {
    if (initialToken) return
    const cachedToken = localStorage.getItem(`quizly_session_${profile.username}`)
    if (cachedToken) {
      setTimeout(() => {
        setToken(cachedToken)
        setIsAuthenticated(true)
      }, 0)
    }
  }, [profile.username, initialToken])

  // 2. Handle PIN verification
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pin.length !== 4) {
      toastError('Please enter a 4-digit PIN.')
      return
    }

    setIsVerifying(true)
    try {
      const res = await fetch('/api/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: profile.username, pin }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      toastSuccess('PIN verified!')
      setToken(data.token)
      setIsAuthenticated(true)
      localStorage.setItem(`quizly_session_${profile.username}`, data.token)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Incorrect PIN'
      toastError(message)
      setPin('')
    } finally {
      setIsVerifying(false)
    }
  }

  // 3. Radar Chart Trigonometry Math
  const cx = 150
  const cy = 150
  const r = 100
  const sides = 7

  const getCoordinates = (index: number, score: number) => {
    const angle = (index * 2 * Math.PI) / sides - Math.PI / 2
    const distance = r * (score / 100)
    const x = cx + distance * Math.cos(angle)
    const y = cy + distance * Math.sin(angle)
    return { x, y }
  }

  // Draw concentric heptagon grid lines
  const gridLevels = [25, 50, 75, 100]
  const renderGridLines = () => {
    return gridLevels.map((level) => {
      const points = Array.from({ length: sides })
        .map((_, i) => {
          const { x, y } = getCoordinates(i, level)
          return `${x},${y}`
        })
        .join(' ')
      return (
        <polygon
          key={level}
          points={points}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="1"
          strokeDasharray="4,4"
        />
      )
    })
  }

  // Draw line axes from center
  const renderAxes = () => {
    return Array.from({ length: sides }).map((_, i) => {
      const outer = getCoordinates(i, 100)
      return (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={outer.x}
          y2={outer.y}
          stroke="var(--color-border)"
          strokeWidth="1"
        />
      )
    })
  }

  // Draw actual scores shape
  const renderScoreArea = () => {
    if (!reportData) return null
    const points = DIMENSIONS.map((dim, i) => {
      const score = reportData.scores[dim.key] ?? 50
      const { x, y } = getCoordinates(i, score)
      return `${x},${y}`
    }).join(' ')

    const dots = DIMENSIONS.map((dim, i) => {
      const score = reportData.scores[dim.key] ?? 50
      const { x, y } = getCoordinates(i, score)
      return <circle key={dim.key} cx={x} cy={y} r="4.5" fill="var(--color-pink-500)" stroke="#fff" strokeWidth="1.5" />
    })

    return (
      <>
        <polygon
          points={points}
          fill="url(#radar-grad)"
          stroke="var(--color-purple-600)"
          strokeWidth="2.5"
        />
        {dots}
      </>
    )
  }

  const copyShareLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const shareLink = `${origin}/${profile.username}`
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareLink)
      setCopied(true)
      toastSuccess('Quiz link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const triggerDownload = () => {
    window.location.href = `/api/card/${profile.username}`
  }

  // Auth Screen (PIN Lock)
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mx-auto mb-4 border border-purple-100">
              <Key className="w-8 h-8" />
            </div>
            <h2 className="font-display font-extrabold text-3xl text-text-primary mb-2">Unlock Your Radar 🪞</h2>
            <p className="text-text-secondary text-sm">
              Enter your secure 4-digit PIN to access {profile.display_name}&apos;s dashboard.
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handlePinSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2.5 items-center">
                  <span className="text-sm font-bold text-text-secondary">Enter PIN</span>
                  <PinEntry
                    value={pin}
                    onChange={setPin}
                    disabled={isVerifying}
                    error={pin.length > 0 && pin.length < 4}
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isVerifying}
                  className="mt-2"
                >
                  Verify & Unlock
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Loading Dashboard state
  if (isLoadingData || !reportData) {
    return (
      <div className="w-full max-w-2xl mx-auto py-12 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/2 rounded-md" />
          <Skeleton className="h-6 w-24 rounded-pill" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[320px] w-full rounded-card" />
          <Skeleton className="h-[320px] w-full rounded-card" />
        </div>
        <Skeleton className="h-[140px] w-full rounded-card" />
      </div>
    )
  }

  const minRequiredResponses = 3
  const isLockedForResponses = reportData.responseCount < minRequiredResponses
  const responsesRemaining = minRequiredResponses - reportData.responseCount

  return (
    <div className="w-full max-w-4xl mx-auto py-6 flex flex-col gap-8">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display font-extrabold text-3xl text-text-primary flex items-center gap-2">
            {profile.display_name}&apos;s Radar 🪞
          </h2>
          <p className="text-text-secondary text-sm">
            Based on {reportData.responseCount} friend responses
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="secondary" size="sm" onClick={copyShareLink}>
            {copied ? <Check className="w-4 h-4 mr-1 text-success" /> : <Copy className="w-4 h-4 mr-1" />}
            Copy Link
          </Button>
          <Button variant="primary" size="sm" onClick={triggerDownload}>
            <Download className="w-4 h-4 mr-1" />
            Story Card
          </Button>
        </div>
      </div>

      {/* Threshold / Response Lock Warning */}
      {isLockedForResponses ? (
        <Card className="bg-radial from-white to-purple-50/15 border-2 border-purple-200 shadow-md">
          <CardContent className="p-8 text-center flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-200">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>
            <div className="max-w-md">
              <h3 className="font-display font-extrabold text-2xl text-text-primary mb-2">
                Unlocking Radar Insight...
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                We need at least <strong>{minRequiredResponses} responses</strong> to run the AI engine and generate a reliable radar. You currently have <strong>{reportData.responseCount}</strong>.
              </p>
            </div>
            <div className="bg-purple-100 border border-purple-200 text-purple-800 text-xs font-bold px-3 py-1.5 rounded-pill">
              Get {responsesRemaining} more friend response{responsesRemaining !== 1 ? 's' : ''}!
            </div>
            <Button variant="primary" className="mt-2" onClick={copyShareLink}>
              Share Your Quiz Link
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Main Visuals: Radar Chart + Archetype Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Radar Chart Card */}
            <Card className="flex flex-col items-center justify-center p-6 bg-white">
              <span className="text-xs font-bold text-text-secondary mb-4 tracking-widest uppercase font-mono">
                Personality Dimension Grid
              </span>
              <div className="relative w-[300px] h-[300px]">
                <svg width="300" height="300" className="mx-auto">
                  <defs>
                    <radialGradient id="radar-grad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="var(--color-purple-50)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="var(--color-pink-500)" stopOpacity="0.45" />
                    </radialGradient>
                  </defs>
                  
                  {/* Concentric grids */}
                  {renderGridLines()}

                  {/* Axis lines */}
                  {renderAxes()}

                  {/* Main score polygon */}
                  {renderScoreArea()}

                  {/* Centered dot */}
                  <circle cx={cx} cy={cy} r="3" fill="var(--color-text-secondary)" />
                </svg>

                {/* Heptagon labels positioned absolutely over SVG */}
                {DIMENSIONS.map((dim, i) => {
                  const score = reportData.scores[dim.key] ?? 50
                  // Anchor labels slightly further out (115% radius)
                  const labelPos = getCoordinates(i, 118)
                  
                  return (
                    <div
                      key={dim.key}
                      style={{
                        position: 'absolute',
                        left: `${(labelPos.x / 300) * 100}%`,
                        top: `${(labelPos.y / 300) * 100}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className="text-center pointer-events-none"
                    >
                      <span className="block text-[10px] font-extrabold uppercase font-mono tracking-wider text-text-secondary bg-canvas px-1.5 py-0.5 rounded border border-border">
                        {dim.label}
                      </span>
                      <span className="block text-xs font-black font-display text-text-primary leading-none mt-0.5">
                        {score}
                      </span>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* 2. AI Archetype Card */}
            <Card className="bg-radial from-white to-purple-50/10 border-2 border-purple-100 flex flex-col justify-between">
              <CardHeader>
                <Badge variant="primary" className="w-fit mb-1">
                  AI Archetype Result
                </Badge>
                <h3 className="font-display font-extrabold text-3xl text-gradient leading-tight">
                  {reportData.archetype.name}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed mt-2">
                  {reportData.archetype.description}
                </p>
              </CardHeader>
              <CardContent className="bg-purple-900 text-white rounded-b-card p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-pink-400" />
                  <span className="font-display font-extrabold text-sm uppercase tracking-wider text-pink-300">
                    The Friendly Roast 🔥
                  </span>
                </div>
                <blockquote className="italic font-bold font-body text-base md:text-lg leading-relaxed border-l-2 border-pink-400 pl-4 py-1.5">
                  &ldquo;{reportData.archetype.roast}&rdquo;
                </blockquote>
              </CardContent>
            </Card>
          </div>

          {/* Vibe Insights List */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display font-extrabold text-xl text-text-primary flex items-center gap-2">
              <span>💡</span> Personality Insights
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reportData.insights.map((insight) => {
                const colors = {
                  strength: 'bg-emerald-50 border-emerald-100/60 text-emerald-800',
                  blindspot: 'bg-amber-50 border-amber-100/60 text-amber-800',
                  surprising: 'bg-purple-50 border-purple-100/60 text-purple-800',
                }
                const label = {
                  strength: 'Core Strength',
                  blindspot: 'Growth Opportunity',
                  surprising: 'Hidden Trait',
                }
                return (
                  <Card key={insight.type} className="h-full">
                    <CardContent className="p-5 flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl">{insight.emoji}</span>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-pill border ${colors[insight.type]}`}>
                          {label[insight.type]}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-display font-extrabold text-base text-text-primary">
                          {insight.title}
                        </h4>
                        <p className="text-xs text-text-secondary leading-relaxed mt-1.5">
                          {insight.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Response Timeline */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display font-extrabold text-xl text-text-primary flex items-center gap-2">
              <span>📅</span> Timeline of Ratings
            </h3>

            <div className="flex flex-col gap-3">
              {reportData.responses.map((resp, idx) => {
                const isExpanded = expandedResponse === resp.id
                return (
                  <Card key={resp.id}>
                    <CardContent className="p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-canvas border border-border flex items-center justify-center text-sm font-bold text-text-secondary flex-shrink-0">
                            #{reportData.responses.length - idx}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-text-primary block">
                              Anonymous Friend
                            </span>
                            <span className="text-[10px] text-text-muted flex items-center gap-1.5 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              {new Date(resp.completed_at).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xs text-text-muted block">Vibe Index</span>
                            <span className="text-sm font-black text-text-primary">
                              {resp.overall_score}%
                            </span>
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="p-2"
                            onClick={() => setExpandedResponse(isExpanded ? null : resp.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Expandable answers detail */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-border mt-3 pt-3 flex flex-col gap-2.5"
                          >
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                              Specific Ratings Chosen
                            </span>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {Object.entries(resp.answers).map(([qId, key]) => {
                                return (
                                  <div key={qId} className="flex justify-between bg-canvas border border-border px-3 py-2 rounded-input">
                                    <span className="text-text-secondary truncate max-w-[120px]">
                                      Q: {qId.slice(0, 8)}...
                                    </span>
                                    <span className="font-extrabold text-purple-700 bg-purple-50 border border-purple-100/50 px-1.5 py-0.25 rounded">
                                      Option {key}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
