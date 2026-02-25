'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

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

  const links = isAdmin ? [...publicLinks, ...adminLinks] : publicLinks

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.refresh()
  }

  return (
    <aside className="w-56 h-screen bg-[#0a0a0f] border-r border-white/10 px-4 py-6 flex flex-col shrink-0">
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
    </aside>
  )
}
