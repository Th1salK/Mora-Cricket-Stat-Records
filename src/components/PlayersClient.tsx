"use client"
import { useState } from 'react'
import Link from 'next/link'

type Player = {
  _id?: string
  fullName: string
  shortName: string
  battingStyle?: string | null
  bowlingStyle?: string | null
  role: string
  isActive?: boolean
}

export default function PlayersClient({ players: initialPlayers }: { players: Player[] }) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers || [])
  const [form, setForm] = useState({ fullName: '', shortName: '', role: 'Batsman', battingStyle: 'Right Hand Bat', bowlingStyle: '' })
  const [loading, setLoading] = useState(false)

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, bowlingStyle: form.bowlingStyle || null }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error("API ERROR:", errorData)
        throw new Error(errorData.error || 'Failed')
      }

      const created = await res.json()
      setPlayers((p) => [created, ...p])
      setForm({ fullName: '', shortName: '', role: 'Batsman', battingStyle: 'Right Hand Bat', bowlingStyle: '' })
    } catch (err) {
      console.error(err)
      alert('Failed to create player')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="glass p-6">
        <h2 className="text-yellow-400 font-bold text-lg mb-4">Add Player</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-yellow-400 text-sm font-medium mb-1">Full Name</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={onChange}
              placeholder="Full name"
              className="w-full bg-white/5 border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              required
            />
          </div>
          <div>
            <label className="block text-yellow-400 text-sm font-medium mb-1">Short Name</label>
            <input
              name="shortName"
              value={form.shortName}
              onChange={onChange}
              placeholder="Short name"
              className="w-full bg-white/5 border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              required
            />
          </div>
          <div>
            <label className="block text-yellow-400 text-sm font-medium mb-1">Role</label>
            <select name="role" value={form.role} onChange={onChange} className="glass-select w-full">
              <option>Batsman</option>
              <option>Bowler</option>
              <option>All-rounder</option>
              <option>Wicket-keeper</option>
            </select>
          </div>
          <div>
            <label className="block text-yellow-400 text-sm font-medium mb-1">Batting Style</label>
            <select name="battingStyle" value={form.battingStyle} onChange={onChange} className="glass-select w-full">
              <option>Right Hand Bat</option>
              <option>Left Hand Bat</option>
            </select>
          </div>
          <div>
            <label className="block text-yellow-400 text-sm font-medium mb-1">Bowling Style</label>
            <input
              name="bowlingStyle"
              value={form.bowlingStyle}
              onChange={onChange}
              placeholder="e.g. Right Arm Medium"
              className="w-full bg-white/5 border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div className="flex items-end">
            <button
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg px-4 py-2 transition-colors"
            >
              {loading ? 'Adding...' : 'Add Player'}
            </button>
          </div>
        </div>
      </form>

      <div className="glass overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-white/10">
            <tr>
              <th className="px-4 py-3 text-left text-yellow-400 text-sm font-semibold">Full Name</th>
              <th className="px-4 py-3 text-left text-yellow-400 text-sm font-semibold">Short Name</th>
              <th className="px-4 py-3 text-left text-yellow-400 text-sm font-semibold">Role</th>
              <th className="px-4 py-3 text-left text-yellow-400 text-sm font-semibold">Batting Style</th>
              <th className="px-4 py-3 text-left text-yellow-400 text-sm font-semibold">Bowling Style</th>
              <th className="px-4 py-3 text-left text-yellow-400 text-sm font-semibold">Active</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p._id} className="border-b border-white/5 hover:bg-blue-900/10 transition-colors">
                <td className="px-4 py-3 text-slate-300 text-sm">
                  <Link href={`/players/${p._id}`} className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer">
                    {p.fullName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-300 text-sm">{p.shortName}</td>
                <td className="px-4 py-3 text-slate-300 text-sm">{p.role}</td>
                <td className="px-4 py-3 text-slate-300 text-sm">{p.battingStyle ?? '-'}</td>
                <td className="px-4 py-3 text-slate-300 text-sm">{p.bowlingStyle ?? '-'}</td>
                <td className="px-4 py-3 text-slate-300 text-sm">{p.isActive ? 'Yes' : 'No'}</td>
              </tr>
            ))}
            {players.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No players yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
