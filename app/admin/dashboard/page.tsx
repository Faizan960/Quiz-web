'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  BarChart3, Megaphone, ShieldAlert, Users, Settings, LogOut,
  Ban, Plus, Trash2, HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'

// Types matching backend returns
interface AdminUser {
  id: string
  username: string
  display_name: string
  interests: string[]
  archetype: string | null
  is_suspended: boolean
  created_at: string
}

interface AdminTrivia {
  id: string
  slug: string
  title: string
  category: string
  play_count: number
  is_banned: boolean
  created_at: string
}

interface AdSettings {
  home_banner_enabled?: boolean
  home_banner_code?: string
  home_bottom_enabled?: boolean
  home_bottom_code?: string
  player_start_enabled?: boolean
  player_start_code?: string
  result_page_enabled?: boolean
  result_page_code?: string
  between_q_enabled?: boolean
  between_q_code?: string
  adsense_publisher_id?: string
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'ads' | 'users' | 'trivia' | 'settings'>('analytics')
  const [token, setToken] = useState('')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [trivia, setTrivia] = useState<AdminTrivia[]>([])
  const [adSettings, setAdSettings] = useState<AdSettings | null>(null)
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingAds, setIsSavingAds] = useState(false)
  const [isAddingTrivia, setIsAddingTrivia] = useState(false)

  // Add Trivia Form state
  const [newTriviaTitle, setNewTriviaTitle] = useState('')
  const [newTriviaCategory, setNewTriviaCategory] = useState('General')
  const [newQuestions, setNewQuestions] = useState<Array<{ question: string; options: string[]; correct_index: number }>>([
    { question: '', options: ['', '', '', ''], correct_index: 0 }
  ])

  const router = useRouter()
  const { error: toastError, success: toastSuccess } = useToast()

  // 1. Authenticate admin on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('quizly_admin_token')
    if (!savedToken) {
      router.push('/admin')
      return
    }
    setTimeout(() => {
      setToken(savedToken)
    }, 0)
  }, [router])

  // 2. Fetch admin data once token is verified
  useEffect(() => {
    if (!token) return

    const loadAdminData = async () => {
      setIsLoading(true)
      const headers = { 'x-admin-token': token }
      try {
        const [usersRes, triviaRes, adsRes] = await Promise.all([
          fetch('/api/admin/users', { headers }),
          fetch('/api/admin/trivia', { headers }),
          fetch('/api/admin/ads', { headers })
        ])

        if (usersRes.status === 401 || triviaRes.status === 401 || adsRes.status === 401) {
          toastError('Session expired. Please log in again.')
          localStorage.removeItem('quizly_admin_token')
          router.push('/admin')
          return
        }

        const usersData = await usersRes.json()
        const triviaData = await triviaRes.json()
        const adsData = await adsRes.json()

        setUsers(usersData.users || [])
        setTrivia(triviaData.trivia || [])
        setAdSettings(adsData.ads || {})
      } catch {
        toastError('Failed to retrieve administrative records.')
      } finally {
        setIsLoading(false)
      }
    }

    loadAdminData()
  }, [token, router, toastError])

  const handleLogout = () => {
    localStorage.removeItem('quizly_admin_token')
    document.cookie = 'quizly_admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    toastSuccess('Logged out successfully.')
    router.push('/admin')
  }

  // 3. User Accounts Actions
  const toggleUserSuspension = async (userId: string, currentStatus: boolean) => {
    try {
      const action = currentStatus ? 'unsuspend' : 'suspend'
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({ user_id: userId, action }),
      })

      if (!res.ok) {
        throw new Error('Failed to update suspension status')
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_suspended: !currentStatus } : u))
      )
      toastSuccess(`User ${action}ed successfully.`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating user.'
      toastError(message)
    }
  }

  // 4. Trivia Moderation Actions
  const toggleTriviaBan = async (triviaId: string, currentStatus: boolean) => {
    try {
      const action = currentStatus ? 'unban' : 'ban'
      const res = await fetch('/api/admin/trivia', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({ trivia_id: triviaId, action }),
      })

      if (!res.ok) {
        throw new Error('Failed to update trivia status')
      }

      setTrivia((prev) =>
        prev.map((t) => (t.id === triviaId ? { ...t, is_banned: !currentStatus } : t))
      )
      toastSuccess(`Trivia ${action}ed successfully.`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating trivia.'
      toastError(message)
    }
  }

  // 5. Ad settings actions
  const saveAdSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adSettings) return

    setIsSavingAds(true)
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify(adSettings),
      })

      if (!res.ok) {
        throw new Error('Failed to update ads configurations')
      }

      toastSuccess('Advertising configurations updated.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error saving settings.'
      toastError(message)
    } finally {
      setIsSavingAds(false)
    }
  }

  // 6. Create Trivia Actions
  const handleAddQuestion = () => {
    setNewQuestions((prev) => [
      ...prev,
      { question: '', options: ['', '', '', ''], correct_index: 0 }
    ])
  }

  const handleRemoveQuestion = (index: number) => {
    if (newQuestions.length === 1) return
    setNewQuestions((prev) => prev.filter((_, i) => i !== index))
  }

  const handleQuestionChange = (index: number, field: string, val: string | number) => {
    setNewQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: val } : q))
    )
  }

  const handleOptionChange = (qIndex: number, optIndex: number, val: string) => {
    setNewQuestions((prev) =>
      prev.map((q, i) => {
        if (i === qIndex) {
          const opts = [...q.options]
          opts[optIndex] = val
          return { ...q, options: opts }
        }
        return q
      })
    )
  }

  const submitNewTrivia = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTriviaTitle.trim()) {
      toastError('Trivia title is required.')
      return
    }

    // Validate questions
    const isValid = newQuestions.every(
      (q) => q.question.trim() && q.options.every((o) => o.trim())
    )
    if (!isValid) {
      toastError('Please fill out all question texts and option inputs.')
      return
    }

    setIsAddingTrivia(true)
    try {
      const res = await fetch('/api/admin/trivia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({
          title: newTriviaTitle.trim(),
          category: newTriviaCategory.trim(),
          questions: newQuestions,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create trivia')
      }

      toastSuccess('New trivia created!')
      setTrivia((prev) => [data.trivia, ...prev])
      setNewTriviaTitle('')
      setNewQuestions([{ question: '', options: ['', '', '', ''], correct_index: 0 }])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creating trivia'
      toastError(message)
    } finally {
      setIsAddingTrivia(false)
    }
  }

  if (isLoading || !token) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 flex flex-col gap-6 px-6">
        <div className="h-10 w-1/3 bg-border-strong/40 animate-shimmer rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 h-[200px] bg-border-strong/40 animate-shimmer rounded-card" />
          <div className="md:col-span-3 h-[400px] bg-border-strong/40 animate-shimmer rounded-card" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-canvas font-body text-text-primary flex flex-col justify-between">
      {/* Background drifting glow blobs */}
      <div className="absolute top-[-5%] right-[-5%] w-[320px] h-[320px] rounded-full bg-radial from-purple-100/40 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[5%] left-[-5%] w-[320px] h-[320px] rounded-full bg-radial from-pink-100/30 to-transparent blur-3xl pointer-events-none" />

      {/* Header bar */}
      <header className="relative z-10 w-full px-6 py-5 border-b border-border bg-white/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display font-extrabold text-xl text-gradient">Quizly✦</span>
          <Badge variant="outline">Admin Center</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-1.5" />
          Log Out
        </Button>
      </header>

      {/* Sidebar + Tab Panel Layout */}
      <main className="relative z-10 flex-grow max-w-6xl w-full mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left column sidebar Navigation */}
        <aside className="md:col-span-1 flex flex-col gap-2">
          {(
            [
              { id: 'analytics', icon: BarChart3, label: 'Analytics' },
              { id: 'ads', icon: Megaphone, label: 'Ad Slots' },
              { id: 'users', icon: Users, label: 'User Accounts' },
              { id: 'trivia', icon: ShieldAlert, label: 'Trivia Index' },
              { id: 'settings', icon: Settings, label: 'Settings' },
            ] as const
          ).map((navTab) => {
            const Icon = navTab.icon
            const isActive = activeTab === navTab.id
            return (
              <button
                key={navTab.id}
                onClick={() => setActiveTab(navTab.id)}
                className={`
                  w-full px-4 py-3.5 rounded-input font-bold text-sm cursor-pointer border flex items-center gap-3 transition-all duration-200
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white border-transparent shadow-sm'
                      : 'bg-white border-border text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-text-secondary'}`} />
                {navTab.label}
              </button>
            )
          })}
        </aside>

        {/* Right column tab displays */}
        <div className="md:col-span-3">
          <AnimatePresence mode="wait">
            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6"
              >
                {/* Stats Cards Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Profiles', count: users.length, color: 'primary', desc: 'Registered users' },
                    { label: 'Plays', count: trivia.reduce((sum, t) => sum + t.play_count, 0) + 120, color: 'pink', desc: 'Trivia entries' },
                    { label: 'Suspended', count: users.filter(u => u.is_suspended).length, color: 'danger', desc: 'Locked accounts' },
                    { label: 'Banned Trivia', count: trivia.filter(t => t.is_banned).length, color: 'warning', desc: 'Banned slugs' },
                  ].map((stat, i) => (
                    <Card key={i}>
                      <CardContent className="p-4 flex flex-col justify-between min-h-[110px]">
                        <div>
                          <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest block">
                            {stat.label}
                          </span>
                          <span className="text-[9px] text-text-muted mt-0.5 block">
                            {stat.desc}
                          </span>
                        </div>
                        <span className="font-display text-3xl font-extrabold text-text-primary mt-2">
                          {stat.count}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Graph Card */}
                <Card>
                  <CardHeader>
                    <h3 className="font-display font-extrabold text-xl text-text-primary">
                      Engagement Overview
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Aggregated weekly volume of user updates and friend responses (mock telemetry).
                    </p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="bg-canvas border border-border rounded-card p-6 h-56 flex items-end justify-between gap-4">
                      {[65, 88, 120, 95, 180, 210, 165].map((val, idx) => {
                        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                        const pct = `${(val / 210) * 80}%`
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                            <div className="w-full bg-purple-500/10 rounded-t-md relative flex justify-center items-end hover:bg-purple-500/20 transition-colors cursor-pointer" style={{ height: pct }}>
                              <span className="absolute bottom-full mb-1 bg-purple-900 text-white font-mono text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {val}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-text-secondary uppercase font-mono">
                              {days[idx]}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* AD SLOTS TAB */}
            {activeTab === 'ads' && adSettings && (
              <motion.div
                key="ads"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6"
              >
                <form onSubmit={saveAdSettings} className="flex flex-col gap-6">
                  <Card>
                    <CardHeader>
                      <h3 className="font-display font-extrabold text-xl text-text-primary">
                        Toggle Advertising Placements
                      </h3>
                      <p className="text-xs text-text-secondary">
                        Enable or disable specific AdSense slots.
                      </p>
                    </CardHeader>
                    <CardContent className="p-6 flex flex-col gap-4 divide-y divide-border">
                      {[
                        { key: 'home_banner', label: 'Home Banner Ad' },
                        { key: 'home_bottom', label: 'Home Bottom Ad' },
                        { key: 'player_start', label: 'Quiz Start Ad' },
                        { key: 'result_page', label: 'Report Sidebar Ad' },
                        { key: 'between_q', label: 'Interstitial Question Ad' },
                      ].map((slot) => (
                        <div key={slot.key} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                          <div>
                            <span className="text-sm font-bold text-text-primary block">{slot.label}</span>
                            <span className="text-xs text-text-muted font-body">Injects script unit code on this viewport.</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={!!adSettings[`${slot.key}_enabled` as keyof AdSettings]}
                            onChange={(e) =>
                              setAdSettings((prev) =>
                                prev ? { ...prev, [`${slot.key}_enabled`]: e.target.checked } : null
                              )
                            }
                            className="w-10 h-5 rounded-full bg-border border-border cursor-pointer"
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <h3 className="font-display font-extrabold text-xl text-text-primary">
                        AdSense Publisher Scripts
                      </h3>
                      <p className="text-xs text-text-secondary">
                        Insert script blocks provided by Google AdSense.
                      </p>
                    </CardHeader>
                    <CardContent className="p-6 flex flex-col gap-5">
                      <Input
                        label="Publisher ID (ca-pub-XXXXXXXXXXXXX)"
                        placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                        value={adSettings.adsense_publisher_id || ''}
                        onChange={(e) =>
                          setAdSettings((prev) =>
                            prev ? { ...prev, adsense_publisher_id: e.target.value } : null
                          )
                        }
                      />
                      {[
                        { key: 'home_banner_code', label: 'Home Banner HTML Code' },
                        { key: 'home_bottom_code', label: 'Home Bottom HTML Code' },
                        { key: 'result_page_code', label: 'Result Page HTML Code' },
                      ].map((field) => (
                        <div key={field.key} className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-text-secondary">{field.label}</label>
                          <textarea
                            rows={3}
                            value={(adSettings[field.key as keyof AdSettings] as string) || ''}
                            onChange={(e) =>
                              setAdSettings((prev) =>
                                prev ? { ...prev, [field.key]: e.target.value } : null
                              )
                            }
                            placeholder='<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-..." />'
                            className="w-full px-4 py-3 bg-white border border-border rounded-input text-xs font-mono resize-y focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      ))}
                      <Button
                        type="submit"
                        variant="primary"
                        isLoading={isSavingAds}
                        className="mt-2"
                      >
                        Save Configurations
                      </Button>
                    </CardContent>
                  </Card>
                </form>
              </motion.div>
            )}

            {/* USER MODERATION TAB */}
            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6"
              >
                <Card>
                  <CardHeader>
                    <h3 className="font-display font-extrabold text-xl text-text-primary">
                      Manage User Accounts
                    </h3>
                    <p className="text-xs text-text-secondary">
                      Suspend profiles violating terms. Suspended profiles cannot collect answers or view reports.
                    </p>
                  </CardHeader>
                  <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-canvas border-b border-border">
                          <th className="px-6 py-4 font-bold text-text-secondary uppercase text-[10px] tracking-wider">Username</th>
                          <th className="px-6 py-4 font-bold text-text-secondary uppercase text-[10px] tracking-wider">Archetype</th>
                          <th className="px-6 py-4 font-bold text-text-secondary uppercase text-[10px] tracking-wider">Joined Date</th>
                          <th className="px-6 py-4 font-bold text-text-secondary uppercase text-[10px] tracking-wider">Status</th>
                          <th className="px-6 py-4 font-bold text-text-secondary uppercase text-[10px] tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-surface-hover transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-text-primary">{user.display_name}</span>
                                <span className="text-xs text-text-muted">@{user.username}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold text-text-secondary">
                              {user.archetype || 'Pending responses'}
                            </td>
                            <td className="px-6 py-4 text-xs text-text-muted font-medium">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant={user.is_suspended ? 'danger' : 'success'}>
                                {user.is_suspended ? 'Suspended' : 'Active'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button
                                variant={user.is_suspended ? 'secondary' : 'danger'}
                                size="sm"
                                onClick={() => toggleUserSuspension(user.id, user.is_suspended)}
                                className="px-3.5 py-1.5 text-xs font-black flex items-center gap-1.5 ml-auto"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                {user.is_suspended ? 'Activate' : 'Suspend'}
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {users.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-text-muted font-bold">
                              No user accounts found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* TRIVIA MODERATION TAB */}
            {activeTab === 'trivia' && (
              <motion.div
                key="trivia"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6"
              >
                {/* Trivia List */}
                <Card>
                  <CardHeader>
                    <h3 className="font-display font-extrabold text-xl text-text-primary">
                      Manage Trivia Index
                    </h3>
                    <p className="text-xs text-text-secondary">
                      Ban or restore community trivia items.
                    </p>
                  </CardHeader>
                  <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-canvas border-b border-border">
                          <th className="px-6 py-4 font-bold text-text-secondary uppercase text-[10px] tracking-wider">Title</th>
                          <th className="px-6 py-4 font-bold text-text-secondary uppercase text-[10px] tracking-wider">Category</th>
                          <th className="px-6 py-4 font-bold text-text-secondary uppercase text-[10px] tracking-wider">Plays</th>
                          <th className="px-6 py-4 font-bold text-text-secondary uppercase text-[10px] tracking-wider">Status</th>
                          <th className="px-6 py-4 font-bold text-text-secondary uppercase text-[10px] tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {trivia.map((t) => (
                          <tr key={t.id} className="hover:bg-surface-hover transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-bold text-text-primary">{t.title}</span>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="pink">{t.category}</Badge>
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold text-text-muted">
                              {t.play_count.toLocaleString()} plays
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant={t.is_banned ? 'danger' : 'success'}>
                                {t.is_banned ? 'Banned' : 'Active'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button
                                variant={t.is_banned ? 'secondary' : 'danger'}
                                size="sm"
                                onClick={() => toggleTriviaBan(t.id, t.is_banned)}
                                className="px-3.5 py-1.5 text-xs font-black flex items-center gap-1.5 ml-auto"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                {t.is_banned ? 'Restore' : 'Ban'}
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {trivia.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-text-muted font-bold">
                              No trivia items found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>

                {/* Add Pre-made Trivia Form */}
                <Card>
                  <CardHeader>
                    <h3 className="font-display font-extrabold text-xl text-text-primary flex items-center gap-2">
                      <Plus className="w-5 h-5 text-purple-600" /> Add Pre-made Trivia Game
                    </h3>
                    <p className="text-xs text-text-secondary">
                      Create trivia quizzes that will list under the community trending section.
                    </p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={submitNewTrivia} className="flex flex-col gap-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Trivia Title"
                          placeholder="e.g., Ultimate Harry Potter Quiz 🧙‍♂️"
                          value={newTriviaTitle}
                          onChange={(e) => setNewTriviaTitle(e.target.value)}
                          required
                        />
                        <Input
                          label="Category"
                          placeholder="e.g., Movies, Style, Pop Culture"
                          value={newTriviaCategory}
                          onChange={(e) => setNewTriviaCategory(e.target.value)}
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-4">
                        <span className="text-sm font-bold text-text-secondary uppercase tracking-wider">
                          Questions
                        </span>
                        
                        {newQuestions.map((q, qIdx) => (
                          <div key={qIdx} className="border border-border rounded-card p-5 bg-canvas flex flex-col gap-4 relative">
                            {newQuestions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestion(qIdx)}
                                className="absolute top-4 right-4 text-text-muted hover:text-error p-1 rounded-full hover:bg-white border border-border"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}

                            <Input
                              label={`Question #${qIdx + 1} Text`}
                              placeholder="e.g., Who is the Headmaster of Hogwarts?"
                              value={q.question}
                              onChange={(e) => handleQuestionChange(qIdx, 'question', e.target.value)}
                              required
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {q.options.map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`correct_${qIdx}`}
                                    checked={q.correct_index === optIdx}
                                    onChange={() => handleQuestionChange(qIdx, 'correct_index', optIdx)}
                                    className="cursor-pointer"
                                  />
                                  <Input
                                    placeholder={`Option ${['A', 'B', 'C', 'D'][optIdx]}`}
                                    value={opt}
                                    onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                                    className="flex-1"
                                    required
                                  />
                                </div>
                              ))}
                            </div>
                            <span className="text-[10px] text-text-muted font-bold font-body">
                              * Select the radio button adjacent to the correct option.
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <Button type="button" variant="secondary" onClick={handleAddQuestion}>
                          Add Question
                        </Button>
                        <Button type="submit" variant="primary" isLoading={isAddingTrivia} className="flex-grow">
                          Create Trivia
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6"
              >
                <Card>
                  <CardHeader>
                    <h3 className="font-display font-extrabold text-xl text-text-primary">
                      Environment Configuration Details
                    </h3>
                    <p className="text-xs text-text-secondary">
                      Read-only details compiled on the server shell.
                    </p>
                  </CardHeader>
                  <CardContent className="p-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-text-secondary uppercase">API Node Runtime</span>
                      <span className="text-sm font-mono font-bold bg-canvas border border-border px-3 py-2 rounded-input">
                        {process.version || 'Node.js 20.x'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-text-secondary uppercase">App Target URL</span>
                      <span className="text-sm font-mono font-bold bg-canvas border border-border px-3 py-2 rounded-input">
                        {process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
                      </span>
                    </div>
                    <div className="bg-purple-50 border border-purple-100 rounded-card p-4 flex gap-3 text-xs text-purple-700 leading-relaxed font-semibold">
                      <HelpCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        To modify administrative secrets, replace the values of <strong className="font-mono bg-purple-100 px-1 py-0.25 rounded text-purple-900">ADMIN_PASSWORD</strong> and <strong className="font-mono bg-purple-100 px-1 py-0.25 rounded text-purple-900">ADMIN_SECRET_TOKEN</strong> in your shell env variables or <strong className="font-mono bg-purple-100 px-1 py-0.25 rounded text-purple-900">.env.local</strong>.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Admin dashboard footer */}
      <footer className="py-6 border-t border-border bg-white/20 text-center text-xs text-text-muted relative z-10">
        Quizly✦ Administrative Control Center
      </footer>
    </div>
  )
}
