'use client'

import React, { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate, HTMLMotionProps } from 'framer-motion'

interface TiltCardProps extends HTMLMotionProps<'div'> {
  children?: React.ReactNode
  accentColor?: string
  glowStrength?: number // 0 to 1
  tiltMax?: number // maximum tilt angle in degrees
  glareStrength?: number // 0 to 1
  disabled?: boolean
  borderRadius?: number
}

export function TiltCard({
  children,
  accentColor = 'rgba(124, 58, 237, 0.4)', // electric violet default
  glowStrength = 0.35,
  tiltMax = 12,
  glareStrength = 0.15,
  disabled = false,
  onClick,
  borderRadius = 24,
  className = '',
  style = {},
  ...props
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  // Motion values for tracking cursor relative positions (-0.5 to 0.5)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Smooth springs for rotation
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [tiltMax, -tiltMax]), {
    stiffness: 250,
    damping: 25,
    mass: 0.6,
  })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-tiltMax, tiltMax]), {
    stiffness: 250,
    damping: 25,
    mass: 0.6,
  })

  // Dynamic glare position (0% to 100%)
  const glareX = useTransform(x, [-0.5, 0.5], [0, 100])
  const glareY = useTransform(y, [-0.5, 0.5], [0, 100])

  // Glow radial gradient strings
  const glareTemplate = useMotionTemplate`radial-gradient(circle 220px at ${glareX}% ${glareY}%, rgba(255, 255, 255, ${glareStrength}) 0%, rgba(255, 255, 255, 0) 85%)`
  const borderGlowTemplate = useMotionTemplate`radial-gradient(circle 160px at ${glareX}% ${glareY}%, ${accentColor} 0%, transparent 100%)`

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    // Mouse coords relative to center of the card
    const mouseX = e.clientX - rect.left - width / 2
    const mouseY = e.clientY - rect.top - height / 2
    x.set(mouseX / width)
    y.set(mouseY / height)
  }

  const handleMouseLeave = () => {
    // Reset to center smoothly
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX: disabled ? 0 : rotateX,
        rotateY: disabled ? 0 : rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
        position: 'relative',
        borderRadius,
        ...style,
      }}
      className={`group select-none ${className}`}
      {...props}
    >
      {/* Dynamic Cursor-Tracking Glowing Border */}
      {!disabled && (
        <motion.div
          style={{
            position: 'absolute',
            inset: -1,
            background: borderGlowTemplate,
            borderRadius: borderRadius + 1,
            zIndex: 0,
            pointerEvents: 'none',
            opacity: 0,
          }}
          className="group-hover:opacity-100 transition-opacity duration-300"
        />
      )}

      {/* Card Body - Content container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius,
          zIndex: 1,
          overflow: 'hidden',
        }}
        className="w-full h-full"
      >
        {children}

        {/* Dynamic Glare Sheen Overlay */}
        {!disabled && (
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              background: glareTemplate,
              pointerEvents: 'none',
              zIndex: 10,
              mixBlendMode: 'overlay',
              opacity: 0,
            }}
            className="group-hover:opacity-100 transition-opacity duration-300"
          />
        )}
      </div>
    </motion.div>
  )
}
