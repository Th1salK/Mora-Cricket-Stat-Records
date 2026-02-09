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
      
      if (!res.ok){
        const errorData = await res.json()
        console.error("API ERROR:",errorData)
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
    <div className="text-black space-y-6">
      <form onSubmit={onSubmit} className="p-4 border rounded bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input name="fullName" value={form.fullName} onChange={onChange} className="mt-1 block w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm font-medium">Short Name</label>
            <input name="shortName" value={form.shortName} onChange={onChange} className="mt-1 block w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm font-medium">Role</label>
            <select name="role" value={form.role} onChange={onChange} className="mt-1 block w-full border rounded px-2 py-1">
              <option>Batsman</option>
              <option>Bowler</option>
              <option>All-rounder</option>
              <option>Wicket-keeper</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Batting Style</label>
            <select name="battingStyle" value={form.battingStyle} onChange={onChange} className="mt-1 block w-full border rounded px-2 py-1">
              <option>Right Hand Bat</option>
              <option>Left Hand Bat</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Bowling Style</label>
            <input name="bowlingStyle" value={form.bowlingStyle} onChange={onChange} className="mt-1 block w-full border rounded px-2 py-1" />
          </div>
          <div className="flex items-end">
            <button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
              {loading ? 'Adding...' : 'Add Player'}
            </button>
          </div>
        </div>
      </form>

      <div className="overflow-x-auto bg-white border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Full Name</th>
              <th className="px-4 py-2 text-left">Short Name</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Batting Style</th>
              <th className="px-4 py-2 text-left">Bowling Style</th>
              <th className="px-4 py-2 text-left">Active</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="px-4 py-2">
                  <Link href={`/players/${p._id}`} className="text-blue-600 hover:underline hover:text-blue-700 cursor-pointer">
                    {p.fullName}
                  </Link>
                </td>
                <td className="px-4 py-2">{p.shortName}</td>
                <td className="px-4 py-2">{p.role}</td>
                <td className="px-4 py-2">{p.battingStyle ?? '-'}</td>
                <td className="px-4 py-2">{p.bowlingStyle ?? '-'}</td>
                <td className="px-4 py-2">{p.isActive ? 'Yes' : 'No'}</td>
              </tr>
            ))}
            {players.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
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
