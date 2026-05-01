import { createClient } from '@/lib/supabase/client'
import type { CreateQuizPayload, QuizWithQuestions, LeaderboardEntry } from '@/types/database'

// ─────────────────────────────────────────────────
// Generate a URL-safe slug from title
// ─────────────────────────────────────────────────
export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)
  const suffix = Math.random().toString(36).slice(2, 7)
  return `${base}-${suffix}`
}

// ─────────────────────────────────────────────────
// CREATE a quiz (with questions)
// ─────────────────────────────────────────────────
export async function createQuiz(payload: CreateQuizPayload) {
  const supabase = createClient()
  const slug = generateSlug(payload.title)

  // 1. Insert quiz
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .insert({
      slug,
      title: payload.title,
      description: payload.description ?? null,
      category: payload.category,
      creator_name: payload.creator_name,
    })
    .select()
    .single()

  if (quizError || !quiz) throw new Error(quizError?.message ?? 'Failed to create quiz')

  // 2. Insert questions
  const questions = payload.questions.map((q, i) => ({
    quiz_id: quiz.id,
    question_text: q.question_text,
    options: q.options,
    correct_index: q.correct_index,
    image_url: q.image_url ?? null,
    order_num: i,
  }))

  const { error: questionsError } = await supabase
    .from('questions')
    .insert(questions)

  if (questionsError) throw new Error(questionsError.message)

  return { quiz, slug }
}

// ─────────────────────────────────────────────────
// GET quiz by slug (with questions)
// ─────────────────────────────────────────────────
export async function getQuizBySlug(slug: string): Promise<QuizWithQuestions | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('quizzes')
    .select(`*, questions(*)`)
    .eq('slug', slug)
    .eq('is_public', true)
    .eq('is_banned', false)
    .single()

  if (error || !data) return null

  // Sort questions by order_num
  data.questions = data.questions.sort((a: any, b: any) => a.order_num - b.order_num)

  return data as QuizWithQuestions
}

// ─────────────────────────────────────────────────
// GET trending quizzes (home page)
// ─────────────────────────────────────────────────
export async function getTrendingQuizzes(category?: string, limit = 12) {
  const supabase = createClient()

  let query = supabase
    .from('quizzes')
    .select('id, slug, title, category, creator_name, total_plays, avg_score, created_at')
    .eq('is_public', true)
    .eq('is_banned', false)
    .order('total_plays', { ascending: false })
    .limit(limit)

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) return []
  return data
}

// ─────────────────────────────────────────────────
// GET featured quizzes
// ─────────────────────────────────────────────────
export async function getFeaturedQuizzes() {
  const supabase = createClient()

  const { data } = await supabase
    .from('quizzes')
    .select('id, slug, title, category, creator_name, total_plays')
    .eq('is_featured', true)
    .eq('is_banned', false)
    .limit(6)

  return data ?? []
}

// ─────────────────────────────────────────────────
// SUBMIT attempt (save score)
// ─────────────────────────────────────────────────
export async function submitAttempt({
  quiz_id,
  player_name,
  score,
  total,
  time_taken_sec,
}: {
  quiz_id: string
  player_name: string
  score: number
  total: number
  time_taken_sec?: number
}) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('attempts')
    .insert({ quiz_id, player_name, score, total, time_taken_sec: time_taken_sec ?? null })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ─────────────────────────────────────────────────
// GET leaderboard for a quiz
// ─────────────────────────────────────────────────
export async function getLeaderboard(quiz_id: string, limit = 10): Promise<LeaderboardEntry[]> {
  const supabase = createClient()

  const { data } = await supabase
    .from('attempts')
    .select('player_name, score, total, created_at')
    .eq('quiz_id', quiz_id)
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit)

  return (data ?? []) as LeaderboardEntry[]
}

// ─────────────────────────────────────────────────
// GET ad settings (public read)
// ─────────────────────────────────────────────────
export async function getAdSettings() {
  const supabase = createClient()
  const { data } = await supabase.from('ad_settings').select('*').single()
  return data
}
