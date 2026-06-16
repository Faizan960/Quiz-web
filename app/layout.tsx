import type { Metadata } from 'next'
import { Syne, DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-dm',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Quizly — Create an anonymous quiz about yourself',
    template: '%s | Quizly',
  },
  description:
    'Share your Quizly link on Instagram & Snapchat stories. Friends answer anonymously, and you unlock a personalized AI-generated personality radar report.',
  keywords: [
    'quizly',
    'personality quiz',
    'anonymous quiz',
    'friend quiz',
    'social identity',
    'personality report',
  ],
  openGraph: {
    title: 'Quizly',
    description: 'Create an anonymous quiz about yourself.',
    type: 'website',
    siteName: 'Quizly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quizly',
    description: 'Create an anonymous quiz about yourself.',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
}

import { ToastProvider } from '@/components/ui/Toast'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
