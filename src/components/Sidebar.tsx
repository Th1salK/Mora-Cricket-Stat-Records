"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/players', label: 'Players' },
  { href: '/matches', label: 'Matches' },
  { href: '/stats/enter', label: 'Enter Stats' },
  { href: '/stats/batting', label: 'Batting Stats' },
  { href: '/stats/bowling', label: 'Bowling Stats' },
]

export default function Sidebar() {
  const pathname = usePathname() || '/'

  return (
    <aside className=" text-black w-56 h-screen bg-gray-50 border-r px-4 py-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold">Mora Cricket Stats</h1>
      </div>

      <nav className="space-y-1">
        {links.map((l) => {
          const active = pathname === l.href
          return (
            <Link key={l.href} href={l.href} className={`block px-3 py-2 rounded ${active ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
              {l.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
