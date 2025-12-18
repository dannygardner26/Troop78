import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/navigation'
import { GlobalSearch } from '@/components/global-search'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Troop 78 Modernization - Willistown Scout Troop',
  description: 'Modern management system for Willistown Boy Scout Troop 78. Est. 1978. Modernizing Adventure.',
  keywords: 'scouts, troop 78, willistown, modernization, management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-troop-slate-900 via-black to-troop-maroon">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <GlobalSearch />
        </div>
      </body>
    </html>
  )
}