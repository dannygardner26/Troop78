import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClientWrapper } from '@/components/client-wrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Troop 78 - Willistown Scout Troop',
  description: 'Modern management system for Willistown Boy Scout Troop 78. Est. 1978.',
  keywords: 'scouts, troop 78, willistown, BSA, boy scouts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-slate-50">
          <ClientWrapper>{children}</ClientWrapper>
        </div>
      </body>
    </html>
  )
}
