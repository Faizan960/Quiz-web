'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Brain, Flame, Heart, Share2, MessageCircle, BarChart3, ArrowRight, CheckCircle2, User, Star } from 'lucide-react'

const FEATURES = [
  {
    icon: <Brain className="w-8 h-8 text-primary" />,
    title: 'AI Social Report',
    desc: 'Deep analysis of your strengths, weaknesses, hidden talents, and a friend impression.',
    colSpan: 'md:col-span-2',
    bg: 'bg-indigo-50/50'
  },
  {
    icon: <Flame className="w-8 h-8 text-orange-500" />,
    title: 'Roast Mode',
    desc: 'A brutally funny roast based on what your friends really think.',
    colSpan: 'md:col-span-1',
    bg: 'bg-orange-50/50'
  },
  {
    icon: <Heart className="w-8 h-8 text-pink-500" />,
    title: 'Compliment Mode',
    desc: 'A heartfelt breakdown of why your friends think you are amazing.',
    colSpan: 'md:col-span-1',
    bg: 'bg-pink-50/50'
  },
  {
    icon: <Share2 className="w-8 h-8 text-emerald-500" />,
    title: 'Social Identity Card',
    desc: 'A shareable card with your social archetype and top scores.',
    colSpan: 'md:col-span-2',
    bg: 'bg-emerald-50/50'
  },
]

const STEPS = [
  { num: '01', title: 'Create Your Mirror', desc: 'Set up your profile with your name, bio, and interests.', icon: <Sparkles className="w-5 h-5" /> },
  { num: '02', title: 'Share Your Link', desc: 'Send your unique link to friends on WhatsApp, Instagram, etc.', icon: <Share2 className="w-5 h-5" /> },
  { num: '03', title: 'Friends Answer', desc: 'Friends answer perception questions about you anonymously.', icon: <MessageCircle className="w-5 h-5" /> },
  { num: '04', title: 'Get Your Report', desc: 'Unlock your AI-powered social insight report and card.', icon: <BarChart3 className="w-5 h-5" /> },
]

const TESTIMONIALS = [
  {
    quote: "I got roasted so hard by my friends but the compliment part made me tear up. This is so accurate!",
    author: "Sarah K.",
    archetype: "Maverick ⚡",
    rating: 5,
  },
  {
    quote: "My archetype was The Visionary and my friends rated my creativity at 95%. Insanely cool graphic to share!",
    author: "David L.",
    archetype: "Visionary 🔮",
    rating: 5,
  },
  {
    quote: "We did this in our group chat and it's all we talked about for three days. Absolutely viral!",
    author: "Aisha M.",
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-pastel-gradient opacity-60" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-accent/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />

      {/* Floating Particles */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.7, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 6 + Math.random() * 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Navbar */}
      <nav className="glass-panel sticky top-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 mx-4 mt-4 rounded-3xl">
        <div className="font-display font-extrabold text-xl flex items-center gap-2">
          <span className="text-2xl">🪞</span>
          <span className="text-gradient tracking-tight">Social Mirror</span>
        </div>
        <Link 
          href="/create" 
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-full font-medium text-sm hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-900/20"
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs md:text-sm mb-8 shadow-sm">
            <Sparkles className="w-4 h-4" /> Join {mirrorsCount.toLocaleString()}+ active mirrors created today
          </div>
          
          <h1 className="font-display font-extrabold text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[1.1] mb-8 text-text-primary">
            Discover how people<br />
            <span className="text-gradient animate-pulse-glow">really see you.</span>
          </h1>
          
          <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Share a link. Friends answer questions about you anonymously.
            Get custom AI personality insights, roasts, compliments, and a shareable Social Identity Card.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/create" 
              className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold text-lg hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-2xl hover:shadow-primary/40 shadow-primary/30 w-full sm:w-auto"
            >
              Get Started for Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="mt-4 text-xs font-semibold text-text-muted">
            ⚡ Join {mirrorsCount.toLocaleString()}+ people who discovered their true self
          </div>
        </motion.div>

        {/* Dashboard Preview (Interactive) */}
        {mounted && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative max-w-2xl mx-auto"
          >
            <div className="glass-card p-6 md:p-8 relative">
              {/* Header preview */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-xl shadow-lg text-white font-display font-bold">
                    🔮
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-display font-bold text-text-primary">The Visionary</h3>
                    <p className="text-xs text-text-secondary">Based on 14 response entries</p>
                  </div>
                </div>
                {/* Tabs inside preview */}
                <div className="flex bg-zinc-100/80 p-1 rounded-xl gap-1">
                  {(['card', 'roast', 'compliment'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setPreviewTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                        previewTab === tab ? 'bg-white text-zinc-900 shadow-sm' : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab views */}
              <div className="min-h-[220px] flex flex-col justify-center">
                {previewTab === 'card' && (
                  <motion.div
                    key="card"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
                  >
                    <div className="text-left">
                      <h4 className="text-sm font-bold text-text-primary mb-2">Social Identity Card</h4>
                      <p className="text-xs text-text-secondary mb-4">
                        A gorgeous generated graphic containing your calculated dimensions, customized per user!
                      </p>
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
                        <CheckCircle2 className="w-4 h-4" /> Ready for Instagram Story
                      </div>
                    </div>
                    {/* Tiny representation of card */}
                    <div className="bg-gradient-to-b from-white to-zinc-50 border border-zinc-100 p-5 rounded-2xl shadow-inner space-y-3">
                      <div className="text-3xl text-center">🔮</div>
                      <div className="text-sm font-bold text-center text-text-primary">The Visionary</div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-text-muted">
                          <span>Creativity</span>
                          <span>92%</span>
                        </div>
                        <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
                          <div className="w-[92%] h-full bg-pink-500 rounded-full" />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-text-muted">
                          <span>Intelligence</span>
                          <span>88%</span>
                        </div>
                        <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
                          <div className="w-[88%] h-full bg-indigo-500 rounded-full" />
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
                    className="text-center p-4 bg-orange-50/50 border border-orange-100/50 rounded-2xl"
                  >
                    <div className="text-2xl mb-2">🔥</div>
                    <p className="text-sm md:text-base italic text-orange-950 font-semibold leading-relaxed">
                      &quot;You listed Tech as an interest which tracks — your social skills have the same update frequency as Internet Explorer. Your friends basically confirmed what Stack Overflow already knew.&quot;
                    </p>
                  </motion.div>
                )}

                {previewTab === 'compliment' && (
                  <motion.div
                    key="compliment"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center p-4 bg-pink-50/50 border border-pink-100/50 rounded-2xl"
                  >
                    <div className="text-2xl mb-2">💖</div>
                    <p className="text-sm md:text-base italic text-pink-950 font-semibold leading-relaxed">
                      &quot;Your Tech brain means you approach friendships like elegant code — efficient, reliable, and always running. The way you blend technical thinking with genuine Empathy is why people trust you.&quot;
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Bento Grid Features */}
      <section className="max-w-6xl mx-auto px-6 py-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-extrabold mb-4 text-text-primary">What you get</h2>
          <p className="text-lg text-text-secondary">Way more than just a simple quiz.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card p-8 flex flex-col justify-between ${feature.colSpan} ${feature.bg}`}
            >
              <div>
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6">
                  {feature.icon}
                </div>
                <h3 className="font-display text-2xl font-bold mb-3 text-text-primary">{feature.title}</h3>
                <p className="text-text-secondary leading-relaxed text-base md:text-lg">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-extrabold mb-4 text-text-primary">How it works</h2>
          <p className="text-lg text-text-secondary">Four steps to discover your social identity.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow"
            >
              <div className="absolute top-0 right-0 p-6 text-6xl font-display font-extrabold text-zinc-50 group-hover:text-primary/5 transition-colors -z-10">
                {step.num}
              </div>
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                {step.icon}
              </div>
              <h3 className="font-display text-xl font-bold mb-2 text-text-primary">{step.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-extrabold mb-4 text-text-primary">User Love</h2>
          <p className="text-lg text-text-secondary">See how other people are using Social Mirror.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 md:p-8 flex flex-col justify-between bg-white"
            >
              <div>
                <div className="flex gap-1 mb-4 text-yellow-400">
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-text-secondary text-sm md:text-base leading-relaxed mb-6 font-medium">
                  &quot;{t.quote}&quot;
                </p>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-zinc-100">
                <span className="font-bold text-text-primary text-sm">{t.author}</span>
                <span className="text-xs font-semibold px-2.5 py-1 bg-zinc-100 rounded-full text-zinc-600">
                  {t.archetype}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="max-w-4xl mx-auto px-6 py-32 text-center relative z-10">
        <h2 className="font-display text-4xl md:text-6xl font-extrabold mb-6 text-text-primary">
          Ready to see your <span className="text-gradient">Social Mirror</span>?
        </h2>
        <p className="text-xl text-text-secondary mb-10 font-semibold">It takes 30 seconds. No sign-up required.</p>
        <Link 
          href="/create" 
          className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold text-lg hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-2xl hover:shadow-primary/40 shadow-primary/20"
        >
          Create Your Mirror <Sparkles className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-text-muted text-sm border-t border-zinc-100 relative z-10 bg-white">
        <div className="flex items-center justify-center gap-2">
          <span>🪞</span>
          <span className="font-medium text-text-secondary">Social Mirror</span>
          <span>&middot;</span>
          <span>Discover how people really see you</span>
        </div>
      </footer>
    </div>
  )
}
