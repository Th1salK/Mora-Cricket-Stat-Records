'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const publicLinks = [
  { href: '/',              label: 'Dashboard'    },
  { href: '/matches',       label: 'Matches'      },
  { href: '/players',       label: 'Players'      },
  { href: '/stats/batting', label: 'Batting Stats' },
  { href: '/stats/bowling', label: 'Bowling Stats' },
  { href: '/career',        label: 'Career'       },
]

const adminLinks = [
  { href: '/stats/enter', label: 'Stats Entry' },
]

export default function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname() || '/'
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const links = isAdmin ? [...publicLinks, ...adminLinks] : publicLinks

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.refresh()
  }

  const navContent = (
    <>
      <div className="mb-8">
        <h1 className="text-yellow-400 font-bold text-xl leading-tight">Mora Cricket</h1>
        <p className="text-slate-500 text-xs mt-0.5">Stats Dashboard</p>
      </div>

      <nav className="space-y-1 flex-1">
        {links.map((l) => {
          const active = pathname === l.href
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'text-yellow-400 bg-blue-900/30 border-l-2 border-yellow-400 pl-[10px]'
                  : 'text-slate-300 hover:text-white hover:bg-blue-900/20'
              }`}
            >
              {l.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-4 border-t border-white/10 pt-4">
        {isAdmin ? (
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-blue-900/20 transition-colors"
          >
            Sign out
          </button>
        ) : (
          <Link
            href="/login"
            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === '/login'
                ? 'text-yellow-400 bg-blue-900/30 border-l-2 border-yellow-400 pl-[10px]'
                : 'text-slate-400 hover:text-white hover:bg-blue-900/20'
            }`}
          >
            Admin login
          </Link>
        )}
      </div>
    </>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[#0a0a0f] border-b border-white/10 flex items-center px-4 gap-3">
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
          className="text-slate-300 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-yellow-400 font-bold text-lg">Mora Cricket</span>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 h-screen bg-[#0a0a0f] border-r border-white/10 px-4 py-6 flex-col shrink-0 sticky top-0">
        {navContent}
      </aside>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-64 bg-[#0a0a0f] border-r border-white/10 px-4 py-6 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-yellow-400 font-bold text-xl">Mora Cricket</span>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-slate-500 text-xs mb-8">Stats Dashboard</p>

        <nav className="space-y-1 flex-1">
          {links.map((l) => {
            const active = pathname === l.href
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'text-yellow-400 bg-blue-900/30 border-l-2 border-yellow-400 pl-[10px]'
                    : 'text-slate-300 hover:text-white hover:bg-blue-900/20'
                }`}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-4 border-t border-white/10 pt-4">
          {isAdmin ? (
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-blue-900/20 transition-colors"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === '/login'
                  ? 'text-yellow-400 bg-blue-900/30 border-l-2 border-yellow-400 pl-[10px]'
                  : 'text-slate-400 hover:text-white hover:bg-blue-900/20'
              }`}
            >
              Admin login
            </Link>
          )}
        </div>
      </aside>
    </>
  )
}
