"use client"

import { useState } from "react"
import { getMatchTypeBadgeClass } from "../lib/matchTypeBadge"

type Match = {
  _id?: string
  date: string
  opponent: string
  venue: "Home" | "Away"
  overs: number
  matchType: "Home and Home" | "Practice" | "Div 3" | "Inter Uni" | "SLUG"
}

export default function MatchesClient({
  matches: initialMatches,
  isAdmin = false,
}: {
  matches: Match[]
  isAdmin?: boolean
}) {
  const [matches, setMatches] = useState<Match[]>(initialMatches || [])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [form, setForm] = useState<Match>({
    date: "",
    opponent: "",
    venue: "Home",
    overs: 40,
    matchType: "Home and Home",
  })

  function onChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === "overs" ? Number(value) : value,
    }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const method = editingId ? "PUT" : "POST"
      const url = editingId
        ? `/api/matches/${editingId}`
        : "/api/matches"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error("Failed")

      const result = await res.json()

      if (editingId) {
        setMatches((prev) =>
          prev.map((m) => (m._id === editingId ? result : m))
        )
        setEditingId(null)
      } else {
        setMatches((prev) => [result, ...prev])
      }

      resetForm()
    } catch (err) {
      console.error(err)
      alert("Operation failed")
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(match: Match) {
    setEditingId(match._id!)
    setForm({
      date: match.date.split("T")[0],
      opponent: match.opponent,
      venue: match.venue,
      overs: match.overs,
      matchType: match.matchType,
    })
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this match?")) return

    try {
      const res = await fetch(`/api/matches/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Delete failed")

      setMatches((prev) => prev.filter((m) => m._id !== id))
    } catch (err) {
      console.error(err)
      alert("Delete failed")
    }
  }

  function resetForm() {
    setForm({
      date: "",
      opponent: "",
      venue: "Home",
      overs: 40,
      matchType: "Home and Home",
    })
  }

  return (
    <div className="space-y-6">

      {/* FORM — admin only */}
      {isAdmin && (
        <form onSubmit={onSubmit} className="glass p-6">
        <h2 className="text-yellow-400 font-bold text-lg mb-4">
          {editingId ? "Edit Match" : "Add Match"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div>
            <label className="block text-yellow-400 text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={onChange}
              className="w-full bg-white/5 border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-yellow-400 text-sm font-medium mb-1">Opponent</label>
            <input
              name="opponent"
              value={form.opponent}
              onChange={onChange}
              placeholder="Opponent"
              className="w-full bg-white/5 border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-yellow-400 text-sm font-medium mb-1">Venue</label>
            <select
              name="venue"
              value={form.venue}
              onChange={onChange}
              className="glass-select w-full"
            >
              <option value="Home">Home</option>
              <option value="Away">Away</option>
            </select>
          </div>

          <div>
            <label className="block text-yellow-400 text-sm font-medium mb-1">Overs</label>
            <input
              type="number"
              name="overs"
              min={1}
              value={form.overs}
              onChange={onChange}
              className="w-full bg-white/5 border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-yellow-400 text-sm font-medium mb-1">Match Type</label>
            <select
              name="matchType"
              value={form.matchType}
              onChange={onChange}
              className="glass-select w-full"
            >
              <option value="Home and Home">Home and Home</option>
              <option value="Practice">Practice</option>
              <option value="Div 3">Div 3</option>
              <option value="Inter Uni">Inter Uni</option>
              <option value="SLUG">SLUG</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg px-4 py-2 transition-colors"
            >
              {editingId
                ? loading ? "Updating..." : "Update Match"
                : loading ? "Adding..." : "Add Match"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => { resetForm(); setEditingId(null) }}
                className="flex-1 border border-slate-600 text-slate-400 hover:text-white rounded-lg px-4 py-2 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

        </div>
      </form>
      )}

      {/* TABLE */}
      <div className="glass overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-white/10">
            <tr>
              <th className="px-4 py-3 text-left text-yellow-400 text-sm font-semibold">Date</th>
              <th className="px-4 py-3 text-left text-yellow-400 text-sm font-semibold">Opponent</th>
              <th className="px-4 py-3 text-left text-yellow-400 text-sm font-semibold hidden sm:table-cell">Venue</th>
              <th className="px-4 py-3 text-left text-yellow-400 text-sm font-semibold hidden sm:table-cell">Overs</th>
              <th className="px-4 py-3 text-left text-yellow-400 text-sm font-semibold">Type</th>
              {isAdmin && <th className="px-4 py-3 text-left text-yellow-400 text-sm font-semibold">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {matches.map((m) => (
              <tr key={m._id} className="border-b border-white/5 hover:bg-blue-900/10 transition-colors">
                <td className="px-4 py-3 text-slate-300 text-sm">
                  {new Date(m.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-slate-300 text-sm">{m.opponent}</td>
                <td className="px-4 py-3 text-slate-300 text-sm hidden sm:table-cell">{m.venue}</td>
                <td className="px-4 py-3 text-slate-300 text-sm hidden sm:table-cell">{m.overs}</td>
                <td className="px-4 py-3">
                  <span className={getMatchTypeBadgeClass(m.matchType)}>
                    {m.matchType}
                  </span>
                </td>

                {isAdmin && (
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => handleEdit(m)}
                      className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 rounded hover:bg-yellow-500/30 transition-colors text-sm"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(m._id!)}
                      className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/40 rounded hover:bg-red-500/30 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}

            {matches.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-slate-500">
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
