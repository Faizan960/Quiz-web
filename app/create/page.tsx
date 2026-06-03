'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, ArrowLeft, Check, Copy, Share2, Sparkles, Brain, Heart, Briefcase, Zap, GraduationCap, Lock, ShieldCheck } from 'lucide-react'

const INTEREST_OPTIONS = [
  '💻 Tech', '🎨 Art', '🎵 Music', '📚 Books', '🎮 Gaming',
  '⚽ Sports', '🎬 Movies', '📸 Photography', '✈️ Travel', '🍳 Cooking',
  '🧘 Wellness', '📝 Writing', '🔬 Science', '💼 Business', '🎭 Theatre',
  '🌱 Environment', '🧩 Puzzles', '🎸 Guitar', '🏋️ Fitness', '🐕 Pets',
]

const CATEGORIES = [
  { id: 'personality' as const, label: 'Personality', icon: <Brain className="w-6 h-6 text-primary-light" />, desc: 'Core traits & character dimensions' },
  { id: 'friendship' as const, label: 'Friendship', icon: <Heart className="w-6 h-6 text-secondary" />, desc: 'How you show up as a friend' },
  { id: 'career' as const, label: 'Career', icon: <Briefcase className="w-6 h-6 text-accent" />, desc: 'Professional strengths & potential' },
  { id: 'fun' as const, label: 'Fun', icon: <Zap className="w-6 h-6 text-secondary" />, desc: 'Pop culture, humor & hypotheticals' },
  { id: 'college' as const, label: 'College', icon: <GraduationCap className="w-6 h-6 text-primary-light" />, desc: 'Campus reputation & social vibes' },
]

type QuestionCategory = 'personality' | 'friendship' | 'career' | 'fun' | 'college'

const slideVariants = {
  enter: { opacity: 0, x: 20, scale: 0.98 },
  center: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -20, scale: 0.98 },
}

export default function CreatePage() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [categories, setCategories] = useState<QuestionCategory[]>(['personality', 'fun'])
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ slug: string; url: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const totalSteps = 4

  const toggleInterest = (i: string) => {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
  }

  const toggleCategory = (c: QuestionCategory) => {
    setCategories(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    )
  }

  const canProceed = () => {
    switch (step) {
      case 0: return name.trim().length >= 2
      case 1: return interests.length >= 1
      case 2: return categories.length >= 1
      case 3: return pin.length >= 4 && pin === confirmPin
      default: return false
    }
  }

  const handleCreate = async () => {
    if (!canProceed()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: name.trim(),
          bio: bio.trim() || undefined,
          interests,
          pin,
          categories,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')

      setResult({ slug: data.slug, url: data.url })
    } catch (err: any) {
      setError(err.message || 'Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  const shareUrl = result ? `${typeof window !== 'undefined' ? window.location.origin : ''}${result.url}` : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ─── Success State ────────────────────────────
  if (result) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden text-text-primary">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="relative z-10 w-full max-w-lg glass-card p-8 md:p-12 text-center border border-white/5 shadow-2xl"
        >
          <div className="w-20 h-20 bg-emerald-950/40 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10 animate-pulse-glow">
            <Sparkles className="w-10 h-10 text-accent animate-pulse" />
          </div>
          
          <h1 className="font-display text-3xl font-black mb-3 text-text-primary">
            Your Mirror is Live!
          </h1>
          <p className="text-text-secondary text-sm md:text-base mb-8 leading-relaxed font-medium">
            Share this link with friends. Once 3+ people respond, you can unlock your Social Report.
          </p>

          {/* Share Link Box */}
          <div className="bg-surface border border-white/5 rounded-2xl p-2 pl-4 flex items-center gap-3 mb-6 shadow-inner">
            <div className="flex-1 font-bold text-primary-light truncate text-left text-sm">
              {shareUrl}
            </div>
            <button 
              onClick={handleCopy} 
              className="bg-gradient-to-r from-primary to-secondary text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-95 active:scale-95 flex items-center gap-2 flex-shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <a
              href={`https://wa.me/?text=Hey%21%20Answer%20some%20questions%20about%20me%20on%20Social%20Mirror%20🪞%20${encodeURIComponent(shareUrl)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border border-[#25D366]/20 rounded-2xl py-3 font-semibold transition-colors"
            >
              💬 WhatsApp
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=Answer%20questions%20about%20me%20on%20Social%20Mirror%20🪞&url=${encodeURIComponent(shareUrl)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-white/5 text-text-primary hover:bg-white/10 border border-white/10 rounded-2xl py-3 font-semibold transition-colors"
            >
              𝕏 Twitter
            </a>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Link 
              href={`${result.url}/report`} 
              className="flex items-center justify-center gap-2 flex-1 bg-surface border border-white/5 text-text-primary hover:bg-surface-hover rounded-2xl py-3.5 font-bold transition-all shadow-sm"
            >
              📊 View Report
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-text-muted font-semibold">
            <ShieldCheck className="w-4 h-4 text-accent" /> Keep your PIN safe &mdash; you will need it to view your report.
          </div>
        </motion.div>
      </div>
    )
  }

  // ─── Creation Wizard ──────────────────────────
  return (
    <div className="min-h-screen bg-background relative flex flex-col text-text-primary">
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-pastel-gradient opacity-60" />

      {/* Header */}
      <nav className="glass-panel sticky top-0 z-50 flex items-center justify-between px-6 py-4 md:px-10 border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl drop-shadow-[0_0_8px_rgba(157,78,221,0.4)]">🪞</span>
          <span className="text-gradient font-display font-extrabold text-lg">Social Mirror</span>
        </Link>
        <div className="px-4 py-1.5 rounded-full bg-surface border border-white/5 text-xs font-bold text-text-secondary shadow-sm">
          Step {step + 1} of {totalSteps}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center pt-12 pb-24 px-6 relative z-10 w-full">
        <div className="w-full max-w-xl">
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-zinc-950 rounded-full mb-12 overflow-hidden shadow-inner">
            <motion.div
              animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full shadow-[0_0_10px_rgba(157,78,221,0.5)]"
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              layout
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="glass-card p-8 md:p-10 relative overflow-hidden border border-white/5"
            >
              {/* Step 0: Name & Bio */}
              {step === 0 && (
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary-light mb-6 shadow-sm">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <h1 className="font-display text-3xl font-black mb-3 text-text-primary">
                    Let&apos;s set up your mirror
                  </h1>
                  <p className="text-text-secondary text-sm md:text-base mb-8 font-medium">
                    Start with your name. This is how your friends will see you.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                        Your Name
                      </label>
                      <input
                        className="w-full bg-surface border border-white/5 rounded-2xl px-5 py-4 text-text-primary font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                        type="text"
                        placeholder="e.g., Sneha"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                        Bio <span className="font-semibold normal-case opacity-60">(optional)</span>
                      </label>
                      <textarea
                        className="w-full bg-surface border border-white/5 rounded-2xl px-5 py-4 text-text-primary font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none"
                        placeholder="A short line about yourself..."
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Interests */}
              {step === 1 && (
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-pink-950/40 border border-pink-500/20 text-secondary mb-6 shadow-sm">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h1 className="font-display text-3xl font-black mb-3 text-text-primary">
                    What are you into?
                  </h1>
                  <p className="text-text-secondary text-sm md:text-base mb-8 font-medium">
                    Pick your interests. Our AI uses these to personalize your questions.
                  </p>

                  <div className="flex flex-wrap gap-2.5">
                    {INTEREST_OPTIONS.map(interest => {
                      const isSelected = interests.includes(interest);
                      return (
                        <button
                          key={interest}
                          onClick={() => toggleInterest(interest)}
                          className={`
                            px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-200 border
                            ${isSelected 
                              ? 'bg-primary/20 border-primary text-primary-light shadow-md' 
                              : 'bg-surface border-white/5 text-text-secondary hover:border-primary/40 hover:bg-surface-hover'}
                          `}
                        >
                          {interest}
                        </button>
                      )
                    })}
                  </div>
                  
                  {interests.length > 0 && (
                    <div className="mt-6 text-sm font-bold text-primary-light">
                      {interests.length} selected
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Categories */}
              {step === 2 && (
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-accent mb-6 shadow-sm">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h1 className="font-display text-3xl font-black mb-3 text-text-primary">
                    Choose question types
                  </h1>
                  <p className="text-text-secondary text-sm md:text-base mb-8 font-medium">
                    What do you want your friends to answer about you?
                  </p>

                  <div className="flex flex-col gap-3">
                    {CATEGORIES.map(cat => {
                      const isSelected = categories.includes(cat.id);
                      return (
                        <motion.button
                          key={cat.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleCategory(cat.id)}
                          className={`
                            flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-200
                            ${isSelected 
                              ? 'bg-primary/10 border-primary shadow-[0_4px_25px_-10px_rgba(157,78,221,0.3)]' 
                              : 'bg-surface border-white/5 hover:border-primary/40 hover:bg-surface-hover'}
                          `}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelected ? 'bg-surface border border-white/10' : 'bg-surface-hover'}`}>
                            {cat.icon}
                          </div>
                          <div className="flex-1">
                            <div className={`font-display font-black text-lg ${isSelected ? 'text-primary-light' : 'text-text-primary'}`}>
                              {cat.label}
                            </div>
                            <div className="text-xs md:text-sm text-text-secondary mt-0.5 font-medium">{cat.desc}</div>
                          </div>
                          <div className={`
                            w-6 h-6 rounded-md flex items-center justify-center text-white
                            ${isSelected ? 'bg-primary shadow-sm' : 'border-2 border-white/10'}
                          `}>
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: PIN */}
              {step === 3 && (
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary mb-6 shadow-sm">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h1 className="font-display text-3xl font-black mb-3 text-text-primary">
                    Set your secret PIN
                  </h1>
                  <p className="text-text-secondary text-sm md:text-base mb-8 font-medium">
                    You will need this to view your report. Only you should know it.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                        PIN (min 4 characters)
                      </label>
                      <input
                        className="w-full bg-surface border border-white/5 rounded-2xl px-5 py-4 text-text-primary font-black tracking-[0.2em] focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-center text-lg"
                        type="password"
                        placeholder="••••"
                        value={pin}
                        onChange={e => setPin(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                        Confirm PIN
                      </label>
                      <input
                        className="w-full bg-surface border border-white/5 rounded-2xl px-5 py-4 text-text-primary font-black tracking-[0.2em] focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-center text-lg"
                        type="password"
                        placeholder="••••"
                        value={confirmPin}
                        onChange={e => setConfirmPin(e.target.value)}
                      />
                      {confirmPin && pin !== confirmPin && (
                        <p className="text-secondary text-sm font-semibold mt-2 flex items-center gap-1 justify-center">
                          PINs do not match
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-2xl bg-secondary/10 border border-secondary/20 text-secondary text-sm font-semibold text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Navigation Controls */}
          <div className={`flex gap-4 mt-8 ${step === 0 ? 'justify-end' : 'justify-between'}`}>
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center justify-center gap-2 flex-1 max-w-[160px] bg-surface border border-white/5 text-text-secondary hover:bg-surface-hover rounded-2xl py-4 font-bold transition-all shadow-sm"
              >
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
            )}
            
            {step < totalSteps - 1 ? (
              <button
                onClick={() => canProceed() && setStep(s => s + 1)}
                disabled={!canProceed()}
                className={`flex items-center justify-center gap-2 flex-1 ${step === 0 ? 'max-w-[200px]' : ''} bg-gradient-to-r from-primary to-secondary text-white rounded-2xl py-4 font-bold transition-all shadow-lg shadow-primary/20 ${!canProceed() ? 'opacity-50 cursor-not-allowed text-zinc-500' : 'hover:opacity-95 hover:scale-[1.01] active:scale-[0.99]'}`}
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={!canProceed() || loading}
                className={`flex items-center justify-center gap-2 flex-1 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl py-4 font-bold transition-all shadow-xl shadow-primary/25 ${(!canProceed() || loading) ? 'opacity-50 cursor-not-allowed text-zinc-500' : 'hover:opacity-95 hover:scale-[1.01] active:scale-[0.99]'}`}
              >
                {loading ? 'Creating...' : 'Create My Mirror'} <Sparkles className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
