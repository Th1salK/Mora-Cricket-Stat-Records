import type { Metadata, Viewport } from 'next'
import { Inter, Jersey_25 } from 'next/font/google'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import '@/app/globals.css'
import { AppShell } from '@/components/shell/AppShell'
import type { ShellSeason } from '@/components/shell/types'
import { isAdmin } from '@/lib/auth'
import { listSeasonsWithCounts, getCurrentSeason } from '@/lib/seasonsServer'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap' })
const jersey = Jersey_25({ variable: '--font-jersey', subsets: ['latin'], weight: '400', display: 'swap' })

export const metadata: Metadata = {
  title: 'Mora Cricket Stats',
  description: 'Batting, bowling and records for the University of Moratuwa cricket team.',
}

export const viewport: Viewport = { viewportFit: 'cover' }

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const admin = await isAdmin()
  let seasons: ShellSeason[] = []
  let currentSeasonId: string | null = null
  try {
    const [list, current] = await Promise.all([listSeasonsWithCounts(), getCurrentSeason()])
    seasons = list.map(({ id, name, matchCount }) => ({ id, name, matchCount }))
    currentSeasonId = current?.id ?? null
  } catch {
    // The shell remains usable if seasons cannot be loaded.
  }
  const hasLogo = existsSync(join(process.cwd(), 'public', 'brand', 'mora-logo.png'))
  return <html lang="en" className="dark" data-theme="dark">
    <body className={`${inter.variable} ${jersey.variable} font-sans antialiased`}>
      <a href="#main" className="skip-link">Skip to content</a>
      <AppShell isAdmin={admin} seasons={seasons} currentSeasonId={currentSeasonId} hasLogo={hasLogo}>{children}</AppShell>
    </body>
  </html>
}
