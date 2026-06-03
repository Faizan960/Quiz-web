'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Brain, Flame, Heart, Share2, MessageCircle, BarChart3, ArrowRight, CheckCircle2, Star } from 'lucide-react'

const FEATURES = [
  {
    icon: <Brain className="w-8 h-8 text-primary-light" />,
    title: 'Perception Mirror',
    desc: 'Aggregates anonymous feedback from friends into a precise reflection of your personality archetype.',
    colSpan: 'md:col-span-2',
    bg: 'bg-primary/5 border-primary/20'
  },
  {
    icon: <Flame className="w-8 h-8 text-secondary" />,
    title: 'Roast Mode',
    desc: 'An brutally accurate, humor-packed roast woven from your specific interest profile.',
    colSpan: 'md:col-span-1',
    bg: 'bg-secondary/5 border-secondary/20'
  },
  {
    icon: <Heart className="w-8 h-8 text-accent" />,
    title: 'Compliment Mode',
    desc: 'A genuine, touching breakdown of the positive vibes you radiate.',
    colSpan: 'md:col-span-1',
    bg: 'bg-accent/5 border-accent/20'
  },
  {
    icon: <Share2 className="w-8 h-8 text-primary-light" />,
    title: 'Identity Cards',
    desc: 'Server-rendered high-fidelity graphic cards optimized directly for Instagram & Snapchat stories.',
    colSpan: 'md:col-span-2',
    bg: 'bg-primary/5 border-primary/20'
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

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setMirrorsCount(prev => prev + Math.floor(Math.random() * 3) + 1)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background relative overflow-hidden text-text-primary">
      {/* Background Radial Glow Nodes */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-pastel-gradient opacity-80" />
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[70%] bg-secondary/80 rounded-full blur-[180px] pointer-events-none opacity-10" />
      <div className="absolute bottom-[-10%] left-[20%] w-[70%] h-[50%] bg-accent/10 rounded-full blur-[150px] pointer-events-none animate-pulse-glow" />

      {/* Floating Sparkles in Background */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-primary-light/40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0.1, 0.8, 0.1],
                scale: [0.8, 1.4, 0.8],
              }}
              transition={{
                duration: 8 + Math.random() * 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Premium Glass Header */}
      <nav className="glass-panel sticky top-4 z-50 flex items-center justify-between px-6 py-4 md:px-12 mx-4 rounded-3xl border border-white/5 shadow-2xl">
        <div className="font-display font-extrabold text-xl flex items-center gap-2">
          <span className="text-2xl drop-shadow-[0_0_10px_rgba(157,78,221,0.5)]">🪞</span>
          <span className="text-gradient font-display font-black tracking-tight">Social Mirror</span>
        </div>
        <Link 
          href="/create" 
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold text-sm hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
        >
          Create Mirror <Sparkles className="w-4 h-4" />
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-surface/50 border border-white/5 text-primary-light font-bold text-xs md:text-sm mb-8 shadow-2xl">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
            </span>
            Join {mirrorsCount.toLocaleString()}+ active mirrors online right now
          </div>
          
          <h1 className="font-display font-black text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[1.05] mb-8 text-text-primary">
            Discover how people<br />
            <span className="text-gradient drop-shadow-[0_0_40px_rgba(157,78,221,0.2)]">really see you.</span>
          </h1>
          
          <p className="text-text-secondary text-base md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            Share your unique perception link. Friends answer anonymous questions about you.
            Unlock a server-generated Social Identity Card, dimensional radar reports, custom compliments, and witty roasts.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/create" 
              className="flex items-center justify-center gap-2 px-10 py-5 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-extrabold text-lg hover:opacity-95 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30 w-full sm:w-auto"
            >
              Get Started for Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="mt-5 text-xs font-bold text-text-muted">
            ⚡ Totally free &bull; Instant setup &bull; No cookies required
          </div>
        </motion.div>

        {/* Dashboard Preview (Interactive) */}
        {mounted && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-24 relative max-w-2xl mx-auto"
          >
            <div className="glass-card p-6 md:p-8 border border-white/5 relative shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden">
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              
              {/* Header preview */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl shadow-lg shadow-primary/20 text-white font-display font-bold">
                    🔮
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-display font-black text-text-primary">The Visionary</h3>
                    <p className="text-xs text-text-secondary font-semibold">Based on 14 responses from close friends</p>
                  </div>
                </div>
                {/* Tabs inside preview */}
                <div className="flex bg-surface p-1 rounded-xl border border-white/5 gap-1 self-stretch sm:self-auto">
                  {(['card', 'roast', 'compliment'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setPreviewTab(tab)}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                        previewTab === tab ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md' : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab views */}
              <div className="min-h-[220px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {previewTab === 'card' && (
                    <motion.div
                      key="card"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
                    >
                      <div className="text-left">
                        <h4 className="text-base font-bold text-text-primary mb-2">Social Identity Card</h4>
                        <p className="text-xs md:text-sm text-text-secondary mb-4 leading-relaxed">
                          A high-fidelity server-side rendered visual card summarizing your archetype and top-performing metrics, designed to look stunning on stories.
                        </p>
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent">
                          <CheckCircle2 className="w-4 h-4" /> Optimized 9:16 vertical layouts ready
                        </div>
                      </div>
                      
                      {/* Tiny representation of card */}
                      <div className="bg-surface/50 border border-white/5 p-6 rounded-2xl shadow-inner space-y-4 text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                        <div className="text-3xl text-center">🔮</div>
                        <div className="text-base font-display font-black text-center text-text-primary">The Visionary</div>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-[10px] font-bold text-text-secondary uppercase mb-1">
                              <span>Creativity</span>
                              <span className="text-primary-light">92%</span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                              <div className="w-[92%] h-full bg-gradient-to-r from-primary to-secondary rounded-full" />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] font-bold text-text-secondary uppercase mb-1">
                              <span>Intelligence</span>
                              <span className="text-accent">88%</span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
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
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="text-left p-6 bg-secondary/5 border border-secondary/20 rounded-2xl relative"
                    >
                      <div className="absolute -top-3 left-6 px-3 py-1 bg-secondary text-white text-[10px] font-bold uppercase rounded-full tracking-wider">
                        Roast Preview 🔥
                      </div>
                      <p className="text-sm md:text-base italic text-secondary font-medium leading-relaxed mt-2">
                        &quot;You listed Tech as an interest which tracks — your social skills have the same update frequency as Internet Explorer. Your friends basically confirmed what Stack Overflow already knew.&quot;
                      </p>
                    </motion.div>
                  )}

                  {previewTab === 'compliment' && (
                    <motion.div
                      key="compliment"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="text-left p-6 bg-accent/5 border border-accent/20 rounded-2xl relative"
                    >
                      <div className="absolute -top-3 left-6 px-3 py-1 bg-accent text-zinc-900 text-[10px] font-bold uppercase rounded-full tracking-wider">
                        Compliment Preview 💖
                      </div>
                      <p className="text-sm md:text-base italic text-accent font-medium leading-relaxed mt-2">
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
      <section className="max-w-6xl mx-auto px-6 py-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-6xl font-black mb-4 text-text-primary">What you get</h2>
          <p className="text-lg text-text-secondary">Fully-custom features engineered for growth.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card p-8 flex flex-col justify-between border ${feature.bg}`}
            >
              <div>
                <div className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center border border-white/10 shadow-lg mb-6">
                  {feature.icon}
                </div>
                <h3 className="font-display text-2xl font-bold mb-3 text-text-primary">{feature.title}</h3>
                <p className="text-text-secondary leading-relaxed text-sm md:text-base">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-6xl font-black mb-4 text-text-primary">How it works</h2>
          <p className="text-lg text-text-secondary font-medium">Simple steps to launch your social loops.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 border border-white/5 relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute top-0 right-0 p-6 text-6xl font-display font-black text-white/2 group-hover:text-primary-light/5 transition-colors -z-10 select-none">
                {step.num}
              </div>
              <div className="w-12 h-12 bg-surface border border-white/10 text-primary-light rounded-xl flex items-center justify-center mb-6 shadow-md">
                {step.icon}
              </div>
              <h3 className="font-display text-lg font-bold mb-2 text-text-primary">{step.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="max-w-6xl mx-auto px-6 py-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-6xl font-black mb-4 text-text-primary">User Love</h2>
          <p className="text-lg text-text-secondary font-medium">See how other people are using Social Mirror.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 md:p-8 flex flex-col justify-between border border-white/5 bg-surface/30 shadow-2xl"
            >
              <div>
                <div className="flex gap-1 mb-4 text-accent">
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-text-secondary text-sm md:text-base leading-relaxed mb-6 font-medium">
                  &quot;{t.quote}&quot;
                </p>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <span className="font-bold text-text-primary text-sm">{t.author}</span>
                <span className="text-xs font-semibold px-3 py-1 bg-surface border border-white/5 rounded-full text-text-secondary">
                  {t.archetype}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="max-w-4xl mx-auto px-6 py-32 text-center relative z-10">
        <h2 className="font-display text-4xl md:text-6xl font-black mb-6 text-text-primary leading-tight">
          Ready to see your <br /><span className="text-gradient drop-shadow-[0_0_30px_rgba(157,78,221,0.3)]">Social Mirror</span>?
        </h2>
        <p className="text-lg md:text-xl text-text-secondary mb-10 font-semibold">It takes 30 seconds. No sign-up required.</p>
        <Link 
          href="/create" 
          className="inline-flex items-center justify-center gap-2.5 px-10 py-5 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-extrabold text-lg hover:opacity-95 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30"
        >
          Create Your Mirror <Sparkles className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-text-muted text-sm border-t border-white/5 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <span className="text-lg">🪞</span>
          <span className="font-bold text-text-primary tracking-wide">Social Mirror</span>
          <span className="hidden sm:inline text-white/10">&bull;</span>
          <span className="text-text-secondary font-medium">Discover how people really see you</span>
        </div>
      </footer>
    </div>
  )
}
