'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Settings, Trophy, Crown, Play, Heart,
  Share2, ChevronRight, LogOut, Bell,
} from 'lucide-react'
import { BottomNav } from './BottomNav'

/* ─── mock data ──────────────────────────────────────────────── */
const MOCK_USER = {
  name:   'Alex Johnson',
  handle: '@alexj',
  title:  'Quiz Master 🎯',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
  stats: [
    { value: '47',  label: 'Played'    },
    { value: '12',  label: 'Created'   },
    { value: '2.3K',label: 'Followers' },
  ],
}

const ACHIEVEMENTS = [
  { emoji: '🔥', label: '7 Day Streak',   color: '#FF6B9D' },
  { emoji: '⭐', label: 'Top Creator',    color: '#FFD60A' },
  { emoji: '🎯', label: 'Quiz Master',    color: '#C77DFF' },
  { emoji: '💯', label: 'Perfect Score',  color: '#06D6A0' },
  { emoji: '🚀', label: 'Early Adopter',  color: '#00D4FF' },
]

const MOCK_USER_QUIZZES = [
  {
    id: 1,
    title: 'My Custom Personality Quiz',
    plays: 1250,
    likes: 340,
    thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop',
  },
  {
    id: 2,
    title: 'Ultimate Food Preferences Test',
    plays: 890,
    likes: 220,
    thumbnail: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
  },
]

const MOCK_ACTIVITY = [
  { id: 1, quiz: 'Which Gen-Z Icon Are You?',    result: 'The Strategist 🧠',  date: '2 hours ago'  },
  { id: 2, quiz: 'Your Perfect Aesthetic Match',  result: 'Dark Academia 📚',   date: '1 day ago'    },
  { id: 3, quiz: 'Rate These Foods',              result: 'Foodie Expert 🍕',   date: '3 days ago'   },
]

function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

/* ─── component ─────────────────────────────────────────────── */
export function ProfileUI() {
  const [activeTab, setActiveTab] = useState<'home' | 'create' | 'profile'>('profile')
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      fontFamily: 'var(--font-body)',
      paddingBottom: 120,
    }}>

      {/* ── Hero Header ─────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>

        {/* gradient backdrop */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg, rgba(199,125,255,0.22) 0%, rgba(255,107,157,0.18) 55%, transparent 100%)',
          pointerEvents: 'none',
        }} />
        {/* mesh blob top-right */}
        <div style={{
          position: 'absolute', top: -100, right: -80,
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(199,125,255,0.22) 0%, transparent 68%)',
          pointerEvents: 'none',
        }} />

        {/* top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '52px 24px 0',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20,
            background: 'linear-gradient(135deg, var(--pink), var(--purple))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>Profile</div>

          <div style={{ display: 'flex', gap: 10 }}>
            <motion.button
              id="profile-notifications"
              whileTap={{ scale: 0.88 }}
              style={{
                width: 40, height: 40, borderRadius: 14,
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--muted)',
              }}
            >
              <Bell size={18} />
            </motion.button>

            <motion.button
              id="profile-settings"
              whileTap={{ scale: 0.88 }}
              onClick={() => setSettingsOpen(v => !v)}
              style={{
                width: 40, height: 40, borderRadius: 14,
                background: settingsOpen
                  ? 'linear-gradient(135deg, var(--pink), var(--purple))'
                  : 'rgba(255,255,255,0.07)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                color: settingsOpen ? '#fff' : 'var(--muted)',
                transition: 'background 0.2s ease, color 0.2s ease',
              }}
            >
              <Settings size={18} />
            </motion.button>
          </div>
        </div>

        {/* avatar + info */}
        <div style={{ textAlign: 'center', padding: '28px 24px 40px' }}>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            style={{ position: 'relative', display: 'inline-block', marginBottom: 18 }}
          >
            {/* avatar ring */}
            <div style={{
              width: 100, height: 100, borderRadius: '50%', padding: 3,
              background: 'linear-gradient(135deg, var(--pink), var(--purple), var(--cyan))',
            }}>
              <img
                src={MOCK_USER.avatar}
                alt={MOCK_USER.name}
                style={{
                  width: '100%', height: '100%', borderRadius: '50%',
                  objectFit: 'cover', display: 'block',
                  border: '3px solid var(--bg)',
                }}
              />
            </div>

            {/* crown badge */}
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(135deg, #FFD60A, #FF6B9D)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '3px solid var(--bg)',
              boxShadow: '0 3px 10px rgba(255,214,10,0.4)',
            }}>
              <Crown size={13} color="white" fill="white" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 26, color: 'var(--text)', marginBottom: 6,
            }}
          >
            {MOCK_USER.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 28 }}
          >
            {MOCK_USER.handle} · {MOCK_USER.title}
          </motion.p>

          {/* stats row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'inline-flex',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
              borderRadius: 20, overflow: 'hidden',
            }}
          >
            {MOCK_USER.stats.map((s, i) => (
              <div key={s.label} style={{
                padding: '16px 28px', textAlign: 'center',
                borderRight: i < MOCK_USER.stats.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24,
                  background: 'linear-gradient(135deg, var(--pink), var(--purple))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Settings Drawer (inline) ─────────────────────────── */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            style={{ overflow: 'hidden', padding: '0 24px' }}
          >
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 20, marginBottom: 24,
              overflow: 'hidden',
            }}>
              {[
                { icon: Bell,    label: 'Notifications' },
                { icon: Share2,  label: 'Share Profile'  },
                { icon: LogOut,  label: 'Sign Out',  danger: true },
              ].map(({ icon: Icon, label, danger }) => (
                <motion.button
                  key={label}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    gap: 14, padding: '15px 20px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    borderBottom: '1px solid var(--border)',
                    color: danger ? 'var(--red)' : 'var(--text)',
                    fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
                    textAlign: 'left',
                  }}
                >
                  <Icon size={17} />
                  {label}
                  {!danger && (
                    <ChevronRight size={15} style={{ marginLeft: 'auto', color: 'var(--muted)' }} />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Achievements ────────────────────────────────────── */}
      <section style={{ padding: '0 24px 32px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
        }}>
          <Trophy size={18} color="var(--yellow)" />
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 18, color: 'var(--text)',
          }}>Achievements</h2>
        </div>

        <div style={{
          display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4,
          scrollbarWidth: 'none', msOverflowStyle: 'none',
        } as React.CSSProperties}>
          {ACHIEVEMENTS.map((a, i) => (
            <motion.div
              key={a.label}
              id={`achievement-${a.label.replace(/\s+/g, '-').toLowerCase()}`}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 260, damping: 20 }}
              whileHover={{ y: -4, scale: 1.04 }}
              style={{
                flexShrink: 0,
                width: 88, minHeight: 88,
                background: 'var(--surface)',
                border: `1px solid ${a.color}2A`,
                borderRadius: 20,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 6, padding: '12px 8px',
                boxShadow: `0 4px 16px ${a.color}12`,
                cursor: 'default',
              }}
            >
              <span style={{ fontSize: 28, lineHeight: 1 }}>{a.emoji}</span>
              <span style={{
                fontSize: 10, fontWeight: 600,
                color: a.color, textAlign: 'center',
                fontFamily: 'var(--font-body)',
                lineHeight: 1.25,
              }}>
                {a.label}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── My Quizzes ──────────────────────────────────────── */}
      <section style={{ padding: '0 24px 32px' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 16,
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 18, color: 'var(--text)',
          }}>My Quizzes</h2>
          <button style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 3,
            color: 'var(--pink)', fontSize: 13, fontWeight: 600,
            fontFamily: 'var(--font-body)',
          }}>
            See all <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {MOCK_USER_QUIZZES.map((quiz, i) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ x: 4 }}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 18, overflow: 'hidden',
                display: 'flex', gap: 0,
                transition: 'border-color 0.2s ease',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,107,157,0.25)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
            >
              {/* thumbnail */}
              <div style={{ position: 'relative', width: 90, flexShrink: 0 }}>
                <img
                  src={quiz.thumbnail}
                  alt={quiz.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to right, transparent 60%, rgba(18,18,26,0.6))',
                }} />
              </div>

              {/* info */}
              <div style={{
                flex: 1, padding: '14px 12px',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8,
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: 14, color: 'var(--text)', lineHeight: 1.3,
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                } as React.CSSProperties}>
                  {quiz.title}
                </div>
                <div style={{ display: 'flex', gap: 14 }}>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: 12, color: 'var(--muted)',
                  }}>
                    <Play size={11} fill="currentColor" color="currentColor" />
                    {fmt(quiz.plays)}
                  </span>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: 12, color: 'var(--muted)',
                  }}>
                    <Heart size={11} />
                    {fmt(quiz.likes)}
                  </span>
                </div>
              </div>

              {/* share */}
              <div style={{
                display: 'flex', alignItems: 'center',
                paddingRight: 14,
              }}>
                <motion.button
                  id={`quiz-share-${quiz.id}`}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.88 }}
                  style={{
                    width: 36, height: 36, borderRadius: 12,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'var(--muted)',
                  }}
                >
                  <Share2 size={15} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Recent Activity ──────────────────────────────────── */}
      <section style={{ padding: '0 24px 32px' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: 18, color: 'var(--text)', marginBottom: 16,
        }}>Recent Activity</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {MOCK_ACTIVITY.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, type: 'spring', stiffness: 280, damping: 24 }}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 16, padding: '14px 16px',
              }}
            >
              {/* top row */}
              <div style={{
                display: 'flex', alignItems: 'flex-start',
                justifyContent: 'space-between', gap: 8, marginBottom: 10,
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontWeight: 600,
                  fontSize: 13, color: 'var(--text)', lineHeight: 1.35,
                  flex: 1,
                }}>
                  {a.quiz}
                </span>
                <span style={{
                  fontSize: 11, color: 'var(--muted)',
                  flexShrink: 0, marginTop: 2,
                  fontFamily: 'var(--font-body)',
                }}>
                  {a.date}
                </span>
              </div>

              {/* result chip */}
              <div style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '5px 13px', borderRadius: 100,
                background: 'linear-gradient(135deg, rgba(255,107,157,0.12), rgba(199,125,255,0.12))',
                border: '1px solid rgba(199,125,255,0.2)',
              }}>
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  background: 'linear-gradient(135deg, var(--pink), var(--purple))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {a.result}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Bottom Nav ──────────────────────────────────────── */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
