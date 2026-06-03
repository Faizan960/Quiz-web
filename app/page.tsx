'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Brain, Flame, Heart, Share2, MessageCircle, BarChart3, ArrowRight, CheckCircle2, Star, ShieldCheck, UserCheck } from 'lucide-react'

const FEATURES = [
  {
    icon: <Brain className="w-6 h-6 text-primary-light" />,
    title: 'Perception Mirror',
    desc: 'Aggregates anonymous feedback from friends into a precise reflection of your personality archetype.',
    colSpan: 'md:col-span-2',
    bg: 'border-primary/10 hover:border-primary/30 bg-primary/2'
  },
  {
    icon: <Flame className="w-6 h-6 text-secondary" />,
    title: 'Roast Mode',
    desc: 'An brutally accurate, humor-packed roast woven from your specific interest profile.',
    colSpan: 'md:col-span-1',
    bg: 'border-secondary/10 hover:border-secondary/30 bg-secondary/2'
  },
  {
    icon: <Heart className="w-6 h-6 text-accent" />,
    title: 'Compliment Mode',
    desc: 'A genuine, touching breakdown of the positive vibes you radiate.',
    colSpan: 'md:col-span-1',
    bg: 'border-accent/10 hover:border-accent/30 bg-accent/2'
  },
  {
    icon: <Share2 className="w-6 h-6 text-primary-light" />,
    title: 'Identity Cards',
    desc: 'Server-rendered high-fidelity graphic cards optimized directly for Instagram & Snapchat stories.',
    colSpan: 'md:col-span-2',
    bg: 'border-primary/10 hover:border-primary/30 bg-primary/2'
  },
]

const STEPS = [
  { num: '01', title: 'Set Up Mirror', desc: 'Define your username, details, and 5 key interests.', icon: <Sparkles className="w-5 h-5 text-primary-light" /> },
  { num: '02', title: 'Share Your Link', desc: 'Post it on Instagram Stories, Snapchat, or WhatsApp.', icon: <Share2 className="w-5 h-5 text-secondary" /> },
  { num: '03', title: 'Collect Answers', desc: 'Friends respond to anonymized perception questions.', icon: <MessageCircle className="w-5 h-5 text-accent" /> },
  { num: '04', title: 'Unlock Insight', desc: 'View your dimensional chart, custom roasts & compliments.', icon: <BarChart3 className="w-5 h-5 text-primary-light" /> },
]

const TESTIMONIALS = [
  {
    quote: "My friends roasted my gaming habits so accurately, but the compliment tab actually made my day. Highly addicting growth loops!",
    author: "Kunal S.",
    archetype: "Maverick ⚡",
    rating: 5,
  },
  {
    quote: "The Instagram Story card generated on the server is so high-quality. We shared it in our group chats and everyone wanted their own.",
    author: "Riya M.",
    archetype: "Visionary 🔮",
    rating: 5,
  },
  {
    quote: "Zero API lags, instant rendering, and beautifully dark-themed screens. This is how social apps should look.",
    author: "Zane L.",
    archetype: "Spark ✨",
    rating: 5,
  },
]

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [mirrorsCount, setMirrorsCount] = useState(142380)
  const [previewTab, setPreviewTab] = useState<'card' | 'roast' | 'compliment'>('card')

  const [particles, setParticles] = useState<{ id: number; left: string; top: string; duration: number }[]>([])

  useEffect(() => {
    const t = setTimeout(() => {
      setMounted(true)
      const generated = Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: 7 + Math.random() * 5,
      }))
      setParticles(generated)
    }, 0)

    const interval = setInterval(() => {
      setMirrorsCount(prev => prev + Math.floor(Math.random() * 3) + 1)
    }, 2000)
    
    return () => {
      clearInterval(interval)
      clearTimeout(t)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background relative overflow-hidden text-text-primary">
      {/* Grid Overlay & Glow Nodes */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-dot-grid opacity-70" />
      <div className="absolute inset-0 z-0 pointer-events-none bg-pastel-gradient opacity-60" />
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[50%] bg-primary/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/80 rounded-full blur-[160px] pointer-events-none opacity-5" />

      {/* Floating Sparkles in Background */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute w-1 h-1 rounded-full bg-primary-light/35"
              style={{
                left: p.left,
                top: p.top,
              }}
              animate={{
                y: [0, -35, 0],
                opacity: [0.1, 0.7, 0.1],
                scale: [0.8, 1.3, 0.8],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Premium Header */}
      <header className="max-w-6xl mx-auto px-6 pt-6 relative z-50">
        <nav className="glass-panel flex items-center justify-between px-6 py-3.5 rounded-2xl border border-white/5 shadow-xl">
          <div className="font-display font-extrabold text-lg flex items-center gap-2">
            <span className="text-xl drop-shadow-[0_0_8px_rgba(124,58,237,0.4)]">🪞</span>
            <span className="text-gradient font-display font-black tracking-tight text-base md:text-lg">Social Mirror</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="hidden sm:inline-block text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
            >
              Admin Dashboard
            </Link>
            <Link 
              href="/create" 
              className="flex items-center gap-1.5 px-4.5 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold text-xs hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-primary/15"
            >
              Create Mirror <Sparkles className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-white/5 text-primary-light font-bold text-xs mb-6.5 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span>Join <strong className="text-white">{mirrorsCount.toLocaleString()}</strong> active social loops</span>
          </div>
          
          <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[1.08] mb-6 text-text-primary">
            Discover how people<br />
            <span className="text-gradient drop-shadow-[0_0_30px_rgba(124,58,237,0.15)]">really see you.</span>
          </h1>
          
          <p className="text-text-secondary text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed font-medium">
            Share your unique perception link. Friends answer anonymous questions about you.
            Unlock a server-generated Social Identity Card, dimensional radar reports, custom compliments, and witty AI roasts.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4.5 max-w-sm mx-auto">
            <Link 
              href="/create" 
              className="flex items-center justify-center gap-2 w-full px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold text-base hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
            >
              Get Started for Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="mt-4 flex items-center justify-center gap-4 text-[11px] font-bold text-text-muted">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-accent" /> 100% Anonymous</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1"><UserCheck className="w-3.5 h-3.5 text-primary-light" /> Instant Setup</span>
          </div>
        </motion.div>

        {/* Dashboard Preview (Interactive) */}
        {mounted && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-20 relative max-w-2xl mx-auto"
          >
            <div className="glass-card p-6 md:p-8 border border-white/5 relative shadow-2xl overflow-hidden text-left">
              <div className="absolute -top-20 -left-20 w-44 h-44 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              
              {/* Header preview */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-lg shadow-md shadow-primary/10 text-white font-display font-bold">
                    🔮
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-display font-black text-text-primary">The Visionary</h3>
                    <p className="text-[11px] text-text-secondary font-semibold">Based on 14 responses from close friends</p>
                  </div>
                </div>
                {/* Tabs inside preview */}
                <div className="flex bg-surface/80 p-1 rounded-xl border border-white/5 gap-1 self-stretch sm:self-auto relative">
                  {(['card', 'roast', 'compliment'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setPreviewTab(tab)}
                      className="relative px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors duration-300 z-10"
                      style={{ color: previewTab === tab ? '#fff' : 'var(--color-text-secondary)' }}
                    >
                      {previewTab === tab && (
                        <motion.div
                          layoutId="previewActiveTab"
                          className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-lg shadow-sm"
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        />
                      )}
                      <span className="relative z-25">{tab}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab views */}
              <div className="min-h-[180px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {previewTab === 'card' && (
                    <motion.div
                      key="card"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-text-primary mb-1.5 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-accent" /> Social Identity Card
                        </h4>
                        <p className="text-xs text-text-secondary mb-4 leading-relaxed font-medium">
                          A high-fidelity visual card summarizing your archetype and top-performing metrics, designed to look stunning on stories.
                        </p>
                        <span className="text-[11px] px-2.5 py-1 bg-surface border border-white/5 rounded-lg font-bold text-text-muted">
                          ⚡ Optimized 9:16 vertical layout
                        </span>
                      </div>
                      
                      {/* Tiny representation of card */}
                      <div className="bg-surface/30 border border-white/5 p-5 rounded-2xl shadow-inner space-y-3.5 text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl" />
                        <div className="text-2xl text-center">🔮</div>
                        <div className="text-sm font-display font-black text-center text-text-primary">The Visionary</div>
                        <div className="space-y-2.5">
                          <div>
                            <div className="flex justify-between text-[9px] font-bold text-text-secondary uppercase mb-1">
                              <span>Creativity</span>
                              <span className="text-primary-light">92%</span>
                            </div>
                            <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                              <div className="w-[92%] h-full bg-gradient-to-r from-primary to-secondary rounded-full" />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[9px] font-bold text-text-secondary uppercase mb-1">
                              <span>Intelligence</span>
                              <span className="text-accent">88%</span>
                            </div>
                            <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                              <div className="w-[88%] h-full bg-accent rounded-full" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {previewTab === 'roast' && (
                    <motion.div
                      key="roast"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-left p-5 bg-secondary/2 border border-secondary/15 rounded-xl relative"
                    >
                      <div className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-secondary text-white text-[9px] font-bold uppercase rounded-full tracking-wider">
                        Roast Preview 🔥
                      </div>
                      <p className="text-xs md:text-sm italic text-secondary font-medium leading-relaxed mt-2.5">
                        &quot;You listed Tech as an interest which tracks — your social skills have the same update frequency as Internet Explorer. Your friends basically confirmed what Stack Overflow already knew.&quot;
                      </p>
                    </motion.div>
                  )}

                  {previewTab === 'compliment' && (
                    <motion.div
                      key="compliment"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-left p-5 bg-accent/2 border border-accent/15 rounded-xl relative"
                    >
                      <div className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-accent text-zinc-900 text-[9px] font-bold uppercase rounded-full tracking-wider">
                        Compliment Preview 💖
                      </div>
                      <p className="text-xs md:text-sm italic text-accent font-medium leading-relaxed mt-2.5">
                        &quot;Your Tech brain means you approach friendships like elegant code — efficient, reliable, and always running. The way you blend technical thinking with genuine Empathy is why people trust you.&quot;
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Bento Grid Features */}
      <section className="max-w-5xl mx-auto px-6 py-20 relative z-10 border-t border-white/3">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-5xl font-black mb-3 text-text-primary">What you get</h2>
          <p className="text-sm md:text-base text-text-secondary font-medium">Fully-custom features engineered for growth loops.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`glass-card p-6 md:p-8 flex flex-col justify-between border ${feature.colSpan} ${feature.bg}`}
            >
              <div>
                <div className="w-11 h-11 bg-surface border border-white/5 rounded-xl flex items-center justify-center mb-5 shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="font-display text-lg md:text-xl font-bold mb-2 text-text-primary">{feature.title}</h3>
                <p className="text-text-secondary leading-relaxed text-xs md:text-sm font-medium">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-20 relative z-10 border-t border-white/3">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-5xl font-black mb-3 text-text-primary">How it works</h2>
          <p className="text-sm md:text-base text-text-secondary font-medium">Simple steps to launch your social mirror.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-6 border border-white/5 relative overflow-hidden group shadow-md"
            >
              <div className="absolute top-0 right-0 p-4 text-5xl font-display font-black text-white/2 group-hover:text-primary-light/5 transition-colors -z-10 select-none">
                {step.num}
              </div>
              <div className="w-10 h-10 bg-surface border border-white/8 text-primary-light rounded-xl flex items-center justify-center mb-5 shadow-sm">
                {step.icon}
              </div>
              <h3 className="font-display text-base font-bold mb-1.5 text-text-primary">{step.title}</h3>
              <p className="text-text-secondary text-xs leading-relaxed font-medium">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="max-w-5xl mx-auto px-6 py-20 relative z-10 border-t border-white/3">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-5xl font-black mb-3 text-text-primary">User Love</h2>
          <p className="text-sm md:text-base text-text-secondary font-medium">See how other people are using Social Mirror.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-6 md:p-7 flex flex-col justify-between border border-white/5 bg-surface/30 shadow-lg"
            >
              <div>
                <div className="flex gap-1 mb-3.5 text-accent">
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-text-secondary text-xs md:text-sm leading-relaxed mb-5 font-medium">
                  &quot;{t.quote}&quot;
                </p>
              </div>
              <div className="flex justify-between items-center pt-3.5 border-t border-white/5">
                <span className="font-bold text-text-primary text-xs">{t.author}</span>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 bg-surface border border-white/5 rounded-full text-text-secondary">
                  {t.archetype}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center relative z-10 border-t border-white/3">
        <h2 className="font-display text-3xl md:text-5xl font-black mb-4 text-text-primary leading-tight">
          Ready to see your <br /><span className="text-gradient drop-shadow-[0_0_30px_rgba(124,58,237,0.2)]">Social Mirror</span>?
        </h2>
        <p className="text-sm md:text-base text-text-secondary mb-8 font-semibold">It takes 30 seconds. No sign-up required.</p>
        <Link 
          href="/create" 
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/25"
        >
          Create Your Mirror <Sparkles className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-text-muted text-xs border-t border-white/3 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
          <span className="text-base">🪞</span>
          <span className="font-bold text-text-primary tracking-wide">Social Mirror</span>
          <span className="hidden sm:inline text-white/5">&bull;</span>
          <span className="text-text-secondary font-medium">Discover how people really see you</span>
        </div>
      </footer>
    </div>
  )
}
