'use client'

import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode
  interactive?: boolean
  glass?: boolean
  className?: string
}

export const Card: React.FC<CardProps> = ({
  children,
  interactive = false,
  glass = false,
  className = '',
  whileHover,
  whileTap,
  ...props
}) => {
  const baseStyles = 'rounded-card border bg-surface border-border overflow-hidden'
  const glassStyles = glass ? 'backdrop-blur-md bg-white/70 border-white/20' : ''
  const hoverStyles = interactive ? 'cursor-pointer hover:border-border-strong transition-all duration-200' : ''

  return (
    <motion.div
      whileHover={interactive ? (whileHover || { y: -4, scale: 1.01, boxShadow: '0 12px 24px rgba(15,13,11,0.04)' }) : undefined}
      whileTap={interactive ? (whileTap || { scale: 0.99 }) : undefined}
      className={`${baseStyles} ${glassStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`p-5 border-b border-border flex flex-col gap-1.5 ${className}`}>
    {children}
  </div>
)

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => (
  <div className={`p-5 ${className}`}>{children}</div>
)

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`px-5 py-4 border-t border-border bg-surface-hover flex items-center justify-between ${className}`}>
    {children}
  </div>
)
