import type { Metadata } from 'next'
import { Syne, DM_Sans, Instrument_Serif } from 'next/font/google'
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

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Quizly — Create an anonymous quiz about yourself',
  description: 'Share your Quizly link on Instagram/Snapchat stories to see what your friends really think and unlock a personalized AI-generated personality radar report.',
  keywords: ['quizly', 'personality quiz', 'friend quiz', 'social identity', 'anonymous quiz'],
  openGraph: {
    title: 'Quizly',
    description: 'Create an anonymous quiz about yourself.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${instrumentSerif.variable}`}>
      <body>{children}</body>
    </html>
  )
}

