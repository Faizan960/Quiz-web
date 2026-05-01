'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getAdSettings } from '@/lib/quiz'

const CATEGORIES = [
  { id: 'all',    label: 'All ✨' },
  { id: 'kpop',  label: 'K-Pop 🎵' },
  { id: 'fun',   label: 'Just Fun 🎉' },
  { id: 'movies',label: 'Movies 🎬' },
  { id: 'gaming',label: 'Gaming 🎮' },
]

const CAT_COLORS: Record<string, string> = {
  besties: '#FF6B9D', couples: '#FF4D6D', kpop: '#C77DFF',
  fun: '#FFD60A', movies: '#00B4D8', gaming: '#06D6A0',
}

function AdSlot({ code, label = 'Ad Space' }: { code?: string | null; label?: string }) {
  if (code) return <div dangerouslySetInnerHTML={{ __html: code }} className="my-6" />
  return (
    <div style={{
      margin: '24px 0', padding: 16, borderRadius: 12, textAlign: 'center',
      border: '1px dashed rgba(255,255,255,0.08)', color: 'rgba(240,240,245,0.2)',
      fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
    }}>{label}</div>
  )
}

export default function HomePage() {
  const [category, setCategory] = useState('all')
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [ads, setAds] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/quizzes?category=${category}&limit=12`)
      .then(r => r.json())
      .then(d => { setQuizzes(d.quizzes ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [category])

  useEffect(() => {
    getAdSettings().then(setAds)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 32px', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22,
          background: 'linear-gradient(135deg, var(--pink), var(--purple))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Quizly✦</div>
        <Link href="/create" style={{
          padding: '10px 22px', borderRadius: 100,
          background: 'linear-gradient(135deg, var(--pink), var(--purple))',
          color: 'white', fontWeight: 600, fontSize: 14,
          textDecoration: 'none', fontFamily: 'var(--font-body)',
        }}>+ Create Your Quiz</Link>
      </nav>

      <div style={{ padding: '100px 32px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(199,125,255,0.15), transparent), radial-gradient(ellipse 40% 40% at 80% 60%, rgba(255,107,157,0.1), transparent)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
          <div className="animate-fade-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(199,125,255,0.1)', border: '1px solid rgba(199,125,255,0.25)',
            color: 'var(--purple)', padding: '6px 16px', borderRadius: 100,
            fontSize: 13, fontWeight: 500, marginBottom: 28,
          }}>✨ Viral quiz platform</div>
          <h1 className="animate-fade-up delay-100" style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(42px, 7vw, 72px)', lineHeight: 1.05, marginBottom: 20,
          }}>
            Make a quiz.<br />
            <span className="gradient-text">Share with your people.</span>
          </h1>
          <p className="animate-fade-up delay-200" style={{
            color: 'var(--muted)', fontSize: 18, lineHeight: 1.6, marginBottom: 40,
          }}>
            Create a personalised quiz, share your unique link, and see who really knows you best.
          </p>
          <div className="animate-fade-up delay-300" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/create" style={{
              padding: '16px 36px', borderRadius: 100,
              background: 'linear-gradient(135deg, var(--pink), var(--purple))',
              color: 'white', fontWeight: 700, fontSize: 16, textDecoration: 'none',
            }}>Create Your Quiz →</Link>
          </div>
          <div className="animate-fade-up delay-400" style={{ display: 'flex', gap: 40, justifyContent: 'center', marginTop: 60 }}>
            {[['24K+','Quizzes'],['180K+','Plays'],['92K+','Players']].map(([n,l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800,
                  background: 'linear-gradient(135deg,var(--pink),var(--purple))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>{n}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px 80px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 32, textAlign: 'center' }}>How it works 🚀</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
          {[
            { icon: '✍️', step: '1', title: 'Create', desc: 'Pick a template or write your own questions about yourself.' },
            { icon: '🔗', step: '2', title: 'Share', desc: "Share your unique quiz link with friends on WhatsApp or anywhere." },
            { icon: '🏆', step: '3', title: 'Compete', desc: 'Friends play and their scores appear on your quiz leaderboard.' },
          ].map(item => (
            <div key={item.step} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 20, padding: 28, textAlign: 'center',
            }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</div>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 8,
                background: 'linear-gradient(135deg,var(--pink),var(--purple))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>{item.title}</div>
              <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
        {ads?.home_banner_enabled && <AdSlot code={ads.home_banner_code} />}
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px 80px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>🔥 Trending Quizzes</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.id)} style={{
              padding: '9px 18px', borderRadius: 100, cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
              border: category === cat.id ? 'none' : '1px solid var(--border)',
              background: category === cat.id
                ? (cat.id === 'all' ? 'linear-gradient(135deg,var(--pink),var(--purple))' : CAT_COLORS[cat.id])
                : 'var(--surface)',
              color: category === cat.id ? (cat.id === 'fun' ? '#000' : 'white') : 'var(--text)',
            }}>{cat.label}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
            {[...Array(6)].map((_,i) => (
              <div key={i} style={{ height: 140, borderRadius: 20, background: 'var(--surface)', border: '1px solid var(--border)', opacity: 0.5 }} />
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
            No quizzes yet. <Link href="/create" style={{ color: 'var(--pink)' }}>Be the first!</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
            {quizzes.map(quiz => (
              <Link key={quiz.id} href={`/play/${quiz.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 20, padding: 24, transition: 'all 0.25s ease',
                }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform='translateY(-4px)'; el.style.borderColor='rgba(255,107,157,0.3)' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform=''; el.style.borderColor='var(--border)' }}
                >
                  <div style={{
                    display: 'inline-block', padding: '4px 12px', borderRadius: 100,
                    fontSize: 12, fontWeight: 600, marginBottom: 14,
                    background: `${CAT_COLORS[quiz.category]||'var(--pink)'}22`,
                    color: CAT_COLORS[quiz.category]||'var(--pink)',
                  }}>{CATEGORIES.find(c=>c.id===quiz.category)?.label ?? quiz.category}</div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize: 18, fontWeight: 700, lineHeight: 1.3, color:'var(--text)' }}>{quiz.title}</div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:16, paddingTop:16, borderTop:'1px solid var(--border)' }}>
                    <span style={{ fontSize:13, color:'var(--muted)' }}>by {quiz.creator_name??'Anonymous'}</span>
                    <span style={{ fontSize:13, color:'var(--muted)' }}>▶ {(quiz.total_plays??0).toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        {ads?.home_bottom_enabled && <AdSlot code={ads.home_bottom_code} />}
      </div>
    </div>
  )
}
