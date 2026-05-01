'use client'

import { motion } from 'motion/react'
import { Play, TrendingUp } from 'lucide-react'

interface QuizCardProps {
  id: number
  title: string
  thumbnail?: string
  plays: number
  category: string
  isTrending?: boolean
  compact?: boolean // horizontal scroll variant
}

function formatPlays(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

const CAT_COLORS: Record<string, string> = {
  Personality:   '#C77DFF',
  Fun:           '#FFD60A',
  Style:         '#FF6B9D',
  Food:          '#06D6A0',
  Relationships: '#FF4D6D',
  Creativity:    '#00D4FF',
  'K-Pop':       '#C77DFF',
  Gaming:        '#06D6A0',
  Movies:        '#00D4FF',
}
const DEFAULT_COLOR = '#C77DFF'

export function QuizCard({ id, title, thumbnail, plays, category, isTrending = false, compact = false }: QuizCardProps) {
  const accent = CAT_COLORS[category] ?? DEFAULT_COLOR

  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 340, damping: 26 }}
      style={{
        position: 'relative',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        overflow: 'hidden',
        cursor: 'pointer',
        width: compact ? 260 : '100%',
        flexShrink: compact ? 0 : undefined,
        transition: 'border-color 0.2s ease',
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = `${accent}44`)}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
      aria-label={`Quiz: ${title}`}
    >
      {/* thumbnail */}
      {thumbnail && (
        <div style={{ position: 'relative', height: compact ? 130 : 150, overflow: 'hidden' }}>
          <img
            src={thumbnail}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* dark scrim */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(10,10,15,0.85) 0%, transparent 55%)',
          }} />

          {/* trending badge */}
          {isTrending && (
            <div style={{
              position: 'absolute', top: 10, left: 10,
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'rgba(10,10,15,0.72)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,214,10,0.35)',
              borderRadius: 100,
              padding: '3px 10px',
              fontSize: 11, fontWeight: 600,
              color: '#FFD60A',
              fontFamily: 'var(--font-body)',
            }}>
              <TrendingUp size={11} />
              Trending
            </div>
          )}

          {/* play button overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            style={{
              position: 'absolute', bottom: 10, right: 10,
              width: 34, height: 34, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `linear-gradient(135deg, var(--pink), var(--purple))`,
              boxShadow: '0 4px 12px rgba(255,107,157,0.4)',
            }}
          >
            <Play size={14} fill="white" color="white" />
          </motion.div>
        </div>
      )}

      {/* body */}
      <div style={{ padding: thumbnail ? '12px 14px 14px' : '18px 16px' }}>
        {/* category chip */}
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '3px 10px', borderRadius: 100,
          fontSize: 11, fontWeight: 600,
          background: `${accent}1A`,
          color: accent,
          fontFamily: 'var(--font-body)',
          marginBottom: 8,
          border: `1px solid ${accent}2E`,
        }}>
          {category}
        </div>

        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: compact ? 14 : 16,
          lineHeight: 1.35,
          color: 'var(--text)',
          marginBottom: 12,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {title}
        </div>

        {/* footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 10, borderTop: '1px solid var(--border)',
        }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 12, color: 'rgba(240,240,245,0.45)',
            fontFamily: 'var(--font-body)',
          }}>
            <Play size={11} fill="currentColor" color="currentColor" />
            {formatPlays(plays)} plays
          </span>

          <motion.div
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            style={{
              padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600,
              background: `linear-gradient(135deg, var(--pink), var(--purple))`,
              color: 'white', cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              boxShadow: '0 2px 10px rgba(255,107,157,0.25)',
            }}
          >
            Play
          </motion.div>
        </div>
      </div>
    </motion.article>
  )
}
