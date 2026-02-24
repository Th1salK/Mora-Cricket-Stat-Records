'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/matches', label: 'Matches' },
  { href: '/players', label: 'Players' },
  { href: '/stats/enter', label: 'Stats Entry' },
  { href: '/stats/batting', label: 'Batting Stats' },
  { href: '/stats/bowling', label: 'Bowling Stats' },
  { href: '/career', label: 'Career' },
]

export default function Sidebar() {
  const pathname = usePathname() || '/'

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
    </aside>
  )
}
