import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { ReportDashboardUI } from '@/components/ReportDashboardUI'
import { PublicProfile } from '@/types/quiz'

interface PageProps {
  params: Promise<{ username: string }>
  searchParams: Promise<{ token?: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  return {
    title: `${username.charAt(0).toUpperCase() + username.slice(1)}'s Personality Radar — Quizly`,
    description: `Unlock and view ${username}'s personality report on Quizly.`,
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

export default async function ReportPage({ params, searchParams }: PageProps) {
  const { username } = await params
  const { token } = await searchParams
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
          Radar Report Dashboard
        </span>
      </header>

      {/* Main Dashboard Panel */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <ReportDashboardUI profile={profile} initialToken={token} />
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-border bg-white/20 text-center text-xs text-text-muted relative z-10">
        Quizly✦ Dashboard · Secure PIN Protection
      </footer>
    </div>
  )
}
