'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const router = useRouter()
  const { error: toastError, success: toastSuccess } = useToast()

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('quizly_admin_token')
    if (token) {
      router.push('/admin/dashboard')
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      toastError('Please enter the admin password.')
      return
    }

    setIsLoggingIn(true)
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      toastSuccess('Access granted! Loading dashboard...')
      localStorage.setItem('quizly_admin_token', data.token)
      
      // Set a cookie so the middleware can check admin sessions on SSR
      document.cookie = `quizly_admin_token=${data.token}; path=/; max-age=86400; SameSite=Strict`
      
      router.push('/admin/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Incorrect password'
      toastError(message)
      setPassword('')
      setIsLoggingIn(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-canvas overflow-x-hidden font-body text-text-primary flex items-center justify-center p-6">
      {/* Drifting blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[380px] h-[380px] rounded-full bg-radial from-purple-200/40 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-15%] w-[420px] h-[420px] rounded-full bg-radial from-pink-200/30 to-transparent blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="shadow-xl">
          <CardHeader className="text-center pt-8">
            <div className="w-14 h-14 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-600 shadow-sm">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Admin Portal</h1>
            <p className="text-text-secondary text-xs mt-1">
              Enter the master password to access moderator controls and metrics.
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoggingIn}
                  required
                  className=""
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[38px] text-text-muted hover:text-text-primary transition-colors cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoggingIn}
                className="mt-2"
              >
                Unlock Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="text-center mt-6">
              <Link href="/" className="text-xs font-bold text-text-secondary hover:underline">
                ← Return to Homepage
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
