'use client'

import React, { useRef } from 'react'

interface PinEntryProps {
  value: string
  onChange: (value: string) => void
  error?: boolean
  disabled?: boolean
}

export const PinEntry: React.FC<PinEntryProps> = ({
  value,
  onChange,
  error = false,
  disabled = false,
}) => {
  const pin = [
    value[0] || '',
    value[1] || '',
    value[2] || '',
    value[3] || '',
  ]

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value
    if (!/^[0-9]?$/.test(val)) return // Only allow single digits

    const newPin = [...pin]
    newPin[index] = val
    onChange(newPin.join(''))

    // Move focus to next input if filled
    if (val !== '' && index < 3) {
      inputRefs[index + 1].current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (pin[index] === '' && index > 0) {
        // If current is empty, delete previous and focus it
        const newPin = [...pin]
        newPin[index - 1] = ''
        onChange(newPin.join(''))
        inputRefs[index - 1].current?.focus()
      } else {
        // Delete current
        const newPin = [...pin]
        newPin[index] = ''
        onChange(newPin.join(''))
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4)
    if (pastedData) {
      onChange(pastedData)
      
      // Focus the last input or the next empty one
      const focusIndex = Math.min(pastedData.length, 3)
      inputRefs[focusIndex].current?.focus()
    }
  }

  return (
    <div className="flex justify-center gap-4 py-2">
      {pin.map((digit, index) => (
        <input
          key={index}
          ref={inputRefs[index]}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleInputChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={index === 0 ? handlePaste : undefined}
          disabled={disabled}
          className={`
            w-14 h-16 text-center text-2xl font-bold font-mono rounded-input bg-surface border-2
            focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500
            disabled:opacity-50 transition-all duration-200
            ${error ? 'border-error animate-shake' : digit ? 'border-purple-400' : 'border-border'}
          `}
        />
      ))}
    </div>
  )
}
