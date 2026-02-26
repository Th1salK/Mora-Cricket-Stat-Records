import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Sidebar from '../components/Sidebar'
import { isAdmin } from '../lib/auth'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Mora Cricket Stats',
  description: 'Cricket statistics dashboard for Mora Cricket Team',
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const admin = await isAdmin()

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen flex">
          <Sidebar isAdmin={admin} />
          <main className="flex-1 p-4 pt-[calc(3.5rem+1rem)] md:pt-6 md:p-6 bg-[#0a0a0f] min-h-screen">{children}</main>
        </div>
      </body>
    </html>
  )
}
