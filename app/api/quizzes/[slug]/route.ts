import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('quizzes')
    .select('*, questions(*)')
    .eq('slug', slug)
    .eq('is_public', true)
    .eq('is_banned', false)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
  }

  data.questions = data.questions.sort((a: any, b: any) => a.order_num - b.order_num)
  return NextResponse.json({ quiz: data })
}
