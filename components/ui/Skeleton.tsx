import React from 'react'

interface SkeletonProps {
  className?: string
  circle?: boolean
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  circle = false,
}) => {
  return (
    <div
      className={`
        relative overflow-hidden bg-border-strong/60
        before:absolute before:inset-0 before:-translate-x-full
        before:bg-gradient-to-r before:from-transparent before:via-white/35 before:to-transparent
        before:animate-shimmer
        ${circle ? 'rounded-full' : 'rounded'}
        ${className}
      `}
    />
  )
}
