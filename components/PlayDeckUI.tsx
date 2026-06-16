'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Play, Sparkles, ChevronRight, Zap } from 'lucide-react'
import Link from 'next/link'
import { nanoid } from 'nanoid'
import { PublicProfile, Question, AnswerKey } from '@/types/quiz'
import { Button } from './ui/Button'
import { Card, CardContent } from './ui/Card'
import { Skeleton } from './ui/Skeleton'
import { useToast } from './ui/Toast'

interface PlayDeckUIProps {
  profile: PublicProfile
}

export const PlayDeckUI: React.FC<PlayDeckUIProps> = ({ profile }) => {
  const [respondentToken, setRespondentToken] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AnswerKey>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [selectedOpt, setSelectedOpt] = useState<AnswerKey | null>(null)
  
  const { error: toastError, success: toastSuccess } = useToast()

  // 1. Initialize respondent token from localStorage
  useEffect(() => {
    let token = localStorage.getItem('quizly_respondent_token')
    if (!token) {
      token = `resp_${nanoid(16)}`
      localStorage.setItem('quizly_respondent_token', token)
    }
    setRespondentToken(token)
  }, [])

  // 2. Fetch questions once respondentToken is ready
  useEffect(() => {
    if (!respondentToken) return

    const fetchQuestions = async () => {
      try {
        const res = await fetch(`/api/responses?profileId=${profile.id}&token=${respondentToken}`)
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch questions')
        }
        setQuestions(data.questions || [])
      } catch (err: any) {
        toastError(err.message || 'Error loading questions')
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestions()
  }, [respondentToken, profile.id, toastError])

  const currentQuestion = questions[currentIndex]

  // 3. Handle answer selection
  const handleAnswerSelect = useCallback(
    async (optionKey: AnswerKey) => {
      if (selectedOpt || isSubmitting || isCompleted) return
      setSelectedOpt(optionKey)

      const newAnswers = { ...answers, [currentQuestion.id]: optionKey }
      setAnswers(newAnswers)

      // Small delay for answer highlight transition
      await new Promise((r) => setTimeout(r, 450))

      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1)
        setSelectedOpt(null)
      } else {
        // Submit all answers
        setIsSubmitting(true)
        try {
          const res = await fetch('/api/responses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              profile_id: profile.id,
              respondent_token: respondentToken,
              answers: newAnswers,
            }),
          })

          const data = await res.json()
          if (!res.ok) {
            throw new Error(data.error || 'Submission failed')
          }

          toastSuccess('Responses submitted anonymously! 🎉')
          isCompletedStateChange()
        } catch (err: any) {
          toastError(err.message || 'Error submitting response')
          setIsSubmitting(false)
        }
      }
    },
    [currentIndex, questions, answers, selectedOpt, isSubmitting, isCompleted, profile.id, respondentToken, toastSuccess, toastError]
  )

  const isCompletedStateChange = () => {
    setIsSubmitting(false)
    setIsCompleted(true)
  }

  // 4. Keyboard shortcuts (A-D or 1-4)
  useEffect(() => {
    if (isLoading || isCompleted || isSubmitting || !currentQuestion) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase()
      if (key === 'A' || key === '1') handleAnswerSelect('A')
      else if (key === 'B' || key === '2') handleAnswerSelect('B')
      else if (key === 'C' || key === '3') handleAnswerSelect('C')
      else if (key === 'D' || key === '4') handleAnswerSelect('D')
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLoading, isCompleted, isSubmitting, currentQuestion, handleAnswerSelect])

  // Progress percentage
  const progressPercent = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto py-12 flex flex-col gap-6">
        <Skeleton className="h-6 w-1/3 rounded-pill" />
        <Skeleton className="h-8 w-full rounded-md" />
        <Skeleton className="h-[200px] w-full rounded-card" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-12 w-full rounded-input" />
          <Skeleton className="h-12 w-full rounded-input" />
          <Skeleton className="h-12 w-full rounded-input" />
          <Skeleton className="h-12 w-full rounded-input" />
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto py-16 text-center flex flex-col items-center gap-6">
        <AlertTriangle className="w-16 h-16 text-warning animate-bounce" />
        <div>
          <h3 className="font-display font-extrabold text-2xl text-text-primary">No Questions Available</h3>
          <p className="text-text-secondary text-sm mt-2">
            You might have answered all available questions for {profile.display_name}, or the creator hasn&apos;t set up questions yet.
          </p>
        </div>
        <Link href="/" className="w-full">
          <Button variant="secondary" size="lg" fullWidth>
            Go Home
          </Button>
        </Link>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto py-12 text-center flex flex-col items-center gap-6"
      >
        <div className="w-16 h-16 rounded-full bg-success-light border border-success/15 flex items-center justify-center text-success shadow-lg shadow-success/5">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <h3 className="font-display font-extrabold text-2xl text-text-primary">Response Submitted!</h3>
          <p className="text-text-secondary text-sm mt-2 leading-relaxed">
            Your answers are stored completely anonymously. {profile.display_name} will see their updated radar dashboard once they log in!
          </p>
        </div>

        <Card className="w-full mt-4">
          <CardContent className="p-6 flex flex-col gap-4 items-center">
            <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
            <h4 className="font-display font-extrabold text-lg text-text-primary">
              Ready to find out about yourself?
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed max-w-[280px]">
              Create your own anonymous link and share it on Instagram or Snapchat to unlock your report.
            </p>
            <Link href="/create" className="w-full mt-2">
              <Button variant="primary" size="md" fullWidth>
                Create Your Profile
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Link href="/" className="text-sm font-bold text-text-secondary hover:underline">
          Back to Homepage
        </Link>
      </motion.div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto py-8">
      {/* Progress tracker */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-text-secondary">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-pink-600 bg-pink-50 border border-pink-100/50 px-2 py-0.5 rounded-pill">
            <Zap className="w-3 h-3 fill-current" />
            Anonymous
          </span>
        </div>
        <div className="height-[6px] w-full bg-border-strong/40 rounded-pill overflow-hidden relative">
          <motion.div
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
            className="h-1.5 rounded-pill bg-gradient-to-r from-pink-500 to-purple-600 shadow-md shadow-pink-500/20"
          />
        </div>
      </div>

      {/* Card Deck animation container */}
      <div className="relative min-h-[360px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="absolute inset-0 flex flex-col gap-6"
          >
            {/* Question card */}
            <Card className="flex-1 flex flex-col justify-center min-h-[160px] p-6 text-center border-2 border-purple-100 shadow-lg shadow-purple-500/5 bg-radial from-white to-purple-50/10">
              <span className="text-xs font-bold text-purple-600 tracking-wider uppercase font-mono mb-2">
                About {profile.display_name}
              </span>
              <h2 className="font-display font-extrabold text-xl md:text-2xl text-text-primary leading-snug">
                {currentQuestion.text}
              </h2>
            </Card>

            {/* Answer option buttons */}
            <div className="flex flex-col gap-3">
              {(['A', 'B', 'C', 'D'] as AnswerKey[]).map((key) => {
                const isSelected = selectedOpt === key
                const dimmed = selectedOpt !== null && !isSelected

                return (
                  <motion.button
                    key={key}
                    onClick={() => handleAnswerSelect(key)}
                    disabled={selectedOpt !== null || isSubmitting}
                    whileHover={selectedOpt === null ? { x: 4 } : {}}
                    whileTap={selectedOpt === null ? { scale: 0.98 } : {}}
                    className={`
                      w-full p-4 rounded-input border text-left font-body text-base font-bold flex items-center gap-4 cursor-pointer transition-all duration-200
                      ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white border-transparent shadow-lg shadow-purple-500/10 scale-[1.01]'
                          : dimmed
                          ? 'opacity-40 bg-white border-border'
                          : 'bg-white border-border text-text-primary hover:border-border-strong hover:bg-surface-hover'
                      }
                    `}
                  >
                    <span
                      className={`
                        w-7 h-7 rounded-md text-xs font-extrabold flex items-center justify-center flex-shrink-0 transition-colors
                        ${
                          isSelected
                            ? 'bg-white/25 text-white'
                            : 'bg-canvas text-text-secondary'
                        }
                      `}
                    >
                      {key}
                    </span>
                    <span className="flex-grow">{currentQuestion.options[key]}</span>
                    
                    {/* Keyboard helper dot */}
                    {selectedOpt === null && (
                      <span className="hidden md:inline text-[10px] text-text-muted bg-canvas border border-border px-1.5 py-0.5 rounded uppercase font-mono">
                        {key}
                      </span>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Keyboard guide footer */}
      <div className="mt-8 text-center text-xs text-text-muted hidden md:block">
        Press <strong className="font-mono bg-white border border-border px-1 py-0.5 rounded">A-D</strong> or <strong className="font-mono bg-white border border-border px-1 py-0.5 rounded">1-4</strong> on your keyboard for quick answering.
      </div>
    </div>
  )
}
