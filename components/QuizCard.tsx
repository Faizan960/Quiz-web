'use client'

import { motion } from 'framer-motion'
import { Play, TrendingUp } from 'lucide-react'
import { TiltCard } from './TiltCard'

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
    <TiltCard
      accentColor={accent}
      glowStrength={0.4}
      borderRadius={24}
      style={{
        width: compact ? 260 : '100%',
        flexShrink: compact ? 0 : undefined,
      }}
      className="shadow-sm"
    >
      <article
        style={{
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(235, 231, 224, 0.8)',
          borderRadius: 24,
          overflow: 'hidden',
          cursor: 'pointer',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 30px rgba(9, 9, 11, 0.015), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
          transition: 'border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="group/card"
        aria-label={`Quiz: ${title}`}
      >
        {/* thumbnail container */}
        {thumbnail && (
          <div style={{ position: 'relative', height: compact ? 130 : 155, overflow: 'hidden' }}>
            <img
              src={thumbnail}
              alt={title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="group-hover/card:scale-105"
            />
            {/* dark gradient scrim */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(9,9,11,0.6) 0%, transparent 60%)',
            }} />

            {/* trending badge */}
            {isTrending && (
              <div style={{
                position: 'absolute', top: 12, left: 12,
                display: 'flex', alignItems: 'center', gap: 4.5,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,214,10,0.4)',
                borderRadius: 100,
                padding: '4px 11px',
                fontSize: 11, fontWeight: 700,
                color: '#e2ab00',
                fontFamily: 'var(--font-body)',
                boxShadow: '0 2px 10px rgba(255,214,10,0.15)',
              }}>
                <TrendingUp size={11.5} className="animate-pulse" />
                Trending
              </div>
            )}

            {/* play button overlay */}
            <motion.div
              style={{
                position: 'absolute', bottom: 12, right: 12,
                width: 38, height: 38, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
                boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="group-hover/card:scale-110 group-hover/card:rotate-[360deg] duration-500"
            >
              <Play size={15} fill="white" color="white" style={{ marginLeft: 2 }} />
            </motion.div>
          </div>
        )}

        {/* body */}
        <div style={{ padding: thumbnail ? '14px 16px 16px' : '20px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* category chip */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '3px 10px', borderRadius: 100,
              fontSize: 10.5, fontWeight: 800,
              background: `${accent}15`,
              color: accent === '#FFD60A' ? '#c7a300' : accent, // make yellow legible on light bg
              fontFamily: 'var(--font-body)',
              marginBottom: 10,
              border: `1px solid ${accent}25`,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              transition: 'transform 0.3s ease',
            }}
            className="group-hover/card:scale-105"
            >
              {category}
            </div>
          </div>

          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: compact ? 14.5 : 17,
            lineHeight: 1.35,
            color: 'var(--color-text-primary)',
            marginBottom: 14,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
            transition: 'color 0.3s ease',
          }}
          className="group-hover/card:text-primary"
          >
            {title}
          </div>

          {/* footer */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: 12, borderTop: '1px solid rgba(235, 231, 224, 0.5)',
          }}>
            <span style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 12, color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
              fontWeight: 650,
            }}>
              <Play size={11.5} fill="currentColor" color="currentColor" />
              {formatPlays(plays)} plays
            </span>

            <motion.div
              whileHover={{ scale: 1.05, boxShadow: '0 4px 15px rgba(124,58,237,0.2)' }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '5px 15px', borderRadius: 100, fontSize: 12, fontWeight: 750,
                background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-light))`,
                color: 'white', cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                boxShadow: '0 2px 10px rgba(124,58,237,0.15)',
              }}
            >
              Play
            </motion.div>
          </div>
        </div>
      </article>
    </TiltCard>
  )
}
