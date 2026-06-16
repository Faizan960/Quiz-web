import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { QuizUI } from '@/components/QuizUI'
import { TriviaQuestion } from '@/types/quiz'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const trivia = await getTrivia(slug)

  if (!trivia) {
    return {
      title: 'Trivia Not Found — Quizly',
    }
  }

  return {
    title: `${trivia.title} — Play Free Trivia on Quizly 🏆`,
    description: `Play the ${trivia.category} trivia quiz: "${trivia.title}". Test your knowledge now!`,
  }
}

async function getTrivia(slug: string) {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('sm_trivia')
      .select('id, slug, title, category, questions, play_count, is_banned')
      .eq('slug', slug)
      .maybeSingle()

    if (error || !data) return null
    if (data.is_banned) return null

    return data
  } catch (err) {
    console.error('Failed to fetch trivia:', err)
    return null
  }
}

export default async function PlayTriviaPage({ params }: PageProps) {
  const { slug } = await params
  const trivia = await getTrivia(slug)

  if (!trivia) {
    notFound()
  }

  // Record a play using RPC
  try {
    const supabase = createAdminClient()
    await supabase.rpc('increment_play_count', { p_trivia_id: trivia.id })
  } catch (err) {
    console.error('Failed to increment play count:', err)
  }

  // Parse questions column
  const rawQuestions = trivia.questions as any[]
  const parsedQuestions = rawQuestions.map((q: any, i: number) => ({
    id: String(i + 1),
    question_text: q.question || q.question_text || '',
    options: q.options || [],
    correct_index: q.correct_index !== undefined ? q.correct_index : 0,
  }))

  return (
    <QuizUI
      title={trivia.title}
      category={trivia.category}
      creatorName="Quizly Community"
      questions={parsedQuestions}
      leaderboard={[
        { player_name: 'Priya K.', score: parsedQuestions.length, total: parsedQuestions.length, time_taken_sec: 25 },
        { player_name: 'Sophie M.', score: Math.max(1, parsedQuestions.length - 1), total: parsedQuestions.length, time_taken_sec: 32 },
        { player_name: 'Jake R.', score: Math.max(1, parsedQuestions.length - 2), total: parsedQuestions.length, time_taken_sec: 45 },
      ]}
    />
  )
}
