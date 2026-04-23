import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MedResearch AI — Health Intelligence Platform',
  description: 'AI-powered medical research with RAG, PubMed, and deep analysis',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
