'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, Brain, Flame, Heart, Share2, MessageCircle, BarChart3, ArrowRight } from 'lucide-react'

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

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* ── Background Blobs ───────────────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-pastel-gradient opacity-60" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-accent/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />

      {/* ── Navbar ──────────────────────────────── */}
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

      {/* ── Hero ───────────────────────────────── */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm mb-8">
            <Sparkles className="w-4 h-4" /> AI-powered social insights
          </div>
          
          <h1 className="font-display font-extrabold text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[1.1] mb-8 text-text-primary">
            Discover how people<br />
            <span className="text-gradient">really see you.</span>
          </h1>
          
          <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Share a link. Friends answer questions about you anonymously.
            Get AI-powered personality insights, roasts, compliments, and a shareable Social Identity Card.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/create" 
              className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold text-lg hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-2xl hover:shadow-primary/40 shadow-primary/30 w-full sm:w-auto"
            >
              Get Started for Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>

        {/* ── Dashboard Preview (Glassmorphic) ── */}
        {mounted && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-24 relative max-w-4xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none rounded-3xl" />
            <div className="glass-card p-6 md:p-8 animate-float relative">
              <div className="absolute inset-0 rounded-[24px] pointer-events-none animate-pulse-glow opacity-50" />
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-3xl shadow-lg text-white font-display font-bold">
                  S
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-display font-bold text-text-primary">The Visionary 🔮</h3>
                  <p className="text-text-secondary">Based on 14 responses from friends</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Leadership', val: 92, color: 'bg-indigo-500' },
                  { label: 'Creativity', val: 88, color: 'bg-pink-500' },
                  { label: 'Empathy', val: 90, color: 'bg-emerald-500' },
                  { label: 'Ambition', val: 85, color: 'bg-orange-500' }
                ].map((s, i) => (
                  <div key={i} className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                    <div className="text-sm font-medium text-text-secondary mb-2">{s.label}</div>
                    <div className="text-2xl font-bold text-text-primary mb-3">{s.val}%</div>
                    <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${s.val}%` }}
                        transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                        className={`h-full ${s.color} rounded-full`} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* ── Bento Grid Features ──────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-extrabold mb-4 text-text-primary">What you get</h2>
          <p className="text-lg text-text-secondary">Way more than just a quiz.</p>
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
                <p className="text-text-secondary leading-relaxed text-lg">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24 relative z-10">
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

      {/* ── Footer CTA ───────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-32 text-center relative z-10">
        <h2 className="font-display text-4xl md:text-6xl font-extrabold mb-6 text-text-primary">
          Ready to see your <span className="text-gradient">Social Mirror</span>?
        </h2>
        <p className="text-xl text-text-secondary mb-10">It takes 30 seconds. No sign-up required.</p>
        <Link 
          href="/create" 
          className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold text-lg hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-2xl hover:shadow-primary/40 shadow-primary/20"
        >
          Create Your Mirror <Sparkles className="w-5 h-5" />
        </Link>
      </section>

      {/* ── Footer ───────────────────────────── */}
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
