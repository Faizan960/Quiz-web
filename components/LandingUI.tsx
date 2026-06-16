'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, ShieldCheck, Key, Play, User } from 'lucide-react'
import Link from 'next/link'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Card, CardContent, CardHeader } from './ui/Card'
import { Badge } from './ui/Badge'
import { PinEntry } from './ui/PinEntry'
import { useToast } from './ui/Toast'

interface TriviaItem {
  id: string
  slug: string
  title: string
  category: string
  play_count: number
}

interface LandingUIProps {
  initialTrivia: TriviaItem[]
}

export const LandingUI: React.FC<LandingUIProps> = ({ initialTrivia }) => {
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [showUnlockForm, setShowUnlockForm] = useState(false)
  const { error: toastError, success: toastSuccess } = useToast()

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || pin.length !== 4) {
      toastError('Please fill in your username and 4-digit PIN.')
      return
    }

    setIsUnlocking(true)
    try {
      const res = await fetch('/api/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim().toLowerCase(), pin }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      toastSuccess('Access granted! Loading your report...')
      // Redirect to report page with the session token
      window.location.href = `/${data.username}/report?token=${data.token}`
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Incorrect username or PIN'
      toastError(message)
      setIsUnlocking(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-canvas overflow-x-hidden font-body text-text-primary">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[380px] h-[380px] rounded-full bg-radial from-purple-200/40 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-15%] w-[420px] h-[420px] rounded-full bg-radial from-pink-200/30 to-transparent blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-24 relative z-10 flex flex-col items-center">
        {/* Logo and Sparkle */}
        <motion.div
          animate={{ rotate: [0, 10, 0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-8"
        >
          <Sparkles className="w-12 h-12 text-purple-600 animate-pulse" />
        </motion.div>

        {/* Hero Title */}
        <div className="text-center max-w-2xl mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold font-display leading-tight tracking-tight mb-4"
          >
            What do your friends <br />
            <span className="text-gradient">really</span> think? 👀
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-text-secondary leading-relaxed"
          >
            Create an anonymous quiz about yourself, share it on your Instagram or Snapchat story, and unlock a personalized personality radar.
          </motion.p>
        </div>

        {/* Primary CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md mb-16"
        >
          <Link href="/create" className="flex-1">
            <Button variant="primary" size="lg" fullWidth className="group">
              Get Your Link
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={() => setShowUnlockForm((prev) => !prev)}
          >
            <Key className="w-5 h-5 mr-2" />
            Unlock Report
          </Button>
        </motion.div>

        {/* Expandable Unlock Report Form */}
        <AnimatePresence>
          {showUnlockForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full max-w-md mb-16 overflow-hidden"
            >
              <Card>
                <CardHeader>
                  <h3 className="font-display font-extrabold text-xl text-text-primary flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-purple-600" />
                    Enter Profile Credentials
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Provide the username and PIN you chose during onboarding.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUnlock} className="flex flex-col gap-4">
                    <Input
                      label="Username"
                      placeholder="e.g., alex"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isUnlocking}
                      className="lowercase"
                      required
                    />
                    <div className="flex flex-col gap-2 mt-1">
                      <label className="text-sm font-bold text-text-secondary">
                        Secure 4-Digit PIN
                      </label>
                      <PinEntry
                        value={pin}
                        onChange={setPin}
                        disabled={isUnlocking}
                        error={pin.length > 0 && pin.length < 4}
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isUnlocking}
                      className="mt-2"
                    >
                      Verify PIN & Unlock
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trivia Subsection */}
        <div className="w-full max-w-3xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display font-extrabold text-2xl text-text-primary flex items-center gap-2">
              <span>🔥</span> Trending Trivia
            </h2>
            <Badge variant="outline">Community Made</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {initialTrivia.length > 0 ? (
              initialTrivia.map((trivia) => (
                <Link key={trivia.id} href={`/play/${trivia.slug}`}>
                  <Card interactive className="h-full">
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex flex-col gap-1.5">
                        <Badge variant="pink" className="w-fit">
                          {trivia.category}
                        </Badge>
                        <h4 className="font-display font-extrabold text-lg text-text-primary line-clamp-1">
                          {trivia.title}
                        </h4>
                        <span className="text-xs text-text-muted">
                          {trivia.play_count.toLocaleString()} plays
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 hover:bg-purple-100 transition-colors flex-shrink-0">
                        <Play className="w-4 h-4 fill-current" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              // Fallback cards if database is empty
              <>
                <Link href="/play/gen-z-slang">
                  <Card interactive>
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex flex-col gap-1.5">
                        <Badge variant="pink" className="w-fit">Slang & Culture</Badge>
                        <h4 className="font-display font-extrabold text-lg text-text-primary">
                          Gen-Z Vibe Check Quiz 🎭
                        </h4>
                        <span className="text-xs text-text-muted">4,500 plays</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                        <Play className="w-4 h-4 fill-current" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/play/aesthetic-match">
                  <Card interactive>
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex flex-col gap-1.5">
                        <Badge variant="pink" className="w-fit">Aesthetics</Badge>
                        <h4 className="font-display font-extrabold text-lg text-text-primary">
                          Ultimate Style & Vibe Matcher ✨
                        </h4>
                        <span className="text-xs text-text-muted">1,820 plays</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                        <Play className="w-4 h-4 fill-current" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Footer Admin Link */}
        <div className="mt-16 text-xs text-text-muted flex items-center gap-2">
          <span>© {new Date().getFullYear()} Quizly</span>
          <span>·</span>
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <User className="w-3 h-3" />
            Admin Panel
          </Link>
        </div>
      </div>
    </div>
  )
}
