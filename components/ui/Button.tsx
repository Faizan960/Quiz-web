'use client'

import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  children: React.ReactNode
  fullWidth?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      fullWidth = false,
      className = '',
      whileTap = { scale: 0.96 },
      whileHover = { scale: 1.01 },
      ...props
    },
    ref
  ) => {
    // Style mappings matching Tailwind v4 variables
    const baseStyles = 'inline-flex items-center justify-center font-body font-bold rounded-btn transition-colors focus-visible:outline-2 focus-visible:outline-purple-600 disabled:opacity-50 disabled:pointer-events-none'
    
    const variantStyles = {
      primary: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 shadow-md hover:shadow-lg shadow-purple-500/10',
      secondary: 'bg-surface hover:bg-surface-hover text-text-primary border border-border shadow-sm',
      outline: 'bg-transparent border border-border text-text-primary hover:bg-surface-hover',
      ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover',
      danger: 'bg-error text-white hover:bg-red-700 shadow-sm shadow-error/10',
    }

    const sizeStyles = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    }

    const widthStyle = fullWidth ? 'w-full' : ''

    return (
      <motion.button
        ref={ref as React.Ref<HTMLButtonElement>}
        disabled={disabled || isLoading}
        whileTap={disabled || isLoading ? undefined : whileTap}
        whileHover={disabled || isLoading ? undefined : whileHover}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
