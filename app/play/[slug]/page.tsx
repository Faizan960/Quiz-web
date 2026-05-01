'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

type Question = {
  id: string
  question_text: string
  options: string[]
  correct_index: number
  order_num: number
}

type Quiz = {
  id: string
  slug: string
  title: string
  category: string
  creator_name: string
  questions: Question[]
}

type LeaderboardEntry = {
  player_name: string
  score: number
  total: number
  time_taken_sec: number | null
  created_at: string
}

function AdSlot({ code }: { code?: string | null }) {
  if (code) return <div dangerouslySetInnerHTML={{ __html: code }} style={{ margin: '16px 0' }} />
  return (
    <div style={{
      margin: '16px 0', padding: 12, borderRadius: 10, textAlign: 'center',
      border: '1px dashed rgba(255,255,255,0.08)', color: 'rgba(240,240,245,0.2)',
      fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
    }}>Ad Space</div>
  )
}

function fmtTime(sec: number | null) {
  if (sec === null || sec === undefined) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

const MEDAL = ['🥇', '🥈', '🥉']

export default function PlayPage() {
  const params = useParams()
  const slug = params.slug as string

  const [quiz, setQuiz]         = useState<Quiz | null>(null)
  const [ads, setAds]           = useState<any>(null)
  const [loadingQuiz, setLoadingQuiz] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Game state
  const [phase, setPhase]           = useState<'name' | 'playing' | 'done'>('name')
  const [playerName, setPlayerName] = useState('')
  const [current, setCurrent]       = useState(0)
  const [selected, setSelected]     = useState<number | null>(null)
  const [score, setScore]           = useState(0)
  const [startTime, setStartTime]   = useState(0)
  const [timeTaken, setTimeTaken]   = useState(0)

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [lbLoading, setLbLoading]     = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/quizzes/${slug}`).then(r => r.ok ? r.json() : null),
      fetch('/api/ads').then(r => r.json()).catch(() => null),
    ]).then(([quizData, adsData]) => {
      if (!quizData?.quiz) { setNotFound(true); setLoadingQuiz(false); return }
      setQuiz(quizData.quiz)
      setAds(adsData?.ads)
      setLoadingQuiz(false)
    })
  }, [slug])

  const fetchLeaderboard = useCallback(async (quizId: string) => {
    setLbLoading(true)
    try {
      const res = await fetch(`/api/scores?quiz_id=${quizId}`)
      const data = await res.json()
      setLeaderboard(data.leaderboard ?? [])
    } catch { /* silent */ } finally {
      setLbLoading(false)
    }
  }, [])

  const handleStart = () => {
    if (!playerName.trim()) return
    setPhase('playing')
    setStartTime(Date.now())
  }

  const handleSelect = useCallback(async (idx: number) => {
    if (selected !== null || !quiz) return
    setSelected(idx)
    const isCorrect = idx === quiz.questions[current].correct_index
    const newScore = isCorrect ? score + 1 : score
    if (isCorrect) setScore(newScore)

    await new Promise(r => setTimeout(r, 900))

    if (current + 1 < quiz.questions.length) {
      setCurrent(c => c + 1)
      setSelected(null)
    } else {
      const secs = Math.round((Date.now() - startTime) / 1000)
      setTimeTaken(secs)
      try {
        await fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quiz_id: quiz.id,
            player_name: playerName,
            score: newScore,
            total: quiz.questions.length,
            time_taken_sec: secs,
          }),
        })
      } catch {}
      setPhase('done')
      fetchLeaderboard(quiz.id)
    }
  }, [selected, quiz, current, score, playerName, startTime, fetchLeaderboard])

  // ── LOADING ───────────────────────────────────────────────────
  if (loadingQuiz) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
        <p style={{ color: 'var(--muted)' }}>Loading quiz...</p>
      </div>
    </div>
  )

  if (notFound || !quiz) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 8 }}>Quiz not found</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 24 }}>This quiz may have been removed or the link is wrong.</p>
        <Link href="/" style={{ color: 'var(--pink)', textDecoration: 'none', fontWeight: 600 }}>← Back to Home</Link>
      </div>
    </div>
  )

  const q = quiz.questions[current]
  const progress = (current / quiz.questions.length) * 100
  const pct = Math.round((score / quiz.questions.length) * 100)
  const resultMsg = pct >= 80 ? '🔥 You know them REALLY well!'
    : pct >= 50 ? '😄 Pretty good! Not bad at all.'
    : '😅 You need to hang out more.'

  const quizUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 32px', borderBottom: '1px solid var(--border)',
        background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)',
      }}>
        <Link href="/" style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20,
          background: 'linear-gradient(135deg,var(--pink),var(--purple))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none',
        }}>Quizly✦</Link>
        {phase === 'playing' && (
          <div style={{ fontSize: 14, color: 'var(--pink)', fontWeight: 600 }}>Score: {score}</div>
        )}
      </nav>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '60px 24px' }}>

        {/* ── NAME ENTRY ─────────────────────────────────────── */}
        {phase === 'name' && (
          <div className="animate-fade-up" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>🎯</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, marginBottom: 6 }}>{quiz.title}</h2>
            <p style={{ color: 'var(--muted)', marginBottom: 4 }}>by {quiz.creator_name}</p>
            <p style={{ color: 'var(--muted)', marginBottom: 40, fontSize: 14 }}>{quiz.questions.length} questions · scores appear on the leaderboard 🏆</p>

            {ads?.player_start_enabled && <AdSlot code={ads.player_start_code} />}

            <div style={{ textAlign: 'left', maxWidth: 320, margin: '0 auto 32px' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Your Name</label>
              <input
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleStart()}
                placeholder="Enter your name..."
                style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 18px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 15, outline: 'none' }}
              />
            </div>
            <button onClick={handleStart} disabled={!playerName.trim()} style={{
              padding: '16px 40px', borderRadius: 100, border: 'none',
              background: playerName.trim() ? 'linear-gradient(135deg,var(--pink),var(--purple))' : 'rgba(255,107,157,0.3)',
              color: 'white', fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 700,
              cursor: playerName.trim() ? 'pointer' : 'not-allowed',
            }}>Start Quiz 🚀</button>
          </div>
        )}

        {/* ── PLAYING ──────────────────────────────────────────── */}
        {phase === 'playing' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>Question {current + 1} of {quiz.questions.length}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{playerName}</div>
            </div>
            <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 100, marginBottom: 40, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, borderRadius: 100, background: 'linear-gradient(90deg,var(--pink),var(--purple))', transition: 'width 0.4s ease' }} />
            </div>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, lineHeight: 1.3, marginBottom: 32 }}>
              {q.question_text}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {q.options.map((opt, idx) => {
                let bg = 'var(--surface)'
                let border = '1px solid var(--border)'
                let color = 'var(--text)'
                if (selected !== null) {
                  if (idx === q.correct_index) { bg = 'rgba(6,214,160,0.12)'; border = '1px solid var(--green)'; color = 'var(--green)' }
                  else if (idx === selected)   { bg = 'rgba(255,77,109,0.1)';  border = '1px solid var(--red)';   color = 'var(--red)' }
                }
                return (
                  <button key={idx} onClick={() => handleSelect(idx)} disabled={selected !== null} style={{
                    padding: '18px 22px', borderRadius: 16, border, background: bg, color,
                    fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500,
                    textAlign: 'left', cursor: selected !== null ? 'default' : 'pointer',
                    transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 12,
                  }}
                    onMouseEnter={e => { if (selected === null) { const el = e.currentTarget as HTMLElement; el.style.borderColor='var(--purple)'; el.style.background='rgba(199,125,255,0.08)'; el.style.transform='translateX(4px)' } }}
                    onMouseLeave={e => { if (selected === null) { const el = e.currentTarget as HTMLElement; el.style.borderColor='var(--border)'; el.style.background='var(--surface)'; el.style.transform='' } }}
                  >
                    <span style={{ color: 'var(--muted)', fontFamily: 'var(--font-display)', fontSize: 13, minWidth: 20 }}>
                      {['A','B','C','D'][idx]}
                    </span>
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── RESULT + LEADERBOARD ─────────────────────────────── */}
        {phase === 'done' && (
          <div className="animate-fade-up">
            {/* Score ring */}
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{
                width: 180, height: 180, borderRadius: '50%', margin: '0 auto 32px',
                background: `conic-gradient(var(--pink) 0%, var(--purple) ${pct}%, var(--surface2) ${pct}%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: 140, height: 140, borderRadius: '50%', background: 'var(--bg)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 800,
                    background: 'linear-gradient(135deg,var(--pink),var(--purple))',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>{score}/{quiz.questions.length}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{pct}%</div>
                </div>
              </div>

              {ads?.result_page_enabled && <AdSlot code={ads.result_page_code} />}

              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
                {playerName}, {resultMsg}
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: 16, marginBottom: 8 }}>
                You answered {score} out of {quiz.questions.length} correctly.
              </p>
              <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 32 }}>
                ⏱ Time: {fmtTime(timeTaken)}
              </p>

              {/* Share */}
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 20, padding: 24, marginBottom: 32,
              }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Share your score 🏆</div>
                <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>
                  {playerName} got {score}/{quiz.questions.length} on &quot;{quiz.title}&quot;
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {[
                    { label: '📋 Copy',     action: () => navigator.clipboard.writeText(`I got ${score}/${quiz.questions.length} on "${quiz.title}"! Try it: ${quizUrl}`), bg: 'var(--surface2)' },
                    { label: '🐦 X',        action: () => window.open(`https://twitter.com/intent/tweet?text=I got ${score}/${quiz.questions.length} on "${quiz.title}"! Can you beat me? ${quizUrl}`), bg: '#1DA1F2' },
                    { label: '💬 WhatsApp', action: () => window.open(`https://wa.me/?text=I got ${score}/${quiz.questions.length} on "${quiz.title}"! Try it: ${quizUrl}`), bg: '#25D366' },
                  ].map(b => (
                    <button key={b.label} onClick={b.action} style={{
                      padding: '10px 18px', borderRadius: 100, border: 'none',
                      background: b.bg, color: 'white', cursor: 'pointer',
                      fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                    }}>{b.label}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── LEADERBOARD ────────────────────────────────── */}
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 24, padding: 28, marginBottom: 32,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24,
              }}>
                <div style={{ fontSize: 28 }}>🏆</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>Leaderboard</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>Top players on &quot;{quiz.title}&quot;</div>
                </div>
              </div>

              {lbLoading ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--muted)', fontSize: 14 }}>Loading scores...</div>
              ) : leaderboard.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--muted)', fontSize: 14 }}>No scores yet — you&apos;re the first!</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {leaderboard.map((entry, rank) => {
                    const isYou = entry.player_name === playerName
                    const entryPct = Math.round((entry.score / entry.total) * 100)
                    return (
                      <div key={rank} style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        background: isYou ? 'rgba(255,107,157,0.08)' : 'var(--surface2)',
                        border: isYou ? '1px solid rgba(255,107,157,0.35)' : '1px solid var(--border)',
                        borderRadius: 14, padding: '14px 18px',
                        transition: 'all 0.2s',
                      }}>
                        {/* Rank */}
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: rank < 3 ? 'rgba(255,107,157,0.12)' : 'var(--surface)',
                          fontSize: rank < 3 ? 18 : 13,
                          fontWeight: 700,
                          color: rank < 3 ? undefined : 'var(--muted)',
                        }}>
                          {rank < 3 ? MEDAL[rank] : `#${rank + 1}`}
                        </div>

                        {/* Name */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontWeight: 600, fontSize: 15, color: isYou ? 'var(--pink)' : 'var(--text)',
                            display: 'flex', alignItems: 'center', gap: 6,
                          }}>
                            {entry.player_name}
                            {isYou && <span style={{ fontSize: 11, background: 'var(--pink)', color: '#fff', padding: '1px 7px', borderRadius: 100, fontWeight: 700 }}>YOU</span>}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>⏱ {fmtTime(entry.time_taken_sec)}</div>
                        </div>

                        {/* Score bar */}
                        <div style={{ width: 80, flexShrink: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: isYou ? 'var(--pink)' : 'var(--text)' }}>{entry.score}/{entry.total}</span>
                            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{entryPct}%</span>
                          </div>
                          <div style={{ height: 4, background: 'var(--surface)', borderRadius: 100, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', width: `${entryPct}%`, borderRadius: 100,
                              background: isYou
                                ? 'linear-gradient(90deg,var(--pink),var(--purple))'
                                : rank === 0
                                  ? 'linear-gradient(90deg,#FFD700,#FFA500)'
                                  : 'rgba(199,125,255,0.5)',
                            }} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/create" style={{
                padding: '12px 28px', borderRadius: 100,
                background: 'linear-gradient(135deg,var(--pink),var(--purple))',
                color: 'white', textDecoration: 'none',
                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14,
              }}>Create Your Own Quiz →</Link>
              <Link href="/" style={{
                padding: '12px 28px', borderRadius: 100,
                background: 'var(--surface)', color: 'var(--muted)',
                border: '1px solid var(--border)', textDecoration: 'none',
                fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 14,
              }}>Browse More</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
