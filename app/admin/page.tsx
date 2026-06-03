'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Lock, Eye, EyeOff, BarChart3, Megaphone, ShieldAlert, Users, Settings, LogOut, 
  ArrowLeft, ArrowRight, Star, Ban, Settings2
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

type AdminQuiz = {
  id: string
  title: string
  creator_name: string
  total_plays: number
  is_reported: boolean
  is_banned: boolean
  is_featured: boolean
}

type AdminUser = {
  id: string
  username: string
  total_quizzes: number
  created_at: string
  is_banned: boolean
}

export default function AdminPage() {
  const [token, setToken]     = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [tab, setTab]         = useState('dashboard')
  const [ads, setAds]         = useState<Record<string, string | boolean | null> | null>(null)
  const [quizzes, setQuizzes] = useState<AdminQuiz[]>([])
  const [users, setUsers]     = useState<AdminUser[]>([])
  const [saving, setSaving]   = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Check for saved token
  useEffect(() => {
    const saved = localStorage.getItem(ADMIN_TOKEN_KEY)
    if (saved) {
      const t = setTimeout(() => setToken(saved), 0)
      return () => clearTimeout(t)
    }
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
        <div className="absolute inset-0 z-0 pointer-events-none bg-dot-grid opacity-90" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" />
        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md glass-card p-10 text-center border border-border shadow-xl bg-surface"
        >
          <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary shadow-sm">
            <Lock className="w-6 h-6 animate-float" />
          </div>
          
          <h1 className="font-display text-3xl font-black mb-2 text-text-primary tracking-tight">Admin Gate</h1>
          <p className="text-text-secondary text-xs mb-8 font-semibold">
            Protected area. Please input credentials to authenticate.
          </p>

          <AnimatePresence mode="wait">
            {loginError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 mb-6 rounded-2xl bg-rose-50 border border-rose-200/50 text-rose-500 text-xs font-bold flex items-center gap-2 text-left shadow-sm"
              >
                <span>⚠️ {loginError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6">
            <div className="text-left">
              <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2.5">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="••••••••"
                  className="w-full bg-background border border-border rounded-2xl px-5 py-4 pr-12 text-text-primary placeholder:text-text-muted focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm font-semibold shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full py-4.5 bg-gradient-to-r from-primary to-secondary hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] text-white font-black text-xs md:text-sm rounded-2xl transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-2 cursor-pointer border-0"
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <Link href="/" className="inline-flex items-center gap-1.5 mt-8 text-xs text-text-secondary hover:text-text-primary transition-colors font-bold cursor-pointer hover:-translate-x-0.5 duration-200">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to home
          </Link>
        </motion.div>
      </div>
    )
  }

  const ActiveIcon = NAV.find(n => n.id === tab)?.icon || BarChart3

  /* ── ADMIN SYSTEM VIEW ────────────────────────── */
  return (
    <div className="min-h-screen bg-background relative flex flex-col md:flex-row text-text-primary overflow-x-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-dot-grid opacity-75" />
      <div className="absolute inset-0 z-0 pointer-events-none bg-pastel-gradient opacity-90" />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-68 bg-surface border-r border-border p-6 h-screen sticky top-0 overflow-y-auto z-25">
        <div className="flex items-center gap-2.5 mb-10 px-3 py-1">
          <span className="text-2xl animate-float">🪞</span>
          <div className="flex flex-col">
            <span className="text-gradient font-display font-black text-lg tracking-tight leading-none">Social Mirror</span>
            <span className="text-[9px] text-text-muted font-black tracking-widest uppercase mt-1">Admin Dashboard</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5">
          {NAV.map(item => {
            const Icon = item.icon
            const active = tab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl text-xs md:text-sm font-bold transition-all cursor-pointer border ${
                  active 
                    ? 'bg-primary/5 border-primary/20 text-primary shadow-sm' 
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-300 ${active ? 'text-primary scale-110' : 'text-text-secondary'}`} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="pt-6 border-t border-border mt-auto">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl text-xs md:text-sm font-bold text-rose-500 hover:bg-rose-50/50 hover:border-rose-100 border border-transparent transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Logout Portal</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden glass-panel flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 z-40 w-full">
        <div className="flex items-center gap-2">
          <span className="text-lg">🪞</span>
          <span className="text-gradient font-display font-black text-sm tracking-tight">Social Mirror Admin</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-text-primary p-2 bg-background rounded-xl border border-border cursor-pointer transition-all hover:bg-zinc-50"
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
            className="md:hidden fixed top-[57px] left-0 w-full bg-surface border-b border-border z-30 shadow-2xl p-5"
          >
            <nav className="space-y-1.5">
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
                    className={`w-full flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                      active 
                        ? 'bg-primary/5 border-primary/20 text-primary' 
                        : 'text-text-secondary hover:bg-zinc-50 border-transparent'
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
                className="w-full flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl text-xs font-bold text-rose-500 hover:bg-rose-50 border border-transparent cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout Portal</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Panel Content Area */}
      <main className="flex-1 overflow-hidden relative z-10 flex flex-col bg-background/20">
        {/* Dashboard Top bar */}
        <div className="hidden md:flex items-center justify-between px-8 py-5 border-b border-border bg-surface/50 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/5 border border-primary/10 rounded-xl">
              <ActiveIcon className="w-4.5 h-4.5 text-primary" />
            </div>
            <h2 className="font-display text-base font-extrabold tracking-tight">
              {NAV.find(n => n.id === tab)?.label}
            </h2>
          </div>
          <AnimatePresence>
            {saveMsg && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-4 py-1.5 rounded-full shadow-inner"
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: 'Total Quizzes', num: quizzes.length.toLocaleString(), color: 'text-primary', desc: 'Active mirrors' },
                  { label: 'Total Plays', num: quizzes.reduce((acc, q) => acc + (q.total_plays || 0), 0).toLocaleString(), color: 'text-secondary', desc: 'Friend answers' },
                  { label: 'Active Users', num: users.filter(u => !u.is_banned).length.toLocaleString(), color: 'text-accent', desc: 'Creators registered' },
                  { label: 'Reported Quizzes', num: quizzes.filter(q => q.is_reported).length.toString(), color: 'text-amber-500', desc: 'Awaiting moderation' },
                ].map((stat, i) => (
                  <div key={i} className="glass-card p-6 border border-border shadow-sm flex flex-col justify-between bg-surface group hover:border-primary/20">
                    <div>
                      <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest block mb-1">
                        {stat.label}
                      </span>
                      <span className="text-[11px] text-text-muted font-medium">
                        {stat.desc}
                      </span>
                    </div>
                    <span className={`font-display text-3xl sm:text-4xl font-black mt-6 ${stat.color} tracking-tight`}>
                      {stat.num}
                    </span>
                  </div>
                ))}
              </div>

              {/* Plays Weekly Graph */}
              <div className="glass-card p-6 md:p-8 border border-border shadow-sm bg-surface">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-display text-base font-bold text-text-primary">
                      Engagement Volume
                    </h3>
                    <p className="text-xs text-text-secondary font-medium">
                      Daily submissions activity and response rates
                    </p>
                  </div>
                  <span className="text-[9px] font-extrabold text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10 uppercase tracking-widest">
                    Live Demo Data
                  </span>
                </div>
                
                {/* Visual Graphic Representation */}
                <div className="relative pt-6 px-4 bg-background rounded-3xl border border-border p-6 shadow-inner">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-6 py-10 opacity-30">
                    <div className="w-full border-t border-dashed border-border" />
                    <div className="w-full border-t border-dashed border-border" />
                    <div className="w-full border-t border-dashed border-border" />
                  </div>
                  
                  <div className="relative z-10 flex items-end justify-between gap-3 sm:gap-6 h-48">
                    {WEEK.map((v, i) => {
                      const heightPct = `${(v / maxW) * 80}%`
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-3.5 group h-full justify-end">
                          <div className="relative w-full flex justify-center items-end h-full">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 scale-0 group-hover:scale-100 bg-text-primary px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-white transition-all duration-200 pointer-events-none z-20 shadow-md flex flex-col items-center">
                              <span className="whitespace-nowrap">{v} plays</span>
                              <div className="w-2 h-2 bg-text-primary rotate-45 -translate-y-1 absolute top-full" />
                            </div>
                            {/* Bar */}
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: heightPct }}
                              transition={{ duration: 0.8, delay: i * 0.05 }}
                              className="w-full sm:w-10 rounded-t-2xl bg-gradient-to-t from-primary/80 to-secondary opacity-90 group-hover:opacity-100 transition-all duration-300 shadow-sm cursor-pointer"
                            />
                          </div>
                          <span className="text-[10px] text-text-secondary font-black tracking-wider uppercase">{DAYS[i]}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── AD MANAGER TAB ─────────────────────── */}
          {tab === 'ads' && ads && (
            <div className="space-y-6">
              <div className="glass-card p-6 md:p-8 border border-border shadow-sm bg-surface">
                <h3 className="font-display text-base font-bold text-text-primary mb-6 flex items-center gap-2.5">
                  <Megaphone className="w-5 h-5 text-primary" /> Active Advertisement Slots
                </h3>
                
                <div className="divide-y divide-border/60">
                  {[
                    { key: 'home_banner', label: 'Home Banner Ad', desc: 'Prominent header banner displayed at the landing hero boundary.' },
                    { key: 'home_bottom', label: 'Home Bottom Ad', desc: 'Appears at the footer zone beneath all public dashboards.' },
                    { key: 'player_start', label: 'Trivia Quiz Start Ad', desc: 'Displays when a new participant enters the onboarding wizard.' },
                    { key: 'result_page', label: 'End Results Page Ad', desc: 'Shown adjacent to high-traffic scoring profiles and identity cards.' },
                    { key: 'between_q', label: 'Interstitial Question Ad', desc: 'Appears sequentially after every 3rd question responds.' },
                  ].map(slot => (
                    <div key={slot.key} className="flex items-center justify-between py-5.5 first:pt-0 last:pb-0">
                      <div className="pr-4">
                        <div className="text-sm font-bold text-text-primary">{slot.label}</div>
                        <div className="text-xs text-text-secondary mt-1 font-medium">{slot.desc}</div>
                      </div>

                      {/* Custom Switch Component */}
                      <div 
                        onClick={() => setAds(prev => prev ? { ...prev, [`${slot.key}_enabled`]: !prev[`${slot.key}_enabled`] } : null)}
                        className={`w-12 h-6.5 rounded-full cursor-pointer transition-all duration-300 relative border shrink-0 ${
                          ads?.[`${slot.key}_enabled`] 
                            ? 'bg-gradient-to-r from-primary to-secondary border-primary/20 animate-pulse-glow' 
                            : 'bg-zinc-100 border-zinc-200'
                        }`}
                      >
                        <motion.div 
                          className="w-5 h-5 rounded-full bg-white absolute top-0.5 shadow-sm"
                          animate={{ left: ads[`${slot.key}_enabled`] ? '24px' : '2px' }}
                          transition={{ type: "spring", stiffness: 600, damping: 30 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6 md:p-8 border border-border shadow-sm space-y-6 bg-surface">
                <div>
                  <h3 className="font-display text-base font-bold text-text-primary">AdSense Scripts</h3>
                  <p className="text-xs text-text-secondary mt-1.5 font-medium">Configure specific script integration snippets generated by your Google AdSense accounts.</p>
                </div>

                <div className="space-y-5">
                  {[
                    { key: 'home_banner_code', label: 'Home Banner HTML Script' },
                    { key: 'home_bottom_code', label: 'Home Bottom HTML Script' },
                    { key: 'result_page_code', label: 'Result Page HTML Script' },
                    { key: 'player_start_code', label: 'Player Start HTML Script' },
                    { key: 'between_q_code', label: 'Between Questions HTML Script' },
                    { key: 'adsense_publisher_id', label: 'Publisher ID (ca-pub-XXXXXXXXXXXXXXXX)' },
                  ].map(field => (
                    <div key={field.key} className="space-y-2.5">
                      <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest">
                        {field.label}
                      </label>
                      <textarea
                        rows={field.key.includes('code') ? 2 : 1}
                        value={(ads?.[field.key] as string) ?? ''}
                        placeholder={field.key.includes('publisher') ? 'ca-pub-XXXXXXXXXXXXXXXX' : '<ins class="adsbygoogle" ...'}
                        onChange={e => setAds(prev => prev ? { ...prev, [field.key]: e.target.value } : null)}
                        className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-text-primary text-xs font-mono placeholder:text-text-muted focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-y shadow-inner"
                      />
                    </div>
                  ))}

                  <div className="pt-3">
                    <button 
                      onClick={saveAds} 
                      disabled={saving}
                      className="px-6 py-4 bg-gradient-to-r from-primary to-secondary hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 border-0"
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
            <div className="glass-card border border-border shadow-sm overflow-hidden bg-surface">
              <div className="p-6 border-b border-border bg-surface/50 backdrop-blur-md">
                <h3 className="font-display text-base font-bold text-text-primary">
                  Moderate Content Listings
                </h3>
                <p className="text-xs text-text-secondary mt-1.5 font-medium">Moderate live public trivia indices, ban offensive content or toggle features.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-background/80 border-b border-border">
                      <th className="px-6 py-4.5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Title</th>
                      <th className="px-6 py-4.5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Creator</th>
                      <th className="px-6 py-4.5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Total Plays</th>
                      <th className="px-6 py-4.5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Reported</th>
                      <th className="px-6 py-4.5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4.5 text-[10px] font-black text-text-secondary uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {quizzes.map(q => (
                      <tr key={q.id} className="hover:bg-surface-hover transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-text-primary">{q.title}</td>
                        <td className="px-6 py-4 text-xs font-semibold text-text-secondary">{q.creator_name}</td>
                        <td className="px-6 py-4 text-xs font-medium text-text-muted">{(q.total_plays || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-xs">
                          {q.is_reported ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black bg-amber-50 border border-amber-200/60 text-amber-600">
                              <ShieldAlert className="w-3 h-3" /> Reported
                            </span>
                          ) : (
                            <span className="text-text-muted font-bold text-[10px]">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-bold border ${
                            q.is_banned 
                              ? 'bg-rose-50 border-rose-200 text-rose-500' 
                              : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                          }`}>
                            {q.is_banned ? 'Banned' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2.5">
                            <button 
                              onClick={() => modQuiz(q.id, q.is_banned ? 'unban' : 'ban')}
                              className={`px-3.5 py-2 rounded-xl text-[10px] font-black border transition-all cursor-pointer flex items-center gap-1.5 ${
                                q.is_banned
                                  ? 'bg-emerald-50 border-emerald-200/50 text-emerald-600 hover:bg-emerald-100/70'
                                  : 'bg-rose-50 border-rose-200/50 text-rose-500 hover:bg-rose-100/70'
                              }`}
                            >
                              <Ban className="w-3.5 h-3.5" />
                              {q.is_banned ? 'Unban' : 'Ban'}
                            </button>
                            <button 
                              onClick={() => modQuiz(q.id, q.is_featured ? 'unfeature' : 'feature')}
                              className={`px-3.5 py-2 rounded-xl text-[10px] font-black border transition-all cursor-pointer flex items-center gap-1.5 ${
                                q.is_featured
                                  ? 'bg-amber-50 border-amber-200 text-amber-600'
                                  : 'bg-background border-border hover:bg-zinc-50 text-text-secondary hover:text-text-primary'
                              }`}
                            >
                              <Star className={`w-3.5 h-3.5 ${q.is_featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                              {q.is_featured ? 'Featured' : 'Feature'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {quizzes.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-xs text-text-muted font-bold">
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
            <div className="glass-card border border-border shadow-sm overflow-hidden bg-surface">
              <div className="p-6 border-b border-border bg-surface/50 backdrop-blur-md">
                <h3 className="font-display text-base font-bold text-text-primary">
                  Manage User Accounts
                </h3>
                <p className="text-xs text-text-secondary mt-1.5 font-medium">Revoke, suspend or activate user profile credentials.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-background/80 border-b border-border">
                      <th className="px-6 py-4.5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Username</th>
                      <th className="px-6 py-4.5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Quizzes Created</th>
                      <th className="px-6 py-4.5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Joined Date</th>
                      <th className="px-6 py-4.5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4.5 text-[10px] font-black text-text-secondary uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-surface-hover transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-text-primary">{u.username}</td>
                        <td className="px-6 py-4 text-xs font-semibold text-text-secondary">{u.total_quizzes ?? 0}</td>
                        <td className="px-6 py-4 text-xs font-medium text-text-muted">{new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                        <td className="px-6 py-4 text-xs">
                          <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-bold border ${
                            u.is_banned 
                              ? 'bg-rose-50 border-rose-200 text-rose-500' 
                              : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                          }`}>
                            {u.is_banned ? 'Banned' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => modUser(u.id, u.is_banned ? 'unban' : 'ban')}
                            className={`px-3.5 py-2 rounded-xl text-[10px] font-black border transition-all cursor-pointer flex items-center gap-1.5 ml-auto ${
                              u.is_banned
                                ? 'bg-emerald-50 border-emerald-200/50 text-emerald-600 hover:bg-emerald-100/70'
                                : 'bg-rose-50 border-rose-200/50 text-rose-500 hover:bg-rose-100/70'
                            }`}
                          >
                            <Ban className="w-3.5 h-3.5" />
                            {u.is_banned ? 'Activate' : 'Ban User'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-xs text-text-muted font-bold">
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
            <div className="glass-card p-6 md:p-8 border border-border shadow-sm space-y-6 bg-surface">
              <div>
                <h3 className="font-display text-base font-bold text-text-primary">
                  Server Configurations
                </h3>
                <p className="text-xs text-text-secondary mt-1.5 font-medium">
                  Adjust global environment variables config. These configurations are read-only client-side.
                </p>
              </div>

              <div className="space-y-5">
                {[
                  { label: 'App URL', val: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000' },
                  { label: 'App Display Name', val: process.env.NEXT_PUBLIC_APP_NAME || 'Social Mirror' },
                ].map((item, i) => (
                  <div key={i} className="space-y-2.5">
                    <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest">
                      {item.label}
                    </label>
                    <input 
                      value={item.val} 
                      readOnly 
                      className="w-full bg-background border border-border text-text-secondary rounded-2xl px-5 py-4 text-xs font-semibold cursor-not-allowed outline-none select-all shadow-inner" 
                    />
                  </div>
                ))}
              </div>

              <div className="p-5 bg-primary/5 rounded-3xl border border-primary/10 text-xs text-text-secondary leading-relaxed flex gap-3.5 font-semibold">
                <span className="text-lg shrink-0">💡</span>
                <div>
                  To override these constants or replace the admin credential gate secrets, update <code className="text-primary font-black font-mono">ADMIN_PASSWORD</code> and <code className="text-primary font-black font-mono font-semibold bg-primary/5 px-1.5 py-0.5 rounded">ADMIN_SECRET_TOKEN</code> values within the <code className="text-primary font-black font-mono">.env.local</code> settings file directly and reload the server wrapper.
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
