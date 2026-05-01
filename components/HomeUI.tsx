'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sparkles, SlidersHorizontal, ChevronRight } from 'lucide-react'
import { QuizCard } from './QuizCard'
import { BottomNav } from './BottomNav'

/* ─── mock data ─────────────────────────────────────────────── */
const MOCK_QUIZZES = [
  {
    id: 1,
    title: "Which Gen-Z Icon Are You? 🎭",
    thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop",
    plays: 125000,
    category: "Personality",
    isTrending: true,
  },
  {
    id: 2,
    title: "Can You Pass This 2024 Vibe Check? ✨",
    thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
    plays: 98500,
    category: "Fun",
    isTrending: true,
  },
  {
    id: 3,
    title: "Your Perfect Aesthetic Match 🌸",
    thumbnail: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=300&fit=crop",
    plays: 87200,
    category: "Style",
    isTrending: false,
  },
  {
    id: 4,
    title: "What's Your Love Language? 💖",
    thumbnail: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=300&fit=crop",
    plays: 156000,
    category: "Relationships",
    isTrending: false,
  },
  {
    id: 5,
    title: "Rate These Foods & We'll Guess Your Age 🍕",
    thumbnail: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
    plays: 203000,
    category: "Food",
    isTrending: true,
  },
  {
    id: 6,
    title: "Build Your Dream Room & Get a Color Analysis 🎨",
    thumbnail: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=400&h=300&fit=crop",
    plays: 71500,
    category: "Creativity",
    isTrending: false,
  },
]

const CATEGORIES = ["All", "Trending 🔥", "Personality", "Fun", "Style", "Food", "Creativity"] as const
type Category = (typeof CATEGORIES)[number]

/* ─── stats bar ─────────────────────────────────────────────── */
const STATS = [['24K+', 'Quizzes'], ['180K+', 'Plays'], ['92K+', 'Players']] as const

/* ─── component ─────────────────────────────────────────────── */
export function HomeUI() {
  const [activeTab, setActiveTab] = useState<'home' | 'create' | 'profile'>('home')
  const [activeCategory, setActiveCategory] = useState<Category>('All')

  const filtered =
    activeCategory === 'All' || activeCategory === 'Trending 🔥'
      ? MOCK_QUIZZES.filter(q => activeCategory === 'All' || q.isTrending)
      : MOCK_QUIZZES.filter(q => q.category === activeCategory)

  const trending = MOCK_QUIZZES.filter(q => q.isTrending)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      paddingBottom: 120,
      fontFamily: 'var(--font-body)',
    }}>

      {/* ── Hero ────────────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '56px 24px 44px' }}>
        {/* ambient blobs */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: 340, height: 340, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(199,125,255,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,157,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          {/* sparkle icon */}
          <motion.div
            animate={{ rotate: [0, 12, 0, -12, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3.5, ease: 'easeInOut' }}
            style={{ display: 'inline-block', marginBottom: 20 }}
          >
            <Sparkles size={44} color="var(--yellow)" strokeWidth={1.8} />
          </motion.div>

          {/* headline */}
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(34px, 6.5vw, 60px)',
              lineHeight: 1.08,
              marginBottom: 16,
            }}
          >
            Discover Your{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--pink), var(--purple), var(--cyan))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              True Self
            </span>{' '}
            👀
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ color: 'var(--muted)', fontSize: 16, lineHeight: 1.65, marginBottom: 32 }}
          >
            Take fun quizzes and share your results with friends
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}
          >
            <motion.button
              id="home-cta-explore"
              whileHover={{ scale: 1.05, boxShadow: '0 12px 32px rgba(255,107,157,0.4)' }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '14px 36px', borderRadius: 100, border: 'none',
                background: 'linear-gradient(135deg, var(--pink), var(--purple))',
                color: 'white', fontWeight: 700, fontSize: 15,
                fontFamily: 'var(--font-body)', cursor: 'pointer',
                boxShadow: '0 6px 24px rgba(255,107,157,0.3)',
                transition: 'box-shadow 0.2s ease',
              }}
            >
              Start Exploring
            </motion.button>

            <motion.button
              id="home-cta-create"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '14px 32px', borderRadius: 100,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'var(--text)', fontWeight: 600, fontSize: 15,
                fontFamily: 'var(--font-body)', cursor: 'pointer',
                backdropFilter: 'blur(8px)',
              }}
            >
              Create Quiz →
            </motion.button>
          </motion.div>

          {/* stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              display: 'inline-flex', gap: 0,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
              borderRadius: 18, overflow: 'hidden',
            }}
          >
            {STATS.map(([num, lbl], i) => (
              <div key={lbl} style={{
                padding: '14px 28px', textAlign: 'center',
                borderRight: i < STATS.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22,
                  background: 'linear-gradient(135deg, var(--pink), var(--purple))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>{num}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{lbl}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Category Filters ─────────────────────────────────── */}
      <div style={{ padding: '0 20px 28px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          overflowX: 'auto', paddingBottom: 4,
          scrollbarWidth: 'none', msOverflowStyle: 'none',
        } as React.CSSProperties}>
          {CATEGORIES.map((cat, i) => {
            const isActive = activeCategory === cat
            return (
              <motion.button
                key={cat}
                id={`filter-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setActiveCategory(cat)}
                style={{
                  flexShrink: 0,
                  padding: '9px 20px', borderRadius: 100,
                  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  border: isActive ? 'none' : '1px solid var(--border)',
                  background: isActive
                    ? 'linear-gradient(135deg, var(--pink), var(--purple))'
                    : 'var(--surface)',
                  color: isActive ? '#fff' : 'var(--muted)',
                  boxShadow: isActive ? '0 4px 14px rgba(255,107,157,0.28)' : 'none',
                  transition: 'color 0.15s ease',
                }}
              >
                {cat}
              </motion.button>
            )
          })}

          <button
            id="filter-advanced"
            style={{
              flexShrink: 0, padding: '9px 12px', borderRadius: 100,
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--muted)', cursor: 'pointer', display: 'flex',
              alignItems: 'center',
            }}
          >
            <SlidersHorizontal size={15} />
          </button>
        </div>
      </div>

      {/* ── Trending Horizontal Scroll ───────────────────────── */}
      <section style={{ marginBottom: 40 }}>
        <div style={{
          padding: '0 24px', marginBottom: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22,
            color: 'var(--text)',
          }}>🔥 Trending Now</h2>
          <button style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 3,
            color: 'var(--pink)', fontSize: 13, fontWeight: 600,
            fontFamily: 'var(--font-body)',
          }}>
            See all <ChevronRight size={14} />
          </button>
        </div>

        <div style={{
          display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 6,
          paddingLeft: 24, paddingRight: 24,
          scrollbarWidth: 'none', msOverflowStyle: 'none',
        } as React.CSSProperties}>
          {trending.map((quiz, i) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 260, damping: 22 }}
            >
              <QuizCard {...quiz} compact />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Quiz Grid ───────────────────────────────────────── */}
      <section style={{ padding: '0 24px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 18,
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22,
            color: 'var(--text)',
          }}>🧠 {activeCategory === 'All' ? 'All Quizzes' : activeCategory}</h2>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{filtered.length} quizzes</span>
        </div>

        <AnimatePresence mode="popLayout">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {filtered.map((quiz, i) => (
              <motion.div
                key={quiz.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
              >
                <QuizCard {...quiz} />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '60px 0',
            color: 'var(--muted)', fontSize: 15,
          }}>
            No quizzes in this category yet.
          </div>
        )}
      </section>

      {/* ── Bottom Nav ──────────────────────────────────────── */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
