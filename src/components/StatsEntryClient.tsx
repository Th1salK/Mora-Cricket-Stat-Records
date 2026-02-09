"use client"
import { useEffect, useState } from 'react'

type Player = { _id?: string; fullName: string }
type Match = { _id?: string; date: string; opponent: string }

export default function StatsEntryClient({ players, matches }: { players: Player[]; matches: Match[] }) {
  const [matchList, setMatchList] = useState<Match[]>(matches || [])
  const [selectedMatchId, setSelectedMatchId] = useState<string>('')
  const [addingNew, setAddingNew] = useState(false)
  const [newMatch, setNewMatch] = useState({ date: '', opponent: '', venue: 'Home', overs: 40, matchType: 'League' })

  const [entries, setEntries] = useState(() =>
    (players || []).map((p) => ({ playerId: p._id, runs: '', balls: '', fours: '', sixes: '', out: false }))
  )

  const [bowlingEntries, setBowlingEntries] = useState(() =>
    (players || []).map((p) => ({ playerId: p._id, balls: '', runs: '', wickets: '', wides: '', noBalls: '' }))
  )

  useEffect(() => {
    setEntries(players.map((p) => ({ playerId: p._id, runs: '', balls: '', fours: '', sixes: '', out: false })))
    setBowlingEntries(players.map((p) => ({ playerId: p._id, balls: '', runs: '', wickets: '', wides: '', noBalls: '' })))
  }, [players])

  function onNewChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setNewMatch((n) => ({ ...n, [name]: name === 'overs' ? Number(value) : value }))
  }

  async function createMatch(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/matches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newMatch) })
      if (!res.ok) throw new Error('Failed')
      const created = await res.json()
      setMatchList((m) => [created, ...m])
      setSelectedMatchId(created._id)
      setAddingNew(false)
    } catch (err) {
      console.error(err)
      alert('Failed to create match')
    }
  }

  function onSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    if (val === 'add') {
      setAddingNew(true)
      setSelectedMatchId('')
    } else {
      setAddingNew(false)
      setSelectedMatchId(val)
    }
  }

  function onEntryChange(index: number, field: string, value: string | boolean) {
    setEntries((prev) => {
      const copy = [...prev]
      // @ts-ignore
      copy[index][field] = value
      return copy
    })
  }

  function onBowlingChange(index: number, field: string, value: string) {
    setBowlingEntries((prev) => {
      const copy = [...prev]
      // @ts-ignore
      copy[index][field] = value
      return copy
    })
  }

  async function submitEntry(index: number) {
    const entry = entries[index]
    if (!selectedMatchId) return alert('Select a match first')
    try {
      const payload = {
        matchId: selectedMatchId,
        playerId: entry.playerId,
        runs: Number(entry.runs) || 0,
        balls: Number(entry.balls) || 0,
        fours: Number(entry.fours) || 0,
        sixes: Number(entry.sixes) || 0,
        out: Boolean(entry.out),
      }
      const res = await fetch('/api/batting', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Failed')
      alert('Saved')
    } catch (err) {
      console.error(err)
      alert('Failed to save')
    }
  }

  async function submitBowling(index: number) {
    const entry = bowlingEntries[index]
    if (!selectedMatchId) return alert('Select a match first')
    try {
      const payload = {
        matchId: selectedMatchId,
        playerId: entry.playerId,
        balls: Number(entry.balls) || 0,
        runs: Number(entry.runs) || 0,
        wickets: Number(entry.wickets) || 0,
        wides: Number(entry.wides) || 0,
        noBalls: Number(entry.noBalls) || 0,
      }
      const res = await fetch('/api/bowling', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Failed')
      alert('Saved')
    } catch (err) {
      console.error(err)
      alert('Failed to save')
    }
  }

  return (
    <div className="text-black space-y-6">
      <div className="p-4 border rounded bg-white">
        <label className="block text-sm font-medium mb-2">Select Match</label>
        <select value={selectedMatchId || ''} onChange={onSelectChange} className="block w-full border rounded px-2 py-1 text-black">
          <option value="">-- Select a match --</option>
          <option value="add">Add new match</option>
          {matchList.map((m) => (
            <option key={m._id} value={m._id}>
              {new Date(m.date).toLocaleDateString()} - {m.opponent}
            </option>
          ))}
        </select>

        {addingNew && (
          <form onSubmit={createMatch} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium">Date</label>
              <input type="date" name="date" value={newMatch.date} onChange={onNewChange} className="mt-1 block w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Opponent</label>
              <input name="opponent" value={newMatch.opponent} onChange={onNewChange} className="mt-1 block w-full border rounded px-2 py-1" />
            </div>
            <div className="flex items-end">
              <button className="bg-blue-600 text-white px-4 py-2 rounded">Create Match</button>
            </div>
          </form>
        )}
      </div>

      <div className="p-4 border rounded bg-white">
        <h2 className="text-lg font-medium mb-3">Batting Entry</h2>
        <p className="text-sm mb-4">Select a match to enable stat entry.</p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Player</th>
                <th className="px-3 py-2 text-left">Runs</th>
                <th className="px-3 py-2 text-left">Balls</th>
                <th className="px-3 py-2 text-left">Fours</th>
                <th className="px-3 py-2 text-left">Sixes</th>
                <th className="px-3 py-2 text-left">Out</th>
                <th className="px-3 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => (
                <tr key={p._id} className="border-t">
                  <td className={`px-3 py-2 ${!selectedMatchId ? 'text-gray-400' : 'text-black'}`}>{p.fullName}</td>
                  <td className="px-3 py-2">
                    <input disabled={!selectedMatchId} value={entries[i]?.runs} onChange={(e) => onEntryChange(i, 'runs', e.target.value)} className="border rounded px-2 py-1 w-20" />
                  </td>
                  <td className="px-3 py-2">
                    <input disabled={!selectedMatchId} value={entries[i]?.balls} onChange={(e) => onEntryChange(i, 'balls', e.target.value)} className="border rounded px-2 py-1 w-20" />
                  </td>
                  <td className="px-3 py-2">
                    <input disabled={!selectedMatchId} value={entries[i]?.fours} onChange={(e) => onEntryChange(i, 'fours', e.target.value)} className="border rounded px-2 py-1 w-20" />
                  </td>
                  <td className="px-3 py-2">
                    <input disabled={!selectedMatchId} value={entries[i]?.sixes} onChange={(e) => onEntryChange(i, 'sixes', e.target.value)} className="border rounded px-2 py-1 w-20" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="checkbox" disabled={!selectedMatchId} checked={entries[i]?.out} onChange={(e) => onEntryChange(i, 'out', e.target.checked)} />
                  </td>
                  <td className="px-3 py-2">
                    <button disabled={!selectedMatchId} onClick={() => submitEntry(i)} className={`px-3 py-1 rounded ${!selectedMatchId ? 'bg-gray-300' : 'bg-green-600 text-white'}`}>
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bowling Section */}
      <div className="p-4 border rounded bg-white">
        <h2 className="text-lg font-medium mb-3">Bowling</h2>
        <p className="text-sm mb-4">Enter bowling figures for the selected match.</p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Player</th>
                <th className="px-3 py-2 text-left">Balls</th>
                <th className="px-3 py-2 text-left">Runs</th>
                <th className="px-3 py-2 text-left">Wickets</th>
                <th className="px-3 py-2 text-left">Wides</th>
                <th className="px-3 py-2 text-left">No Balls</th>
                <th className="px-3 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => (
                <tr key={p._id} className="border-t">
                  <td className={`px-3 py-2 ${!selectedMatchId ? 'text-gray-400' : 'text-black'}`}>{p.fullName}</td>
                  <td className="px-3 py-2">
                    <input disabled={!selectedMatchId} value={bowlingEntries[i]?.balls} onChange={(e) => onBowlingChange(i, 'balls', e.target.value)} className="border rounded px-2 py-1 w-20" />
                  </td>
                  <td className="px-3 py-2">
                    <input disabled={!selectedMatchId} value={bowlingEntries[i]?.runs} onChange={(e) => onBowlingChange(i, 'runs', e.target.value)} className="border rounded px-2 py-1 w-20" />
                  </td>
                  <td className="px-3 py-2">
                    <input disabled={!selectedMatchId} value={bowlingEntries[i]?.wickets} onChange={(e) => onBowlingChange(i, 'wickets', e.target.value)} className="border rounded px-2 py-1 w-20" />
                  </td>
                  <td className="px-3 py-2">
                    <input disabled={!selectedMatchId} value={bowlingEntries[i]?.wides} onChange={(e) => onBowlingChange(i, 'wides', e.target.value)} className="border rounded px-2 py-1 w-20" />
                  </td>
                  <td className="px-3 py-2">
                    <input disabled={!selectedMatchId} value={bowlingEntries[i]?.noBalls} onChange={(e) => onBowlingChange(i, 'noBalls', e.target.value)} className="border rounded px-2 py-1 w-20" />
                  </td>
                  <td className="px-3 py-2">
                    <button disabled={!selectedMatchId} onClick={() => submitBowling(i)} className={`px-3 py-1 rounded ${!selectedMatchId ? 'bg-gray-300' : 'bg-blue-600 text-white'}`}>
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
