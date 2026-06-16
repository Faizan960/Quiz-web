import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth = true, className = '', ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="text-sm font-bold text-text-secondary font-body">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            px-4 py-3 rounded-input bg-surface border font-body text-text-primary placeholder:text-text-muted
            focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
            disabled:opacity-50 disabled:bg-canvas transition-all duration-200
            ${error ? 'border-error animate-shake focus:border-error focus:ring-error/20' : 'border-border'}
            ${className}
          `}
          {...props}
        />
        {error ? (
          <p className="text-xs font-semibold text-error font-body mt-0.5">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-text-muted font-body mt-0.5">
            {helperText}
          </p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'
