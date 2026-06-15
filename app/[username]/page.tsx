import { QuizUI } from '@/components/QuizUI'

export default function PlayPage({ params }: { params: Promise<{ username: string }> }) {
  // We can eventually load data from Supabase here
  // For now we just render the new UI component
  return <QuizUI />
}
