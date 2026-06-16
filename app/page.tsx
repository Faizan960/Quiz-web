import { createAdminClient } from '@/lib/supabase/server'
import { LandingUI } from '@/components/LandingUI'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let triviaList: {
    id: string
    slug: string
    title: string
    category: string
    play_count: number
  }[] = []

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('sm_trivia')
      .select('id, slug, title, category, play_count')
      .eq('is_banned', false)
      .order('play_count', { ascending: false })
      .limit(6)

    if (!error && data) {
      triviaList = data
    }
  } catch (err) {
    console.error('Failed to fetch trivia on homepage:', err)
  }

  return (
    <LandingUI initialTrivia={triviaList} />
  )
}
