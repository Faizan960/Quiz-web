'use client'

import { useState, useEffect } from 'react'

const ADMIN_TOKEN_KEY = 'quizly_admin_token'

const NAV = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'ads',       icon: '📢', label: 'Ad Manager' },
  { id: 'quizzes',   icon: '📝', label: 'Moderation' },
  { id: 'users',     icon: '👥', label: 'Users' },
  { id: 'settings',  icon: '⚙️', label: 'Settings' },
]

const WEEK = [65, 120, 88, 210, 175, 340, 280]
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export default function AdminPage() {
  const [token, setToken]     = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [tab, setTab]         = useState('dashboard')
  const [ads, setAds]         = useState<any>(null)
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [users, setUsers]     = useState<any[]>([])
  const [saving, setSaving]   = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

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
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    if (!res.ok) { setLoginError('Wrong password'); return }
    localStorage.setItem(ADMIN_TOKEN_KEY, data.token)
    setToken(data.token)
    setLoginError('')
  }

  const logout = () => { localStorage.removeItem(ADMIN_TOKEN_KEY); setToken('') }

  const saveAds = async () => {
    setSaving(true)
    await fetch('/api/admin/ads', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify(ads),
    })
    setSaveMsg('Saved ✓'); setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  const modQuiz = async (quiz_id: string, action: string) => {
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
  }

  const modUser = async (user_id: string, action: string) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ user_id, action }),
    })
    setUsers(prev => prev.map(u => u.id === user_id ? { ...u, is_banned: action === 'ban' } : u))
  }

  const maxW = Math.max(...WEEK)

  /* ── Styles ────────────────────────────────── */
  const s = {
    card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 24 } as any,
    label: { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 } as any,
    input: { width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 14, outline: 'none', resize: 'vertical' } as any,
    btn: (variant = 'primary') => ({
      padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
      fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
      background: variant === 'primary' ? 'linear-gradient(135deg,var(--pink),var(--purple))'
        : variant === 'danger' ? 'rgba(255,77,109,0.1)' : 'var(--surface2)',
      color: variant === 'danger' ? 'var(--red)' : 'white',
    }) as any,
    badge: (ok: boolean) => ({
      display: 'inline-block', padding: '3px 10px', borderRadius: 100,
      fontSize: 11, fontWeight: 600,
      background: ok ? 'rgba(6,214,160,0.15)' : 'rgba(255,77,109,0.15)',
      color: ok ? 'var(--green)' : 'var(--red)',
    }) as any,
    th: { textAlign: 'left', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', paddingBottom: 12, borderBottom: '1px solid var(--border)' } as any,
    td: { padding: '14px 0', borderBottom: '1px solid var(--border)', fontSize: 14, verticalAlign: 'middle' } as any,
  }

  /* ── LOGIN ─────────────────────────────────── */
  if (!token) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: 48, width: '100%', maxWidth: 380, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, background: 'linear-gradient(135deg,var(--pink),var(--purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 6 }}>Quizly✦</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 40 }}>Admin Access Only</div>
        {loginError && (
          <div style={{ background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--red)', marginBottom: 16 }}>❌ {loginError}</div>
        )}
        <div style={{ textAlign: 'left', marginBottom: 20 }}>
          <label style={s.label}>Admin Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Enter password..." style={s.input} />
        </div>
        <button onClick={handleLogin} style={{ ...s.btn(), width: '100%', padding: 14, fontSize: 15 }}>Login →</button>
      </div>
    </div>
  )

  /* ── ADMIN PANEL ───────────────────────────── */
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', padding: '28px 0', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, background: 'linear-gradient(135deg,var(--pink),var(--purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', padding: '0 20px', marginBottom: 4 }}>Quizly✦</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', padding: '0 20px', marginBottom: 28, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin</div>
        {NAV.map(item => (
          <div key={item.id} onClick={() => setTab(item.id)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '11px 20px',
            cursor: 'pointer', fontSize: 14, color: tab === item.id ? 'var(--pink)' : 'var(--muted)',
            background: tab === item.id ? 'rgba(255,107,157,0.07)' : 'transparent',
            borderLeft: tab === item.id ? '3px solid var(--pink)' : '3px solid transparent',
          }}>
            <span>{item.icon}</span>{item.label}
          </div>
        ))}
        <div onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 20px', cursor: 'pointer', fontSize: 14, color: 'var(--red)', marginTop: 24 }}>
          🚪 Logout
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>
            {NAV.find(n => n.id === tab)?.icon} {NAV.find(n => n.id === tab)?.label}
          </div>
          {saveMsg && <div style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>{saveMsg}</div>}
        </div>

        <div style={{ padding: 32 }}>

          {/* ── DASHBOARD ──────────────────────── */}
          {tab === 'dashboard' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 32 }}>
                {[
                  { label: 'Total Quizzes', num: quizzes.length.toLocaleString(), color: 'var(--pink)' },
                  { label: 'Total Plays', num: quizzes.reduce((a,q) => a + (q.total_plays||0), 0).toLocaleString(), color: 'var(--purple)' },
                  { label: 'Active Users', num: users.filter(u=>!u.is_banned).length.toLocaleString(), color: 'var(--cyan)' },
                  { label: 'Reported', num: quizzes.filter(q=>q.is_reported).length.toString(), color: 'var(--yellow)' },
                ].map(s2 => (
                  <div key={s2.label} style={s.card}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{s2.label}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: s2.color }}>{s2.num}</div>
                  </div>
                ))}
              </div>
              <div style={s.card}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 20 }}>📈 Plays This Week (mock)</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
                  {WEEK.map((v, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: '100%', borderRadius: '6px 6px 0 0', height: `${(v/maxW)*100}%`, background: 'linear-gradient(180deg,var(--pink),var(--purple))', opacity: 0.8 }} />
                      <div style={{ fontSize: 10, color: 'var(--muted)' }}>{DAYS[i]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── AD MANAGER ─────────────────────── */}
          {tab === 'ads' && ads && (
            <>
              <div style={s.card}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 20 }}>🎛️ Toggle Ad Slots</div>
                {[
                  { key: 'home_banner', label: 'Home Banner', desc: 'Top of home page' },
                  { key: 'home_bottom', label: 'Home Bottom', desc: 'Below quiz grid' },
                  { key: 'player_start', label: 'Quiz Start', desc: 'Before quiz begins' },
                  { key: 'result_page', label: 'Result Page', desc: 'After quiz ends (highest CTR)' },
                  { key: 'between_q', label: 'Between Questions', desc: 'Every 3rd question' },
                ].map(slot => (
                  <div key={slot.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{slot.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{slot.desc}</div>
                    </div>
                    <div
                      onClick={() => setAds((prev: any) => ({ ...prev, [`${slot.key}_enabled`]: !prev[`${slot.key}_enabled`] }))}
                      style={{
                        width: 44, height: 24, borderRadius: 100, cursor: 'pointer',
                        background: ads[`${slot.key}_enabled`] ? 'var(--pink)' : 'var(--surface2)',
                        border: `1px solid ${ads[`${slot.key}_enabled`] ? 'var(--pink)' : 'var(--border)'}`,
                        position: 'relative', transition: 'all 0.2s',
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: 3, left: ads[`${slot.key}_enabled`] ? 23 : 3,
                        width: 16, height: 16, borderRadius: '50%', background: 'white',
                        transition: 'left 0.2s',
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={s.card}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 8 }}>💻 AdSense Codes</div>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>Paste your AdSense ad unit code for each slot below.</p>
                {[
                  { key: 'home_banner_code', label: 'Home Banner Code' },
                  { key: 'home_bottom_code', label: 'Home Bottom Code' },
                  { key: 'result_page_code', label: 'Result Page Code' },
                  { key: 'player_start_code', label: 'Player Start Code' },
                  { key: 'between_q_code', label: 'Between Questions Code' },
                  { key: 'adsense_publisher_id', label: 'Publisher ID (ca-pub-XXXX)' },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: 18 }}>
                    <label style={s.label}>{f.label}</label>
                    <textarea
                      rows={f.key.includes('code') ? 3 : 1}
                      value={ads[f.key] ?? ''} placeholder={f.key.includes('publisher') ? 'ca-pub-XXXXXXXXXXXXXXXX' : '<ins class="adsbygoogle" ...'}
                      onChange={e => setAds((prev: any) => ({ ...prev, [f.key]: e.target.value }))}
                      style={s.input}
                    />
                  </div>
                ))}
                <button onClick={saveAds} disabled={saving} style={s.btn()}>
                  {saving ? 'Saving...' : '💾 Save All Ad Settings'}
                </button>
              </div>
            </>
          )}

          {/* ── MODERATION ─────────────────────── */}
          {tab === 'quizzes' && (
            <div style={s.card}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 20 }}>📝 All Quizzes</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Title','Creator','Plays','Reported','Status','Actions'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map(q => (
                    <tr key={q.id}>
                      <td style={s.td}>{q.title}</td>
                      <td style={{ ...s.td, color: 'var(--muted)', fontSize: 13 }}>{q.creator_name}</td>
                      <td style={{ ...s.td, color: 'var(--muted)' }}>{(q.total_plays||0).toLocaleString()}</td>
                      <td style={s.td}>{q.is_reported ? <span style={{ ...s.badge(false), background: 'rgba(255,214,10,0.15)', color: 'var(--yellow)' }}>⚠️ Yes</span> : <span style={{ color: 'var(--muted)', fontSize: 13 }}>—</span>}</td>
                      <td style={s.td}><span style={s.badge(!q.is_banned)}>{q.is_banned ? 'Banned' : 'Active'}</span></td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => modQuiz(q.id, q.is_banned ? 'unban' : 'ban')} style={{ ...s.btn(q.is_banned ? 'ghost' : 'danger'), padding: '6px 12px', fontSize: 12, borderRadius: 8 }}>
                            {q.is_banned ? 'Unban' : 'Ban'}
                          </button>
                          <button onClick={() => modQuiz(q.id, q.is_featured ? 'unfeature' : 'feature')} style={{ ...s.btn('ghost'), padding: '6px 12px', fontSize: 12, borderRadius: 8, color: q.is_featured ? 'var(--yellow)' : 'var(--muted)' }}>
                            {q.is_featured ? '★ Unfeature' : '☆ Feature'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {quizzes.length === 0 && (
                    <tr><td colSpan={6} style={{ ...s.td, textAlign: 'center', color: 'var(--muted)' }}>No quizzes yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ── USERS ──────────────────────────── */}
          {tab === 'users' && (
            <div style={s.card}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 20 }}>👥 All Users</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Username','Quizzes','Joined','Status','Action'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={s.td}>{u.username}</td>
                      <td style={{ ...s.td, color: 'var(--muted)' }}>{u.total_quizzes ?? 0}</td>
                      <td style={{ ...s.td, color: 'var(--muted)', fontSize: 13 }}>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td style={s.td}><span style={s.badge(!u.is_banned)}>{u.is_banned ? 'Banned' : 'Active'}</span></td>
                      <td style={s.td}>
                        <button onClick={() => modUser(u.id, u.is_banned ? 'unban' : 'ban')} style={{ ...s.btn(u.is_banned ? 'ghost' : 'danger'), padding: '6px 12px', fontSize: 12, borderRadius: 8 }}>
                          {u.is_banned ? 'Unban' : 'Ban'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={5} style={{ ...s.td, textAlign: 'center', color: 'var(--muted)' }}>No users yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ── SETTINGS ───────────────────────── */}
          {tab === 'settings' && (
            <div style={s.card}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 20 }}>⚙️ Site Settings</div>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>Update your environment variables in <code style={{ color: 'var(--pink)', background: 'rgba(255,107,157,0.1)', padding: '2px 6px', borderRadius: 4 }}>.env.local</code> for the settings below.</p>
              {[
                { label: 'App URL', val: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000' },
                { label: 'App Name', val: process.env.NEXT_PUBLIC_APP_NAME || 'Quizly' },
              ].map(item => (
                <div key={item.label} style={{ marginBottom: 18 }}>
                  <label style={s.label}>{item.label}</label>
                  <input value={item.val} readOnly style={{ ...s.input, opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
              ))}
              <div style={{ marginTop: 8, padding: 16, background: 'rgba(199,125,255,0.05)', borderRadius: 12, border: '1px solid rgba(199,125,255,0.15)', fontSize: 13, color: 'var(--muted)' }}>
                💡 To change the admin password, update <code style={{ color: 'var(--pink)' }}>ADMIN_PASSWORD</code> and <code style={{ color: 'var(--pink)' }}>ADMIN_SECRET_TOKEN</code> in your <code style={{ color: 'var(--pink)' }}>.env.local</code> file and redeploy.
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
