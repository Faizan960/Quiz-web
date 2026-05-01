'use client'

import { motion } from 'motion/react'
import { Home, PlusCircle, User } from 'lucide-react'

type Tab = 'home' | 'create' | 'profile'

interface BottomNavProps {
  activeTab?: Tab
  onTabChange?: (tab: Tab) => void
}

const TABS = [
  { id: 'home'    as const, icon: Home,       label: 'Home'    },
  { id: 'create'  as const, icon: PlusCircle, label: 'Create'  },
  { id: 'profile' as const, icon: User,       label: 'Profile' },
]

export function BottomNav({ activeTab = 'home', onTabChange }: BottomNavProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '0 24px 20px',
      }}
    >
      {/* pill container */}
      <div
        style={{
          maxWidth: 420,
          margin: '0 auto',
          background: 'rgba(18,18,26,0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '10px 8px',
          boxShadow:
            '0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,107,157,0.06) inset',
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon

          return (
            <motion.button
              key={tab.id}
              id={`bottom-nav-${tab.id}`}
              whileTap={{ scale: 0.88 }}
              onClick={() => onTabChange?.(tab.id)}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 5,
                padding: '8px 20px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 20,
                minWidth: 72,
              }}
            >
              {/* active pill glow behind icon */}
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 20,
                    background:
                      'linear-gradient(135deg, rgba(255,107,157,0.18), rgba(199,125,255,0.18))',
                    border: '1px solid rgba(255,107,157,0.22)',
                  }}
                />
              )}

              {/* icon */}
              <motion.div
                animate={{
                  y: isActive ? -2 : 0,
                  scale: isActive ? 1.08 : 1,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                style={{ position: 'relative', zIndex: 1, lineHeight: 0 }}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  style={{
                    color: isActive ? 'var(--pink)' : 'rgba(240,240,245,0.38)',
                    filter: isActive
                      ? 'drop-shadow(0 0 6px rgba(255,107,157,0.55))'
                      : 'none',
                    transition: 'color 0.2s ease, filter 0.2s ease',
                  }}
                />
              </motion.div>

              {/* label */}
              <span
                style={{
                  position: 'relative',
                  zIndex: 1,
                  fontSize: 11,
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: 'var(--font-body)',
                  color: isActive ? 'var(--pink)' : 'rgba(240,240,245,0.35)',
                  letterSpacing: isActive ? '0.02em' : '0',
                  transition: 'color 0.2s ease, font-weight 0.15s ease',
                }}
              >
                {tab.label}
              </span>

              {/* dot indicator */}
              {isActive && (
                <motion.span
                  layoutId="nav-dot"
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                  style={{
                    position: 'absolute',
                    bottom: -10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background:
                      'linear-gradient(135deg, var(--pink), var(--purple))',
                    boxShadow: '0 0 6px var(--pink)',
                  }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
