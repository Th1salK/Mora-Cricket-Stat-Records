"use client"
import { useState } from 'react'

type Match = {
  _id?: string
  date: string
  opponent: string
  venue: 'Home' | 'Away'
  overs: number
  matchType: 'Home and Home' | 'Practice' | 'Div 3'|'Inter Uni' | 'SLUG'
}

export default function MatchesClient({ matches: initialMatches }: { matches: Match[] }) {
  const [matches, setMatches] = useState<Match[]>(initialMatches || [])
  const [form, setForm] = useState({ date: '', opponent: '', venue: 'Home', overs: 40, matchType: 'League'})
  const [loading, setLoading] = useState(false)

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: name === 'overs' ? Number(value) : value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed')
      const created = await res.json()
      setMatches((m) => [created, ...m])
      setForm({ date: '', opponent: '', venue: 'Home', overs: 40, matchType: 'League' })
    } catch (err) {
      console.error(err)
      alert('Failed to create match')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="text-black space-y-6">
      <form onSubmit={onSubmit} className="p-4 border rounded bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium">Date</label>
            <input type="date" name="date" value={form.date} onChange={onChange} className="mt-1 block w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm font-medium">Opponent</label>
            <input name="opponent" value={form.opponent} onChange={onChange} className="mt-1 block w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm font-medium">Venue</label>
            <select name="venue" value={form.venue} onChange={onChange} className="mt-1 block w-full border rounded px-2 py-1">
              <option>Home</option>
              <option>Away</option>
            </select>
          </div>
          <div>
           <input
                type="number"
                name="overs"
                min={1}
                value={form.overs}
                onChange={onChange}
                className="mt-1 block w-full border rounded px-2 py-1"
        />

          </div>
          <div>
            <label className="block text-sm font-medium">Match Type</label>
            <select name="matchType" value={form.matchType} onChange={onChange} className="mt-1 block w-full border rounded px-2 py-1">
                  <option>Home and Home</option>
                  <option>Practice</option>
                  <option>Div 3</option>
                  <option>Inter Uni</option>
                  <option>SLUG</option>

            </select>
          </div>
          <div className="flex items-end">
            <button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
              {loading ? 'Adding...' : 'Add Match'}
            </button>
          </div>
        </div>
      </form>

      <div className="overflow-x-auto bg-white border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Opponent</th>
              <th className="px-4 py-2 text-left">Venue</th>
              <th className="px-4 py-2 text-left">Overs</th>
              <th className="px-4 py-2 text-left">Match Type</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => (
              <tr key={m._id} className="border-t">
                <td className="px-4 py-2">{new Date(m.date).toLocaleDateString()}</td>
                <td className="px-4 py-2">{m.opponent}</td>
                <td className="px-4 py-2">{m.venue}</td>
                <td className="px-4 py-2">{m.overs}</td>
                <td className="px-4 py-2">{m.matchType}</td>
              </tr>
            ))}
            {matches.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No matches yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
