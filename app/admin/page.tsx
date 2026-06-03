'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Lock, Eye, EyeOff, BarChart3, Megaphone, ShieldAlert, Users, Settings, LogOut, 
  ArrowLeft, ArrowRight, ShieldCheck, Star, Ban, ShieldAlert as ReportIcon, Check, Settings2, AppWindow
} from 'lucide-react'

const ADMIN_TOKEN_KEY = 'quizly_admin_token'

const NAV = [
  { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
  { id: 'ads',       icon: Megaphone, label: 'Ad Manager' },
  { id: 'quizzes',   icon: ShieldAlert, label: 'Moderation' },
  { id: 'users',     icon: Users, label: 'Users' },
  { id: 'settings',  icon: Settings, label: 'Settings' },
]

const WEEK = [65, 120, 88, 210, 175, 340, 280]
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export default function AdminPage() {
  const [token, setToken]     = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [tab, setTab]         = useState('dashboard')
  const [ads, setAds]         = useState<any>(null)
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [users, setUsers]     = useState<any[]>([])
  const [saving, setSaving]   = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Check for saved token
  useEffect(() => {
    const saved = localStorage.getItem(ADMIN_TOKEN_KEY)
    if (saved) setToken(saved)
  }, [])

  // Load data when logged in
  useEffect(() => {
    if (!token) return
    const headers = { 'x-admin-token': token }
    Promise.all([
      fetch('/api/admin/ads', { headers }).then(r => r.ok ? r.json() : null),
      fetch('/api/admin/quizzes', { headers }).then(r => r.ok ? r.json() : null),
      fetch('/api/admin/users', { headers }).then(r => r.ok ? r.json() : null),
    ]).then(([adsData, quizzesData, usersData]) => {
      if (adsData)    setAds(adsData.ads)
      if (quizzesData) setQuizzes(quizzesData.quizzes ?? [])
      if (usersData)  setUsers(usersData.users ?? [])
    })
  }, [token])

  const handleLogin = async () => {
    setLoginError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) { 
        setLoginError(data.error || 'Incorrect password')
        return 
      }
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token)
      setToken(data.token)
      setLoginError('')
    } catch {
      setLoginError('Server authentication failed')
    }
  }

  const logout = () => { 
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    setToken('') 
  }

  const saveAds = async () => {
    setSaving(true)
    try {
      await fetch('/api/admin/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify(ads),
      })
      setSaveMsg('Saved Successfully ✓')
      setTimeout(() => setSaveMsg(''), 3000)
    } catch {
      setSaveMsg('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const modQuiz = async (quiz_id: string, action: string) => {
    try {
      await fetch('/api/admin/quizzes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ quiz_id, action }),
      })
      setQuizzes(prev => prev.map(q => q.id === quiz_id ? {
        ...q,
        is_banned: action === 'ban' ? true : action === 'unban' ? false : q.is_banned,
        is_featured: action === 'feature' ? true : action === 'unfeature' ? false : q.is_featured,
      } : q))
    } catch {}
  }

  const modUser = async (user_id: string, action: string) => {
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ user_id, action }),
      })
      setUsers(prev => prev.map(u => u.id === user_id ? { ...u, is_banned: action === 'ban' } : u))
    } catch {}
  }

  const maxW = Math.max(...WEEK)

  /* ── LOGIN VIEW ───────────────────────────────── */
  if (!token) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden text-text-primary">
        <div className="absolute inset-0 z-0 pointer-events-none bg-dot-grid opacity-70" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-sm glass-card p-8 text-center border border-white/5 shadow-2xl"
        >
          <div className="w-12 h-12 bg-primary/10 border border-primary/25 rounded-2xl flex items-center justify-center mx-auto mb-5 text-primary-light shadow-sm">
            <Lock className="w-5 h-5" />
          </div>
          
          <h1 className="font-display text-2xl font-black mb-1.5 text-text-primary">Quizly Admin</h1>
          <p className="text-text-secondary text-xs mb-8 font-medium">
            Protected area. Please input credentials to authenticate.
          </p>

          <AnimatePresence mode="wait">
            {loginError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-3 mb-5 rounded-xl bg-rose-950/15 border border-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-2 text-left"
              >
                <span>⚠️ {loginError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <div className="text-left">
              <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="••••••••"
                  className="w-full bg-surface border border-white/5 rounded-2xl px-5 py-3.5 pr-12 text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all outline-none text-sm shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full py-4 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white font-black text-xs md:text-sm rounded-2xl transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <Link href="/" className="inline-flex items-center gap-1 mt-6 text-xs text-text-muted hover:text-text-primary transition-colors font-bold cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to home
          </Link>
        </motion.div>
      </div>
    )
  }

  const ActiveIcon = NAV.find(n => n.id === tab)?.icon || BarChart3

  /* ── ADMIN SYSTEM VIEW ────────────────────────── */
  return (
    <div className="min-h-screen bg-background relative flex flex-col md:flex-row text-text-primary">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-dot-grid opacity-50" />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-white/5 p-6 h-screen sticky top-0 overflow-y-auto z-20">
        <div className="flex items-center gap-2 mb-8 px-2">
          <span className="text-xl drop-shadow-[0_0_8px_rgba(124,58,237,0.4)]">✦</span>
          <span className="text-gradient font-display font-black text-lg tracking-tight">Quizly Admin</span>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV.map(item => {
            const Icon = item.icon
            const active = tab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  active 
                    ? 'bg-primary/10 border-l-2 border-primary text-primary-light font-bold' 
                    : 'text-text-secondary hover:bg-surface-hover/50 hover:text-text-primary'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-primary-light' : 'text-text-secondary'}`} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="pt-6 border-t border-white/5 mt-auto">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-950/15 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden glass-panel flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 z-40 w-full">
        <div className="flex items-center gap-2">
          <span className="text-lg">✦</span>
          <span className="text-gradient font-display font-black text-sm tracking-tight">Quizly Admin</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-text-primary p-1.5 bg-surface-hover/80 rounded-lg border border-white/5"
        >
          <Settings2 className="w-4.5 h-4.5" />
        </button>
      </header>

      {/* Mobile Menu Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed top-[57px] left-0 w-full bg-surface border-b border-white/5 z-30 shadow-2xl p-5"
          >
            <nav className="space-y-1">
              {NAV.map(item => {
                const Icon = item.icon
                const active = tab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTab(item.id)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                      active 
                        ? 'bg-primary/10 text-primary-light' 
                        : 'text-text-secondary'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
              <button 
                onClick={() => {
                  logout()
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-400"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Panel Content Area */}
      <main className="flex-1 overflow-hidden relative z-10 flex flex-col">
        {/* Dashboard Top bar */}
        <div className="hidden md:flex items-center justify-between px-8 py-5 border-b border-white/5 bg-surface/50 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <ActiveIcon className="w-5 h-5 text-primary-light" />
            <h2 className="font-display text-base font-bold tracking-tight">
              {NAV.find(n => n.id === tab)?.label}
            </h2>
          </div>
          <AnimatePresence>
            {saveMsg && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-500/25 px-3 py-1 rounded-full shadow-inner"
              >
                {saveMsg}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          
          {/* ── DASHBOARD TAB ──────────────────────── */}
          {tab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stat Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Quizzes', num: quizzes.length.toLocaleString(), color: 'text-primary-light', bg: 'bg-primary/5' },
                  { label: 'Total Plays', num: quizzes.reduce((acc, q) => acc + (q.total_plays || 0), 0).toLocaleString(), color: 'text-secondary', bg: 'bg-secondary/5' },
                  { label: 'Active Users', num: users.filter(u => !u.is_banned).length.toLocaleString(), color: 'text-accent', bg: 'bg-accent/5' },
                  { label: 'Reported Quizzes', num: quizzes.filter(q => q.is_reported).length.toString(), color: 'text-amber-400', bg: 'bg-amber-400/5' },
                ].map((stat, i) => (
                  <div key={i} className="glass-card p-5 border border-white/5 shadow-md flex flex-col justify-between">
                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-4">
                      {stat.label}
                    </span>
                    <span className={`font-display text-2xl sm:text-3xl font-black ${stat.color}`}>
                      {stat.num}
                    </span>
                  </div>
                ))}
              </div>

              {/* Plays Weekly Graph */}
              <div className="glass-card p-5 md:p-7 border border-white/5 shadow-md">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-display text-sm md:text-base font-bold text-text-primary">
                    Plays This Week
                  </h3>
                  <span className="text-[10px] font-bold text-text-muted bg-zinc-950 px-2.5 py-1 rounded-full border border-white/3 uppercase tracking-wider">
                    Mock Data
                  </span>
                </div>
                
                {/* Visual Graphic Representation */}
                <div className="flex items-end justify-between gap-3 h-44 mt-6 pt-4 px-2 bg-zinc-950/40 rounded-2xl border border-white/5 p-4">
                  {WEEK.map((v, i) => {
                    const heightPct = `${(v / maxW) * 100}%`
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                        <div className="relative w-full flex justify-center">
                          {/* Tooltip */}
                          <span className="absolute -top-7 scale-0 group-hover:scale-100 bg-primary px-1.5 py-0.5 rounded text-[9px] font-bold text-white transition-all pointer-events-none z-10">
                            {v} plays
                          </span>
                          {/* Bar */}
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: heightPct }}
                            transition={{ duration: 0.8, delay: i * 0.05 }}
                            className="w-full sm:w-8 rounded-t-lg bg-gradient-to-t from-primary to-secondary opacity-75 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                        <span className="text-[10px] sm:text-xs text-text-muted font-bold tracking-wider">{DAYS[i]}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── AD MANAGER TAB ─────────────────────── */}
          {tab === 'ads' && ads && (
            <div className="space-y-6">
              <div className="glass-card p-6 border border-white/5 shadow-md">
                <h3 className="font-display text-sm md:text-base font-bold text-text-primary mb-5 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-primary-light" /> Toggle Active Ad Slots
                </h3>
                
                <div className="divide-y divide-white/5">
                  {[
                    { key: 'home_banner', label: 'Home Banner Ad', desc: 'Sits at the top of the main home page header.' },
                    { key: 'home_bottom', label: 'Home Bottom Ad', desc: 'Appears at the footer zone beneath public grids.' },
                    { key: 'player_start', label: 'Trivia Quiz Start Ad', desc: 'Triggered when entering player name wizard.' },
                    { key: 'result_page', label: 'End Results Page Ad', desc: 'Highest CTR slot displayed with leaderboard scores.' },
                    { key: 'between_q', label: 'Interstitial Question Ad', desc: 'Shows every 3rd question during playing states.' },
                  ].map(slot => (
                    <div key={slot.key} className="flex items-center justify-between py-4">
                      <div className="pr-4">
                        <div className="text-sm font-bold text-text-primary">{slot.label}</div>
                        <div className="text-xs text-text-muted mt-0.5">{slot.desc}</div>
                      </div>

                      {/* Custom Switch Component */}
                      <div 
                        onClick={() => setAds((prev: any) => ({ ...prev, [`${slot.key}_enabled`]: !prev[`${slot.key}_enabled`] }))}
                        className={`w-11 h-6 rounded-full cursor-pointer transition-all relative border shrink-0 ${
                          ads[`${slot.key}_enabled`] 
                            ? 'bg-primary border-primary' 
                            : 'bg-zinc-950 border-white/10'
                        }`}
                      >
                        <motion.div 
                          className="w-4.5 h-4.5 rounded-full bg-white absolute top-0.5"
                          animate={{ left: ads[`${slot.key}_enabled`] ? '22px' : '2px' }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6 border border-white/5 shadow-md space-y-5">
                <div>
                  <h3 className="font-display text-sm md:text-base font-bold text-text-primary">AdSense Snippets</h3>
                  <p className="text-xs text-text-secondary mt-1">Configure individual script codes generated by Google AdSense below.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'home_banner_code', label: 'Home Banner Code' },
                    { key: 'home_bottom_code', label: 'Home Bottom Code' },
                    { key: 'result_page_code', label: 'Result Page Code' },
                    { key: 'player_start_code', label: 'Player Start Code' },
                    { key: 'between_q_code', label: 'Between Questions Code' },
                    { key: 'adsense_publisher_id', label: 'Publisher ID (ca-pub-XXXX)' },
                  ].map(field => (
                    <div key={field.key} className="space-y-2">
                      <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest">
                        {field.label}
                      </label>
                      <textarea
                        rows={field.key.includes('code') ? 2 : 1}
                        value={ads[field.key] ?? ''}
                        placeholder={field.key.includes('publisher') ? 'ca-pub-XXXXXXXXXXXXXXXX' : '<ins class="adsbygoogle" ...'}
                        onChange={e => setAds((prev: any) => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-text-primary text-xs font-mono placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none resize-y"
                      />
                    </div>
                  ))}

                  <div className="pt-2">
                    <button 
                      onClick={saveAds} 
                      disabled={saving}
                      className="px-6 py-3.5 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {saving ? 'Saving changes...' : 'Save Advertising Configurations'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── MODERATION TAB ─────────────────────── */}
          {tab === 'quizzes' && (
            <div className="glass-card border border-white/5 shadow-xl overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <h3 className="font-display text-sm md:text-base font-bold text-text-primary">
                  Manage Quizzes
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">Moderate trivia listings, ban inappropriate content or feature entries.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-950/40 border-b border-white/5">
                      <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Title</th>
                      <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Creator</th>
                      <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Total Plays</th>
                      <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Reported</th>
                      <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/3">
                    {quizzes.map(q => (
                      <tr key={q.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-text-primary">{q.title}</td>
                        <td className="px-6 py-4 text-xs font-semibold text-text-secondary">{q.creator_name}</td>
                        <td className="px-6 py-4 text-xs font-medium text-text-muted">{(q.total_plays || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-xs">
                          {q.is_reported ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black bg-amber-950/20 border border-amber-500/20 text-amber-400">
                              <ReportIcon className="w-3 h-3" /> Reported
                            </span>
                          ) : (
                            <span className="text-text-muted font-bold">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            q.is_banned 
                              ? 'bg-rose-950/20 border border-rose-500/20 text-rose-400' 
                              : 'bg-emerald-950/20 border border-emerald-500/20 text-emerald-400'
                          }`}>
                            {q.is_banned ? 'Banned' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => modQuiz(q.id, q.is_banned ? 'unban' : 'ban')}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                q.is_banned
                                  ? 'bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-950/30'
                                  : 'bg-rose-950/20 border border-rose-500/20 text-rose-400 hover:bg-rose-950/30'
                              }`}
                            >
                              <Ban className="w-3 h-3" />
                              {q.is_banned ? 'Unban' : 'Ban'}
                            </button>
                            <button 
                              onClick={() => modQuiz(q.id, q.is_featured ? 'unfeature' : 'feature')}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                                q.is_featured
                                  ? 'bg-amber-950/20 border-amber-500/20 text-amber-400'
                                  : 'bg-zinc-950 border-white/5 hover:bg-zinc-900 text-text-secondary hover:text-text-primary'
                              }`}
                            >
                              <Star className="w-3 h-3" />
                              {q.is_featured ? 'Featured' : 'Feature'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {quizzes.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-xs text-text-muted font-medium">
                          No trivia quizzes are currently registered in the database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── USERS TAB ──────────────────────────── */}
          {tab === 'users' && (
            <div className="glass-card border border-white/5 shadow-xl overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <h3 className="font-display text-sm md:text-base font-bold text-text-primary">
                  Manage Users
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">Revoke, suspend or activate user dashboard credentials.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-950/40 border-b border-white/5">
                      <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Username</th>
                      <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Quizzes Created</th>
                      <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Joined Date</th>
                      <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/3">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-text-primary">{u.username}</td>
                        <td className="px-6 py-4 text-xs font-semibold text-text-secondary">{u.total_quizzes ?? 0}</td>
                        <td className="px-6 py-4 text-xs font-medium text-text-muted">{new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                        <td className="px-6 py-4 text-xs">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            u.is_banned 
                              ? 'bg-rose-950/20 border border-rose-500/20 text-rose-400' 
                              : 'bg-emerald-950/20 border border-emerald-500/20 text-emerald-400'
                          }`}>
                            {u.is_banned ? 'Banned' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => modUser(u.id, u.is_banned ? 'unban' : 'ban')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ml-auto ${
                              u.is_banned
                                ? 'bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-950/30'
                                : 'bg-rose-950/20 border border-rose-500/20 text-rose-400 hover:bg-rose-950/30'
                            }`}
                          >
                            <Ban className="w-3 h-3" />
                            {u.is_banned ? 'Activate' : 'Ban User'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-xs text-text-muted font-medium">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── SETTINGS TAB ───────────────────────── */}
          {tab === 'settings' && (
            <div className="glass-card p-6 border border-white/5 shadow-xl space-y-6">
              <div>
                <h3 className="font-display text-sm md:text-base font-bold text-text-primary">
                  Site Configurations
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  Adjust global environment variables config. These configurations are read-only client-side.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'App URL', val: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000' },
                  { label: 'App Display Name', val: process.env.NEXT_PUBLIC_APP_NAME || 'Quizly' },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest">
                      {item.label}
                    </label>
                    <input 
                      value={item.val} 
                      readOnly 
                      className="w-full bg-zinc-950/60 border border-white/5 text-text-muted rounded-xl px-4 py-3.5 text-xs font-semibold cursor-not-allowed outline-none select-all" 
                    />
                  </div>
                ))}
              </div>

              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 text-xs text-text-secondary leading-relaxed flex gap-3">
                <span className="text-base shrink-0">💡</span>
                <div>
                  To override these constants or replace the admin credential gate secrets, update <code className="text-primary-light font-bold font-mono">ADMIN_PASSWORD</code> and <code className="text-primary-light font-bold font-mono">ADMIN_SECRET_TOKEN</code> values within the <code className="text-primary-light font-bold font-mono">.env.local</code> settings file directly and reload the server wrapper.
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
