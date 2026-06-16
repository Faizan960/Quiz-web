import { OnboardingUI } from '@/components/OnboardingUI'
import { ToastProvider } from '@/components/ui/Toast'

export const metadata = {
  title: 'Join Quizly — Claim Your Link 🪞',
  description: 'Create your anonymous personality Q&A page, share with friends, and view your insights radar.',
}

export default function CreatePage() {
  return (
    <ToastProvider>
      <OnboardingUI />
    </ToastProvider>
  )
}
