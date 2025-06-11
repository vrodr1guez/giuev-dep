import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AXIOM Genesis | Revolutionary Patent Portfolio',
  description: 'AXIOM Genesis: $164.5B Patent Portfolio - Revolutionary AI, Quantum Computing, and Digital Twin Technologies',
  keywords: 'AXIOM Genesis, patents, AI, quantum computing, digital twin, intellectual property, technology portfolio',
  authors: [{ name: 'AXIOM Genesis' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-slate-900 text-white antialiased`}>
        {children}
      </body>
    </html>
  )
} 