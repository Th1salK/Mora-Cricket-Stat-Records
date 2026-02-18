"use client"

import { useState } from "react"

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
}: {
  matches: Match[]
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
        // Update locally
        setMatches((prev) =>
          prev.map((m) => (m._id === editingId ? result : m))
        )
        setEditingId(null)
      } else {
        // Add locally
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
      date: match.date.split("T")[0], // Fix ISO date
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
    <div className="text-black space-y-6">

      {/* FORM */}
      <form onSubmit={onSubmit} className="p-4 border rounded bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={onChange}
            className="border rounded px-2 py-1"
            required
          />

          <input
            name="opponent"
            value={form.opponent}
            onChange={onChange}
            placeholder="Opponent"
            className="border rounded px-2 py-1"
            required
          />

          <select
            name="venue"
            value={form.venue}
            onChange={onChange}
            className="border rounded px-2 py-1"
          >
            <option>Home</option>
            <option>Away</option>
          </select>

          <input
            type="number"
            name="overs"
            min={1}
            value={form.overs}
            onChange={onChange}
            className="border rounded px-2 py-1"
          />

          <select
            name="matchType"
            value={form.matchType}
            onChange={onChange}
            className="border rounded px-2 py-1"
          >
            <option>Home and Home</option>
            <option>Practice</option>
            <option>Div 3</option>
            <option>Inter Uni</option>
            <option>SLUG</option>
          </select>

          <button
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {editingId
              ? loading
                ? "Updating..."
                : "Update Match"
              : loading
              ? "Adding..."
              : "Add Match"}
          </button>
        </div>
      </form>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Opponent</th>
              <th className="px-4 py-2 text-left">Venue</th>
              <th className="px-4 py-2 text-left">Overs</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {matches.map((m) => (
              <tr key={m._id} className="border-t">
                <td className="px-4 py-2">
                  {new Date(m.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">{m.opponent}</td>
                <td className="px-4 py-2">{m.venue}</td>
                <td className="px-4 py-2">{m.overs}</td>
                <td className="px-4 py-2">{m.matchType}</td>

                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => handleEdit(m)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(m._id!)}
                    className="px-2 py-1 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {matches.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
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
