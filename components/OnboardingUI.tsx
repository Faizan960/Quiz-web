'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Sparkles, Copy, Check, Download, AlertCircle, Share2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Card, CardContent } from './ui/Card'
import { PinEntry } from './ui/PinEntry'
import { useToast } from './ui/Toast'

const INTEREST_OPTIONS = [
  { id: 'gaming', label: 'Gaming 🎮' },
  { id: 'kpop', label: 'K-Pop 🎵' },
  { id: 'fashion', label: 'Fashion 👗' },
  { id: 'anime', label: 'Anime ⛩️' },
  { id: 'fitness', label: 'Fitness 🏋️' },
  { id: 'music', label: 'Music 🎧' },
  { id: 'movies', label: 'Movies 🎬' },
  { id: 'food', label: 'Food 🍕' },
  { id: 'travel', label: 'Travel ✈️' },
  { id: 'tech', label: 'Tech 💻' },
  { id: 'art', label: 'Art 🎨' },
  { id: 'sports', label: 'Sports ⚽' },
  { id: 'memes', label: 'Memes 🐸' },
  { id: 'astrology', label: 'Astrology 🔮' },
  { id: 'books', label: 'Books 📚' },
]

export const OnboardingUI: React.FC = () => {
  const [step, setStep] = useState(1)
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareLink, setShareLink] = useState('')
  
  const { error: toastError, success: toastSuccess } = useToast()

  // Step 1 Validation
  const validateStep1 = () => {
    if (!username.trim() || !displayName.trim()) {
      toastError('Please fill in both fields.')
      return false
    }
    const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/
    if (!usernameRegex.test(username)) {
      toastError('Username must be 3-15 alphanumeric characters (or underscores).')
      return false
    }
    return true
  }

  // Step 2 Validation
  const validateStep2 = () => {
    if (pin.length !== 4) {
      toastError('PIN must be exactly 4 digits.')
      return false
    }
    if (pin !== confirmPin) {
      toastError('PINs do not match.')
      return false
    }
    return true
  }

  // Step 3 Validation & Registration
  const handleRegister = async () => {
    if (selectedInterests.length === 0) {
      toastError('Please select at least 1 interest.')
      return
    }
    if (selectedInterests.length > 5) {
      toastError('Please select at most 5 interests.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.toLowerCase().trim(),
          display_name: displayName.trim(),
          pin,
          interests: selectedInterests,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create profile')
      }

      toastSuccess('Profile created successfully!')
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      setShareLink(`${origin}/${data.username}`)
      setStep(4)
    } catch (err: any) {
      toastError(err.message || 'An error occurred during registration')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests((prev) => prev.filter((i) => i !== interest))
    } else {
      if (selectedInterests.length >= 5) {
        toastError('You can select a maximum of 5 interests.')
        return
      }
      setSelectedInterests((prev) => [...prev, interest])
    }
  }

  const copyToClipboard = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareLink)
      setCopied(true)
      toastSuccess('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const triggerDownload = () => {
    // Redirect to story card generation endpoint
    window.location.href = `/api/card/${username.toLowerCase().trim()}`
  }

  return (
    <div className="relative min-h-screen bg-canvas overflow-x-hidden font-body text-text-primary flex flex-col justify-between">
      {/* Background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[380px] h-[380px] rounded-full bg-radial from-purple-200/40 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-15%] w-[420px] h-[420px] rounded-full bg-radial from-pink-200/30 to-transparent blur-3xl pointer-events-none" />

      {/* Nav Header */}
      <header className="relative z-10 w-full px-6 py-5 border-b border-border bg-white/40 backdrop-blur-md flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-bold">Back</span>
        </Link>
        <span className="font-display font-extrabold text-xl text-gradient">Quizly✦</span>
        <div className="text-xs font-bold text-text-muted bg-surface px-3 py-1 rounded-pill border border-border">
          {step < 4 ? `Step ${step} of 3` : 'Ready! 🚀'}
        </div>
      </header>

      {/* Wizard Body */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {/* STEP 1: Username & Name */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="flex flex-col gap-6"
              >
                <div className="text-center sm:text-left">
                  <h2 className="text-3xl font-extrabold font-display mb-2">Claim Your Handle 🏷️</h2>
                  <p className="text-text-secondary text-sm">
                    Choose a unique username and a display name friends will recognize.
                  </p>
                </div>
                
                <Card>
                  <CardContent className="flex flex-col gap-5 p-6">
                    <Input
                      label="Unique Username"
                      placeholder="e.g., alex_jones"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      helperText="This forms your share link: quizly.app/username"
                    />
                    <Input
                      label="Display Name"
                      placeholder="e.g., Alex Johnson"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </CardContent>
                </Card>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    if (validateStep1()) setStep(2)
                  }}
                  className="group"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            )}

            {/* STEP 2: PIN Setup */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="flex flex-col gap-6"
              >
                <div className="text-center sm:text-left">
                  <h2 className="text-3xl font-extrabold font-display mb-2">Set Security PIN 🔒</h2>
                  <p className="text-text-secondary text-sm">
                    Choose a 4-digit PIN to lock your radar dashboard. Only you should know this.
                  </p>
                </div>

                <Card>
                  <CardContent className="flex flex-col gap-5 p-6 items-center">
                    <div className="flex flex-col gap-2 w-full text-center">
                      <span className="text-sm font-bold text-text-secondary">Enter PIN</span>
                      <PinEntry value={pin} onChange={setPin} error={pin.length > 0 && pin.length < 4} />
                    </div>

                    <div className="flex flex-col gap-2 w-full text-center mt-2">
                      <span className="text-sm font-bold text-text-secondary">Confirm PIN</span>
                      <PinEntry value={confirmPin} onChange={setConfirmPin} error={confirmPin.length > 0 && confirmPin.length < 4} />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => {
                      if (validateStep2()) setStep(3)
                    }}
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Interests */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="flex flex-col gap-6"
              >
                <div className="text-center sm:text-left">
                  <h2 className="text-3xl font-extrabold font-display mb-2">Pick Your Vibes ✨</h2>
                  <p className="text-text-secondary text-sm">
                    Select 1 to 5 interests. This customizes the questionnaire options and the AI engine insight roasts.
                  </p>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap gap-2.5 justify-center max-h-[300px] overflow-y-auto pr-1">
                      {INTEREST_OPTIONS.map((interest) => {
                        const isSelected = selectedInterests.includes(interest.label)
                        return (
                          <motion.button
                            key={interest.id}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => toggleInterest(interest.label)}
                            className={`
                              px-4 py-2.5 rounded-pill font-bold font-body text-sm cursor-pointer border transition-colors
                              ${
                                isSelected
                                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white border-transparent shadow-sm shadow-purple-500/10'
                                  : 'bg-white border-border text-text-secondary hover:bg-surface-hover'
                              }
                            `}
                          >
                            {interest.label}
                          </motion.button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button variant="secondary" className="flex-1" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    isLoading={isSubmitting}
                    onClick={handleRegister}
                  >
                    Finish Setup
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Success / Link Ready */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="flex flex-col gap-6 text-center"
              >
                <div className="flex justify-center mb-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                    <Sparkles className="w-8 h-8" />
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-extrabold font-display mb-2">You&apos;re Good to Go! 🎉</h2>
                  <p className="text-text-secondary text-sm">
                    Your personal Quizly link is ready. Share it to receive anonymous personality ratings from friends.
                  </p>
                </div>

                <Card>
                  <CardContent className="p-6 flex flex-col gap-4">
                    <div className="bg-canvas border border-border rounded-input p-3 flex items-center justify-between gap-3 overflow-hidden select-all font-mono text-sm text-text-primary text-left">
                      <span className="truncate flex-1 font-bold">{shareLink}</span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={copyToClipboard}
                        className="flex-shrink-0"
                      >
                        {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>

                    <div className="bg-purple-50 border border-purple-100 rounded-card p-4 text-left flex gap-3">
                      <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-extrabold text-purple-900 font-display">How to view your report:</h4>
                        <p className="text-xs text-purple-700 font-body leading-relaxed mt-1">
                          Go to <strong className="font-mono">{username.toLowerCase()}</strong> on the homepage, and enter your 4-digit PIN. Keep your PIN safe!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-3">
                  <Button variant="primary" size="lg" onClick={triggerDownload} className="w-full">
                    <Download className="w-5 h-5 mr-2" />
                    Download Instagram Story Card
                  </Button>
                  <Link href={`/${username.toLowerCase()}/report`} className="w-full">
                    <Button variant="secondary" size="lg" fullWidth>
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Nav footer */}
      <footer className="py-6 border-t border-border bg-white/20 text-center text-xs text-text-muted relative z-10">
        Quizly✦ Onboarding Wizard · Secured by End-to-End PIN Hashing
      </footer>
    </div>
  )
}
