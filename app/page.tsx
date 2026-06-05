'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Brain, Flame, Heart, Share2, MessageCircle, BarChart3, ArrowRight, CheckCircle2, Star, ShieldCheck, UserCheck } from 'lucide-react'
import { TiltCard } from '@/components/TiltCard'

const FEATURES = [
  {
    icon: <Brain className="w-6 h-6 text-text-primary" />,
    title: 'Perception Mirror',
    desc: 'Aggregates anonymous feedback from friends into a precise reflection of your personality archetype.',
    colSpan: 'md:col-span-2',
    bg: 'border-border hover:border-primary/30 bg-surface'
  },
  {
    icon: <Flame className="w-6 h-6 text-text-primary" />,
    title: 'Roast Mode',
    desc: 'A brutally accurate, humor-packed roast woven from your specific interest profile.',
    colSpan: 'md:col-span-1',
    bg: 'border-border hover:border-secondary/30 bg-surface'
  },
  {
    icon: <Heart className="w-6 h-6 text-text-primary" />,
    title: 'Compliment Mode',
    desc: 'A genuine, touching breakdown of the positive vibes you radiate.',
    colSpan: 'md:col-span-1',
    bg: 'border-border hover:border-accent/30 bg-surface'
  },
  {
    icon: <Share2 className="w-6 h-6 text-text-primary" />,
    title: 'Identity Cards',
    desc: 'Server-rendered high-fidelity graphic cards optimized directly for Instagram & Snapchat stories.',
    colSpan: 'md:col-span-2',
    bg: 'border-border hover:border-primary/30 bg-surface'
  },
]

const STEPS = [
  { num: '01', title: 'Set Up Mirror', desc: 'Define your username, details, and 5 key interests.', icon: <Sparkles className="w-5 h-5 text-text-primary" /> },
  { num: '02', title: 'Share Your Link', desc: 'Post it on Instagram Stories, Snapchat, or WhatsApp.', icon: <Share2 className="w-5 h-5 text-text-primary" /> },
  { num: '03', title: 'Collect Answers', desc: 'Friends respond to anonymized perception questions.', icon: <MessageCircle className="w-5 h-5 text-text-primary" /> },
  { num: '04', title: 'Unlock Insight', desc: 'View your dimensional chart, custom roasts & compliments.', icon: <BarChart3 className="w-5 h-5 text-text-primary" /> },
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
    quote: "Zero API lags, instant rendering, and beautifully designed screens. This is how social apps should look.",
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
      <div className="absolute inset-0 z-0 pointer-events-none bg-dot-grid opacity-90" />
      <div className="absolute inset-0 z-0 pointer-events-none bg-pastel-gradient opacity-90" />
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[50%] bg-primary/5 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[160px] pointer-events-none opacity-40" />

      {/* Floating Sparkles in Background */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute w-1.5 h-1.5 rounded-full bg-primary/10"
              style={{
                left: p.left,
                top: p.top,
              }}
              animate={{
                y: [0, -35, 0],
                opacity: [0.2, 0.8, 0.2],
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
        <nav className="glass-panel flex items-center justify-between px-6 py-4 rounded-2xl border border-border shadow-sm">
          <div className="font-display font-extrabold text-lg flex items-center gap-2">
            <span className="text-xl">🪞</span>
            <span className="font-display font-black tracking-tight text-base md:text-lg text-text-primary">Social Mirror</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="hidden sm:inline-block text-xs font-bold text-text-secondary hover:text-text-primary transition-colors"
            >
              Admin Dashboard
            </Link>
            <Link 
              href="/create" 
              className="flex items-center gap-1.5 px-5 py-2.5 btn-premium-solid rounded-xl font-bold text-xs"
            >
              Create Mirror <Sparkles className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-12 md:pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center text-left">
          
          {/* Left Column: Heading & CTA */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-border text-primary font-bold text-xs shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              <span>Join <strong className="text-text-primary">{mirrorsCount.toLocaleString()}</strong> active social loops</span>
            </div>
            
            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tighter leading-[1.02] text-text-primary">
              Discover how <br className="hidden sm:inline" />
              people <span className="font-serif-editorial italic text-primary font-normal drop-shadow-[0_0_30px_rgba(124,58,237,0.08)]">really</span> see you.
            </h1>
            
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed font-semibold max-w-lg">
              Share your unique perception link. Friends answer anonymous questions about you.
              Unlock a server-generated Social Identity Card, dimensional radar reports, custom compliments, and witty AI roasts.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 max-w-md">
              <Link 
                href="/create" 
                className="flex items-center justify-center gap-2 w-full px-8 py-4 btn-premium-solid rounded-xl font-bold text-base"
              >
                Get Started for Free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-bold text-text-muted">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-accent" /> 100% Anonymous</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1"><UserCheck className="w-3.5 h-3.5 text-primary" /> Instant Setup</span>
            </div>
          </motion.div>

          {/* Right Column: Dashboard Preview (Interactive Dribbble / Awwwards App Frame) */}
          <div className="lg:col-span-6 flex justify-center w-full">
            {mounted && (
              <TiltCard
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                tiltMax={6}
                borderRadius={32}
                accentColor="rgba(9, 9, 11, 0.15)"
                className="relative w-full max-w-md z-10"
              >
                {/* Aesthetic Shadow Ring */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-[32px] blur-2xl -z-10" />
                
                <div className="glass-card p-6 md:p-8 border border-border relative shadow-xl overflow-hidden text-left bg-surface/90 h-full">
                  <div className="absolute -top-20 -left-20 w-44 h-44 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                  
                  {/* Header preview */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-text-primary border border-text-primary flex items-center justify-center text-lg shadow-[2px_2px_0px_0px_rgba(9,9,11,1)] text-white font-display font-bold">
                        🔮
                      </div>
                      <div>
                        <h3 className="text-sm font-display font-black text-text-primary">The Visionary</h3>
                        <p className="text-[11px] text-text-secondary font-semibold font-mono">Based on 14 responses</p>
                      </div>
                    </div>
                    {/* Tabs inside preview */}
                    <div className="flex bg-background/85 p-1 rounded-xl border border-border gap-1 self-stretch sm:self-auto relative">
                      {(['card', 'roast', 'compliment'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setPreviewTab(tab)}
                          className="relative px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors duration-300 z-10 cursor-pointer"
                          style={{ color: previewTab === tab ? '#fff' : 'var(--color-text-secondary)' }}
                        >
                          {previewTab === tab && (
                            <motion.div
                              layoutId="previewActiveTab"
                              className="absolute inset-0 bg-text-primary rounded-lg shadow-sm"
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
                            <h4 className="text-sm font-bold text-text-primary mb-1.5 flex items-center gap-1.5 font-display">
                              <CheckCircle2 className="w-4 h-4 text-accent" /> Identity Card
                            </h4>
                            <p className="text-xs text-text-secondary mb-4 leading-relaxed font-semibold">
                              A custom visual card summarizing your top-performing metrics, designed to look stunning on stories.
                            </p>
                            <span className="text-[10px] px-2.5 py-1 bg-background border border-border rounded-lg font-bold text-text-secondary font-mono">
                              ⚡ 9:16 vertical layout
                            </span>
                          </div>
                          
                          {/* Tiny representation of card */}
                          <div className="bg-background border border-border p-5 rounded-2xl shadow-inner space-y-3.5 text-left relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl" />
                            <div className="text-2xl text-center">🔮</div>
                            <div className="text-sm font-display font-black text-center text-text-primary">The Visionary</div>
                            <div className="space-y-2.5">
                              <div>
                                <div className="flex justify-between text-[9px] font-bold text-text-secondary uppercase mb-1">
                                  <span>Creativity</span>
                                  <span className="text-primary font-mono">92%</span>
                                </div>
                                <div className="w-full h-1.5 bg-zinc-200/60 rounded-full overflow-hidden">
                                  <div className="w-[92%] h-full bg-text-primary rounded-full" />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-[9px] font-bold text-text-secondary uppercase mb-1">
                                  <span>Intelligence</span>
                                  <span className="text-accent font-mono">88%</span>
                                </div>
                                <div className="w-full h-1.5 bg-zinc-200/60 rounded-full overflow-hidden">
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
                          className="text-left p-5 bg-background border border-border rounded-2xl relative shadow-sm"
                        >
                          <div className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-text-primary text-white text-[9px] font-bold uppercase rounded-full tracking-wider font-mono">
                            Roast 🔥
                          </div>
                          <p className="text-xs italic text-text-primary font-semibold leading-relaxed mt-2.5 font-serif-editorial">
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
                          className="text-left p-5 bg-background border border-border rounded-2xl relative shadow-sm"
                        >
                          <div className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-text-primary text-white text-[9px] font-bold uppercase rounded-full tracking-wider font-mono">
                            Compliment 💖
                          </div>
                          <p className="text-xs italic text-text-primary font-semibold leading-relaxed mt-2.5 font-serif-editorial">
                            &quot;Your Tech brain means you approach friendships like elegant code — efficient, reliable, and always running. The way you blend technical thinking with genuine Empathy is why people trust you.&quot;
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </TiltCard>
            )}
          </div>
        </div>
      </main>

      {/* Bento Grid Features */}
      <section className="max-w-5xl mx-auto px-6 py-24 relative z-10 border-t border-border">
        <div className="text-left mb-16 max-w-xl">
          <h2 className="font-display text-3xl md:text-5xl font-black mb-4 tracking-tighter text-text-primary">
            What you get
          </h2>
          <p className="text-sm md:text-base text-text-secondary font-semibold">
            Bespoke features engineered to reveal your social reflection in high fidelity.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => {
            return (
              <TiltCard
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                accentColor="rgba(9, 9, 11, 0.15)"
                borderRadius={24}
                className={feature.colSpan}
              >
                <div className="glass-card p-6 md:p-8 flex flex-col justify-between h-full border border-border bg-surface hover:card-offset hover:border-text-primary transition-all duration-300">
                  <div>
                    <div className="w-11 h-11 bg-background border-2 border-text-primary rounded-xl flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(9,9,11,1)]">
                      {feature.icon}
                    </div>
                    <h3 className="font-display text-lg md:text-xl font-bold mb-2.5 text-text-primary">{feature.title}</h3>
                    <p className="text-text-secondary leading-relaxed text-xs md:text-sm font-semibold">{feature.desc}</p>
                  </div>
                </div>
              </TiltCard>
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-24 relative z-10 border-t border-border">
        <div className="text-left mb-16 max-w-xl">
          <h2 className="font-display text-3xl md:text-5xl font-black mb-4 tracking-tighter text-text-primary">
            How it works
          </h2>
          <p className="text-sm md:text-base text-text-secondary font-semibold">
            Simple, seamless steps to launch your social mirror.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <TiltCard
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              accentColor="rgba(9, 9, 11, 0.1)"
              borderRadius={24}
            >
              <div className="glass-card p-6 border border-border relative overflow-hidden group shadow-sm bg-surface h-full hover:border-text-primary transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 text-5xl font-display font-black text-text-primary/[0.02] group-hover:text-primary/[0.04] transition-colors -z-10 select-none font-mono">
                  {step.num}
                </div>
                <div className="w-10 h-10 bg-background border-2 border-text-primary text-text-primary rounded-xl flex items-center justify-center mb-5 shadow-[2px_2px_0px_0px_rgba(9,9,11,1)]">
                  {step.icon}
                </div>
                <h3 className="font-display text-base font-bold mb-1.5 text-text-primary">{step.title}</h3>
                <p className="text-text-secondary text-xs leading-relaxed font-semibold">{step.desc}</p>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="max-w-5xl mx-auto px-6 py-24 relative z-10 border-t border-border">
        <div className="text-left mb-16 max-w-xl">
          <h2 className="font-display text-3xl md:text-5xl font-black mb-4 tracking-tighter text-text-primary">
            User Love
          </h2>
          <p className="text-sm md:text-base text-text-secondary font-semibold">
            Real feedback from creators who looked in the mirror.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <TiltCard
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              accentColor="rgba(9, 9, 11, 0.1)"
              borderRadius={24}
              className="h-full"
            >
              <div className="glass-card p-6 md:p-8 flex flex-col justify-between h-full border border-border bg-surface/80 hover:border-text-primary transition-all duration-300">
                <div>
                  <div className="flex gap-1 mb-4 text-text-primary">
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-text-primary text-sm leading-relaxed mb-6 font-serif-editorial italic font-normal">
                    &quot;{t.quote}&quot;
                  </p>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <span className="font-bold text-text-primary text-xs">{t.author}</span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 bg-background border border-border rounded-full text-text-secondary font-mono">
                    {t.archetype}
                  </span>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="max-w-3xl mx-auto px-6 py-28 text-center relative z-10 border-t border-border">
        <h2 className="font-display text-3xl md:text-5xl font-black mb-4 text-text-primary leading-tight tracking-tighter">
          Ready to see your <br />
          <span className="font-serif-editorial italic font-normal text-primary">Social Mirror</span>?
        </h2>
        <p className="text-sm md:text-base text-text-secondary mb-8 font-semibold">It takes 30 seconds. No sign-up required.</p>
        <Link 
          href="/create" 
          className="inline-flex items-center justify-center gap-2 px-8 py-4 btn-premium-solid rounded-xl font-bold"
        >
          Create Your Mirror <Sparkles className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-text-muted text-xs border-t border-border relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
          <span className="text-base">🪞</span>
          <span className="font-bold text-text-primary tracking-wide">Social Mirror</span>
          <span className="hidden sm:inline text-zinc-350">&bull;</span>
          <span className="text-text-secondary font-bold">Discover how people really see you</span>
        </div>
      </footer>
    </div>
  )
}

