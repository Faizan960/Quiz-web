import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { PlayDeckUI } from '@/components/PlayDeckUI'
import { PublicProfile } from '@/types/quiz'

interface PageProps {
  params: Promise<{ username: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params
  const profile = await getProfile(username)
  
  if (!profile) {
    return {
      title: 'Profile Not Found — Quizly',
    }
  }

  return {
    title: `How do you perceive ${profile.display_name}? 👀 — Quizly`,
    description: `Answer 10 quick anonymous questions about ${profile.display_name} to update their personality radar.`,
  }
}

async function getProfile(username: string): Promise<PublicProfile | null> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('sm_profiles')
      .select('id, username, display_name, interests, archetype, archetype_updated_at, is_suspended, created_at, updated_at')
      .eq('username', username.toLowerCase())
      .single()

    if (error || !data) return null
    if (data.is_suspended) return null

    return data as PublicProfile
  } catch (err) {
    console.error('Failed to get profile:', err)
    return null
  }
}

export default async function PlayPage({ params }: PageProps) {
  const { username } = await params
  const profile = await getProfile(username)

  if (!profile) {
    notFound()
  }

  return (
    <div className="relative min-h-screen bg-canvas overflow-x-hidden flex flex-col justify-between">
      {/* Drifting blobs */}
      <div className="absolute top-[-5%] right-[-5%] w-[300px] h-[300px] rounded-full bg-radial from-purple-100/40 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[320px] h-[320px] rounded-full bg-radial from-pink-100/30 to-transparent blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 w-full px-6 py-5 border-b border-border bg-white/40 backdrop-blur-md flex items-center justify-between">
        <span className="font-display font-extrabold text-xl text-gradient">Quizly✦</span>
        <span className="text-xs font-bold text-text-muted bg-surface px-3 py-1 rounded-pill border border-border">
          Anonymous Friend Q&A
        </span>
      </header>

      {/* Main Questionnaire */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <PlayDeckUI profile={profile} />
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-border bg-white/20 text-center text-xs text-text-muted relative z-10">
        Quizly✦ Q&A Questionnaire · Strictly Anonymous
      </footer>
    </div>
  )
}
