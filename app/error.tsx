'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertOctagon, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { logError } from '@/lib/monitoring/errors'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error using our structured error logger
    logError(error, { context_area: 'global-error-boundary', digest: error.digest })
  }, [error])

  return (
    <div className="relative min-h-screen bg-canvas overflow-x-hidden font-body text-text-primary flex items-center justify-center p-6">
      <div className="absolute top-[-5%] right-[-5%] w-[300px] h-[300px] rounded-full bg-radial from-purple-100/40 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-radial from-pink-100/30 to-transparent blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10 text-center"
      >
        <Card className="p-8">
          <CardContent className="flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-error-light border border-error/15 flex items-center justify-center text-error shadow-sm">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl text-text-primary">Something Went Wrong</h1>
              <p className="text-text-secondary text-sm leading-relaxed mt-2">
                An unexpected error occurred while rendering this page.
              </p>
              {error.digest && (
                <span className="block font-mono text-[9px] text-text-muted mt-1 bg-canvas border border-border px-1.5 py-0.5 rounded w-fit mx-auto">
                  ID: {error.digest}
                </span>
              )}
            </div>
            <div className="flex gap-3 w-full mt-2">
              <Button variant="secondary" onClick={() => window.location.href = '/'} className="flex-1">
                Go Home
              </Button>
              <Button variant="primary" onClick={reset} className="flex-1 flex items-center justify-center gap-1.5">
                <RotateCcw className="w-4 h-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
