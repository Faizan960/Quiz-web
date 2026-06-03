import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
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

export const metadata: Metadata = {
  title: 'Social Mirror — Discover how people really see you',
  description: 'An AI-powered social insight platform where friends anonymously answer questions about you and you get personality reports, social identity cards, roasts, and compliments.',
  keywords: ['social mirror', 'personality quiz', 'friend quiz', 'social identity', 'personality insights', 'roast me', 'compliment me'],
  openGraph: {
    title: 'Social Mirror',
    description: 'Discover how people really see you.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
