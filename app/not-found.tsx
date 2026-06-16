'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-canvas overflow-x-hidden font-body text-text-primary flex items-center justify-center p-6">
      {/* Drifting blobs */}
      <div className="absolute top-[-5%] right-[-5%] w-[300px] h-[300px] rounded-full bg-radial from-purple-100/40 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-radial from-pink-100/30 to-transparent blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10 text-center"
      >
        <Card className="p-8">
          <CardContent className="flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-500 shadow-sm animate-bounce">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-3xl text-text-primary">Page Not Found</h1>
              <p className="text-text-secondary text-sm leading-relaxed mt-2.5">
                The profile or page you are looking for doesn&apos;t exist, was renamed, or has been suspended for terms violations.
              </p>
            </div>
            <Link href="/" className="w-full mt-2">
              <Button variant="primary" fullWidth className="flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Go Back Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
