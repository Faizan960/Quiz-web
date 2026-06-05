import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleApiError, DatabaseError } from '@/lib/monitoring/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
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
      if (error && error.code !== 'PGRST116') {
        throw new DatabaseError(error.message, error)
      }
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    data.questions = data.questions.sort((a: { order_num: number }, b: { order_num: number }) => a.order_num - b.order_num)
    return NextResponse.json({ quiz: data })
  } catch (err) {
    return handleApiError(err, request)
  }
}
