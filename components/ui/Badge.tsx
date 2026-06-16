import React from 'react'

type BadgeVariant = 'primary' | 'pink' | 'outline' | 'success' | 'danger' | 'warning'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  children,
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-pill text-xs font-bold font-body transition-colors'

  const variantStyles = {
    primary: 'bg-purple-50 text-purple-700 border border-purple-100',
    pink: 'bg-pink-50 text-pink-700 border border-pink-100',
    outline: 'bg-transparent border border-border text-text-secondary',
    success: 'bg-success-light text-success border border-success/10',
    danger: 'bg-error-light text-error border border-error/10',
    warning: 'bg-warning-light text-warning border border-warning/10',
  }

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  )
}
