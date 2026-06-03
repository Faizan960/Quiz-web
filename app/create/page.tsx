'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, ArrowLeft, Check, Copy, Share2, Sparkles, Brain, Heart, Briefcase, Zap, GraduationCap, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react'

const INTEREST_OPTIONS = [
  '💻 Tech', '🎨 Art', '🎵 Music', '📚 Books', '🎮 Gaming',
  '⚽ Sports', '🎬 Movies', '📸 Photography', '✈️ Travel', '🍳 Cooking',
  '🧘 Wellness', '📝 Writing', '🔬 Science', '💼 Business', '🎭 Theatre',
  '🌱 Environment', '🧩 Puzzles', '🎸 Guitar', '🏋️ Fitness', '🐕 Pets',
]

const CATEGORIES = [
  { id: 'personality' as const, label: 'Personality', icon: <Brain className="w-5 h-5 text-primary-light" />, desc: 'Core traits & character dimensions' },
  { id: 'friendship' as const, label: 'Friendship', icon: <Heart className="w-5 h-5 text-secondary" />, desc: 'How you show up as a friend' },
  { id: 'career' as const, label: 'Career', icon: <Briefcase className="w-5 h-5 text-accent" />, desc: 'Professional strengths & potential' },
  { id: 'fun' as const, label: 'Fun', icon: <Zap className="w-5 h-5 text-secondary" />, desc: 'Pop culture, humor & hypotheticals' },
  { id: 'college' as const, label: 'College', icon: <GraduationCap className="w-5 h-5 text-primary-light" />, desc: 'Reputation & campus vibes' },
]

type QuestionCategory = 'personality' | 'friendship' | 'career' | 'fun' | 'college'

const slideVariants = {
  enter: { opacity: 0, x: 15, scale: 0.98 },
  center: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -15, scale: 0.98 },
}

const STEP_LABELS = [
  { title: 'Profile details', desc: 'Display name & bio' },
  { title: 'Define interests', desc: 'Personalize topics' },
  { title: 'Question types', desc: 'Feedback domains' },
  { title: 'Secure access', desc: 'Set your privacy PIN' },
]

export default function CreatePage() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [categories, setCategories] = useState<QuestionCategory[]>(['personality', 'fun'])
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [showPin, setShowPin] = useState(false)
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
        <div className="absolute inset-0 z-0 pointer-events-none bg-dot-grid opacity-70" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="relative z-10 w-full max-w-lg glass-card p-8 md:p-10 text-center border border-white/5 shadow-2xl"
        >
          <div className="w-16 h-16 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-emerald-500/5">
            <Sparkles className="w-8 h-8 text-accent animate-pulse" />
          </div>
          
          <h1 className="font-display text-2xl md:text-3xl font-black mb-2 text-text-primary">
            Your Mirror is Live!
          </h1>
          <p className="text-text-secondary text-xs md:text-sm mb-7 leading-relaxed font-medium">
            Share your custom mirror link. Once 3+ friends respond, you can unlock your personalized insights report.
          </p>

          {/* Share Link Box */}
          <div className="bg-surface/65 border border-white/5 rounded-2xl p-2 pl-4 flex items-center gap-3 mb-5 shadow-inner">
            <div className="flex-1 font-bold text-primary-light truncate text-left text-xs md:text-sm">
              {shareUrl}
            </div>
            <button 
              onClick={handleCopy} 
              className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all hover:opacity-95 active:scale-95 flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Link'}
            </button>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <a
              href={`https://wa.me/?text=Hey%21%20Answer%20some%20questions%20about%20me%20on%20Social%20Mirror%20🪞%20${encodeURIComponent(shareUrl)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366]/8 text-[#25D366] hover:bg-[#25D366]/15 border border-[#25D366]/15 rounded-2xl py-3 text-xs md:text-sm font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              💬 WhatsApp
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=Answer%20questions%20about%20me%20on%20Social%20Mirror%20🪞&url=${encodeURIComponent(shareUrl)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-white/5 text-text-primary hover:bg-white/10 border border-white/10 rounded-2xl py-3 text-xs md:text-sm font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              𝕏 Twitter
            </a>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Link 
              href={`${result.url}/report`} 
              className="flex items-center justify-center gap-2 flex-1 bg-surface border border-white/5 text-text-primary hover:bg-surface-hover hover:border-white/10 rounded-2xl py-3.5 text-xs md:text-sm font-bold transition-all shadow-sm"
            >
              📊 View Dashboard
            </Link>
          </div>

          <div className="mt-8 pt-5 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] md:text-xs text-text-muted font-bold">
            <ShieldCheck className="w-4 h-4 text-accent" /> Remember your PIN to access your insights in the future.
          </div>
        </motion.div>
      </div>
    )
  }

  // ─── Creation Wizard ──────────────────────────
  return (
    <div className="min-h-screen bg-background relative flex flex-col text-text-primary overflow-x-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-dot-grid opacity-70" />
      <div className="absolute inset-0 z-0 pointer-events-none bg-pastel-gradient opacity-50" />

      {/* Header */}
      <nav className="glass-panel sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg drop-shadow-[0_0_8px_rgba(124,58,237,0.4)]">🪞</span>
          <span className="text-gradient font-display font-black text-sm md:text-base tracking-tight">Social Mirror</span>
        </Link>
        <div className="px-3.5 py-1 rounded-full bg-surface border border-white/5 text-[10px] md:text-xs font-bold text-text-secondary shadow-sm">
          Step {step + 1} of {totalSteps}
        </div>
      </nav>

      <main className="flex-1 flex flex-col md:flex-row max-w-5xl mx-auto w-full pt-8 md:pt-16 pb-24 px-6 gap-8 relative z-10">
        
        {/* Step Navigation Sidebar (Desktop) */}
        <div className="hidden md:flex flex-col w-64 shrink-0">
          <div className="space-y-6">
            {STEP_LABELS.map((item, idx) => {
              const isActive = step === idx
              const isCompleted = step > idx
              return (
                <div key={idx} className="flex gap-4 items-center relative">
                  {/* Step line connector */}
                  {idx < totalSteps - 1 && (
                    <div 
                      className={`absolute left-5 top-10 bottom-[-16px] w-[1px] transition-colors duration-300 ${
                        step > idx ? 'bg-primary' : 'bg-white/10'
                      }`}
                    />
                  )}
                  
                  {/* Indicator Dot */}
                  <div 
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border transition-all duration-300 ${
                      isActive 
                        ? 'bg-primary/20 border-primary text-primary-light shadow-[0_0_12px_rgba(124,58,237,0.2)]'
                        : isCompleted
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-surface border-white/5 text-text-muted'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : `0${idx + 1}`}
                  </div>
                  
                  {/* Title & Desc */}
                  <div>
                    <h4 className={`text-xs font-bold transition-colors ${isActive ? 'text-primary-light' : isCompleted ? 'text-text-primary' : 'text-text-muted'}`}>
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-text-secondary mt-0.5 font-medium">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Stepper Header (Mobile) */}
        <div className="md:hidden w-full">
          <div className="w-full h-1.5 bg-zinc-950 rounded-full mb-6 overflow-hidden shadow-inner">
            <motion.div
              animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
            />
          </div>
          <div className="text-xs font-bold text-primary-light mb-4">
            {STEP_LABELS[step].title}
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              layout
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="glass-card p-6 md:p-8 relative overflow-hidden border border-white/5 shadow-lg"
            >
              {/* Step 0: Name & Bio */}
              {step === 0 && (
                <div>
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary-light mb-5 shadow-sm">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <h1 className="font-display text-2xl font-black mb-2 text-text-primary">
                    Let&apos;s set up your mirror
                  </h1>
                  <p className="text-text-secondary text-xs md:text-sm mb-6.5 font-medium">
                    Start with your display name. This is how friends will identify your mirror.
                  </p>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                        Display Name
                      </label>
                      <input
                        className="w-full bg-surface border border-white/5 rounded-2xl px-4.5 py-3.5 text-xs md:text-sm text-text-primary font-bold focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all outline-none"
                        type="text"
                        placeholder="e.g., Sneha"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                        Bio <span className="font-semibold normal-case opacity-60">(optional)</span>
                      </label>
                      <textarea
                        className="w-full bg-surface border border-white/5 rounded-2xl px-4.5 py-3.5 text-xs md:text-sm text-text-primary font-bold focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all outline-none resize-none"
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
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-pink-950/20 border border-pink-500/20 text-secondary mb-5 shadow-sm">
                    <Heart className="w-5 h-5" />
                  </div>
                  <h1 className="font-display text-2xl font-black mb-2 text-text-primary">
                    What are you into?
                  </h1>
                  <p className="text-text-secondary text-xs md:text-sm mb-6.5 font-medium">
                    Choose interests. The AI will weave these directly into custom questions.
                  </p>

                  <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto pr-1">
                    {INTEREST_OPTIONS.map(interest => {
                      const isSelected = interests.includes(interest);
                      return (
                        <button
                          key={interest}
                          onClick={() => toggleInterest(interest)}
                          className={`
                            px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-200 border cursor-pointer
                            ${isSelected 
                              ? 'bg-primary/20 border-primary text-primary-light shadow-sm' 
                              : 'bg-surface border-white/5 text-text-secondary hover:border-primary/30 hover:bg-surface-hover'}
                          `}
                        >
                          {interest}
                        </button>
                      )
                    })}
                  </div>
                  
                  {interests.length > 0 && (
                    <div className="mt-5 text-xs font-bold text-primary-light flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-accent" /> {interests.length} selected
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Categories */}
              {step === 2 && (
                <div>
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-accent mb-5 shadow-sm">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h1 className="font-display text-2xl font-black mb-2 text-text-primary">
                    Choose question types
                  </h1>
                  <p className="text-text-secondary text-xs md:text-sm mb-6.5 font-medium">
                    What aspects of your character do you want friends to reflect on?
                  </p>

                  <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {CATEGORIES.map(cat => {
                      const isSelected = categories.includes(cat.id);
                      return (
                        <motion.button
                          key={cat.id}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => toggleCategory(cat.id)}
                          className={`
                            flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer
                            ${isSelected 
                              ? 'bg-primary/10 border-primary shadow-sm' 
                              : 'bg-surface border-white/5 hover:border-primary/35 hover:bg-surface-hover'}
                          `}
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isSelected ? 'bg-surface border border-white/8' : 'bg-surface-hover'}`}>
                            {cat.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-display font-black text-sm ${isSelected ? 'text-primary-light' : 'text-text-primary'}`}>
                              {cat.label}
                            </div>
                            <div className="text-[10px] md:text-xs text-text-secondary mt-0.5 font-medium truncate">{cat.desc}</div>
                          </div>
                          <div className={`
                            w-5 h-5 rounded flex items-center justify-center text-white
                            ${isSelected ? 'bg-primary shadow-sm' : 'border border-white/15'}
                          `}>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
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
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary mb-5 shadow-sm">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h1 className="font-display text-2xl font-black mb-2 text-text-primary">
                    Create privacy PIN
                  </h1>
                  <p className="text-text-secondary text-xs md:text-sm mb-6.5 font-medium">
                    This PIN locks your dashboard. You will need it to view friend submissions.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                        Secret PIN (minimum 4 digits)
                      </label>
                      <div className="relative">
                        <input
                          className="w-full bg-surface border border-white/5 rounded-2xl px-4.5 py-3.5 text-xs md:text-sm text-text-primary font-black tracking-[0.2em] focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all outline-none text-center"
                          type={showPin ? 'text' : 'password'}
                          placeholder="••••"
                          value={pin}
                          onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                          autoFocus
                        />
                        <button 
                          onClick={() => setShowPin(!showPin)} 
                          className="absolute right-4.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                          type="button"
                        >
                          {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                        Confirm Secret PIN
                      </label>
                      <input
                        className="w-full bg-surface border border-white/5 rounded-2xl px-4.5 py-3.5 text-xs md:text-sm text-text-primary font-black tracking-[0.2em] focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all outline-none text-center"
                        type={showPin ? 'text' : 'password'}
                        placeholder="••••"
                        value={confirmPin}
                        onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      />
                      {confirmPin && pin !== confirmPin && (
                        <p className="text-secondary text-xs font-semibold mt-2 text-center flex items-center gap-1 justify-center">
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
              className="mt-4 p-3.5 rounded-2xl bg-secondary/10 border border-secondary/20 text-secondary text-xs md:text-sm font-semibold text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Navigation Controls */}
          <div className="flex gap-4 mt-6">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center justify-center gap-1.5 flex-1 max-w-[120px] bg-surface border border-white/5 text-text-secondary hover:bg-surface-hover hover:border-white/10 rounded-2xl py-3.5 text-xs md:text-sm font-bold transition-all shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            
            {step < totalSteps - 1 ? (
              <button
                onClick={() => canProceed() && setStep(s => s + 1)}
                disabled={!canProceed()}
                className={`flex items-center justify-center gap-1.5 flex-1 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl py-3.5 text-xs md:text-sm font-bold transition-all shadow-md shadow-primary/15 cursor-pointer ${!canProceed() ? 'opacity-40 cursor-not-allowed text-zinc-500 shadow-none' : 'hover:opacity-95 hover:scale-[1.01] active:scale-[0.99]'}`}
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={!canProceed() || loading}
                className={`flex items-center justify-center gap-1.5 flex-1 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl py-3.5 text-xs md:text-sm font-bold transition-all shadow-lg shadow-primary/20 cursor-pointer ${(!canProceed() || loading) ? 'opacity-40 cursor-not-allowed text-zinc-500 shadow-none' : 'hover:opacity-95 hover:scale-[1.01] active:scale-[0.99]'}`}
              >
                {loading ? 'Creating...' : 'Create My Mirror'} <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

