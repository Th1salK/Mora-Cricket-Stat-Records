"use client"
import { useState } from 'react'

type MatchType = 'Home and Home' | 'Practice' | 'Div 3' | 'Inter Uni' | 'SLUG'

type Player = {
  _id: string
  fullName: string
  role: 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicket-keeper'
  isActive: boolean
}

type Match = {
  _id: string
  date: string
  opponent: string
  venue: 'Home' | 'Away'
  overs: number
  matchType: MatchType
}

type BattingEntry = {
  playerId: string
  runs: string
  balls: string
  fours: string
  sixes: string
  out: boolean
}

type BowlingEntry = {
  playerId: string
  balls: string
  runs: string
  wickets: string
  wides: string
  noBalls: string
}

const MATCH_TYPES: MatchType[] = ['Home and Home', 'Practice', 'Div 3', 'Inter Uni', 'SLUG']

const roleBadge: Record<string, string> = {
  Batsman: 'bg-blue-600/20 text-blue-300 border border-blue-500/30',
  Bowler: 'bg-green-600/20 text-green-300 border border-green-500/30',
  'All-rounder': 'bg-yellow-600/20 text-yellow-300 border border-yellow-500/30',
  'Wicket-keeper': 'bg-purple-600/20 text-purple-300 border border-purple-500/30',
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

const inputCls =
  'border rounded px-2 py-1 w-20 bg-white/5 border-blue-500/30 text-white focus:border-blue-400 focus:outline-none disabled:opacity-40'

// Step indicator
function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const steps = ['Select Match', 'Select Squad', 'Enter Stats']
  return (
    <div className="flex items-center gap-0 mb-6">
      {steps.map((label, i) => {
        const num = i + 1
        const done = num < step
        const active = num === step
        return (
          <div key={num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                  done
                    ? 'bg-yellow-400 border-yellow-400 text-black'
                    : active
                    ? 'bg-blue-600 border-blue-400 text-white'
                    : 'bg-white/5 border-white/20 text-slate-500'
                }`}
              >
                {done ? '✓' : num}
              </div>
              <span className={`text-xs mt-1 whitespace-nowrap ${active ? 'text-white' : done ? 'text-yellow-400' : 'text-slate-500'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-12 mx-1 mb-4 transition-colors ${done ? 'bg-yellow-400' : 'bg-white/10'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function StatsEntryClient({
  players,
  matches: initialMatches,
}: {
  players: Player[]
  matches: Match[]
}) {
  // ---- Step state ----
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // ---- Step 1: match ----
  const [matchList, setMatchList] = useState<Match[]>(initialMatches ?? [])
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [addingNew, setAddingNew] = useState(false)
  const [newMatch, setNewMatch] = useState<{
    date: string
    opponent: string
    venue: 'Home' | 'Away'
    overs: number
    matchType: MatchType
  }>({ date: '', opponent: '', venue: 'Home', overs: 40, matchType: 'Home and Home' })

  // ---- Step 2: squad ----
  const [selectedSquad, setSelectedSquad] = useState<Player[]>([])

  // ---- Step 3: stats entries ----
  const [entries, setEntries] = useState<BattingEntry[]>([])
  const [bowlingEntries, setBowlingEntries] = useState<BowlingEntry[]>([])

  // ---- Match creation ----
  function onNewChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setNewMatch((n) => ({ ...n, [name]: name === 'overs' ? Number(value) : value }))
  }

  async function createMatch(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMatch),
      })
      if (!res.ok) throw new Error('Failed')
      const created: Match = await res.json()
      setMatchList((m) => [created, ...m])
      setSelectedMatch(created)
      setAddingNew(false)
    } catch (err) {
      console.error(err)
      alert('Failed to create match')
    }
  }

  function pickMatch(matchId: string) {
    if (matchId === 'add') {
      setAddingNew(true)
      setSelectedMatch(null)
    } else {
      setAddingNew(false)
      const found = matchList.find((m) => m._id === matchId) ?? null
      setSelectedMatch(found)
    }
  }

  // ---- Squad toggle ----
  function togglePlayer(player: Player) {
    setSelectedSquad((prev) => {
      const exists = prev.find((p) => p._id === player._id)
      if (exists) return prev.filter((p) => p._id !== player._id)
      return [...prev, player]
    })
  }

  function confirmSquad() {
    setEntries(
      selectedSquad.map((p) => ({
        playerId: p._id,
        runs: '',
        balls: '',
        fours: '',
        sixes: '',
        out: false,
      }))
    )
    setBowlingEntries(
      selectedSquad.map((p) => ({
        playerId: p._id,
        balls: '',
        runs: '',
        wickets: '',
        wides: '',
        noBalls: '',
      }))
    )
    setStep(3)
  }

  // ---- Stats entry ----
  function onEntryChange(index: number, field: keyof BattingEntry, value: string | boolean) {
    setEntries((prev) => {
      const copy = [...prev]
      // @ts-ignore
      copy[index][field] = value
      return copy
    })
  }

  function onBowlingChange(index: number, field: keyof BowlingEntry, value: string) {
    setBowlingEntries((prev) => {
      const copy = [...prev]
      copy[index][field] = value
      return copy
    })
  }

  async function submitEntry(index: number) {
    if (!selectedMatch) return alert('No match selected')
    const entry = entries[index]
    try {
      const payload = {
        matchId: selectedMatch._id,
        playerId: entry.playerId,
        runs: Number(entry.runs) || 0,
        balls: Number(entry.balls) || 0,
        fours: Number(entry.fours) || 0,
        sixes: Number(entry.sixes) || 0,
        out: Boolean(entry.out),
      }
      const res = await fetch('/api/batting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed')
      alert('Batting saved')
    } catch (err) {
      console.error(err)
      alert('Failed to save batting entry')
    }
  }

  async function submitBowling(index: number) {
    if (!selectedMatch) return alert('No match selected')
    const entry = bowlingEntries[index]
    try {
      const payload = {
        matchId: selectedMatch._id,
        playerId: entry.playerId,
        balls: Number(entry.balls) || 0,
        runs: Number(entry.runs) || 0,
        wickets: Number(entry.wickets) || 0,
        wides: Number(entry.wides) || 0,
        noBalls: Number(entry.noBalls) || 0,
      }
      const res = await fetch('/api/bowling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed')
      alert('Bowling saved')
    } catch (err) {
      console.error(err)
      alert('Failed to save bowling entry')
    }
  }

  const squadCount = selectedSquad.length
  const squadValid = squadCount >= 11 && squadCount <= 15

  // ========== RENDER ==========
  return (
    <div className="space-y-6">
      <StepIndicator step={step} />

      {/* ---- STEP 1: Select / Create Match ---- */}
      {step === 1 && (
        <div className="glass p-6">
          <h2 className="text-white text-lg font-semibold border-l-4 border-yellow-400 pl-3 mb-4">
            Step 1 — Select a Match
          </h2>

          <label className="block text-yellow-400 text-sm font-medium mb-2">Match</label>
          <select
            value={selectedMatch?._id ?? ''}
            onChange={(e) => pickMatch(e.target.value)}
            className="glass-select w-full max-w-sm"
          >
            <option value="">-- Select a match --</option>
            <option value="add">+ Add new match</option>
            {matchList.map((m) => (
              <option key={m._id} value={m._id}>
                {new Date(m.date).toLocaleDateString()} — {m.opponent} ({m.matchType})
              </option>
            ))}
          </select>

          {addingNew && (
            <form onSubmit={createMatch} className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-yellow-400 text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={newMatch.date}
                  onChange={onNewChange}
                  required
                  className="w-full bg-white/5 border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-yellow-400 text-sm font-medium mb-1">Opponent</label>
                <input
                  name="opponent"
                  value={newMatch.opponent}
                  onChange={onNewChange}
                  placeholder="Opponent"
                  required
                  className="w-full bg-white/5 border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-yellow-400 text-sm font-medium mb-1">Venue</label>
                <select name="venue" value={newMatch.venue} onChange={onNewChange} className="glass-select w-full">
                  <option>Home</option>
                  <option>Away</option>
                </select>
              </div>
              <div>
                <label className="block text-yellow-400 text-sm font-medium mb-1">Overs</label>
                <input
                  type="number"
                  name="overs"
                  min={1}
                  value={newMatch.overs}
                  onChange={onNewChange}
                  className="w-full bg-white/5 border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-yellow-400 text-sm font-medium mb-1">Match Type</label>
                <select name="matchType" value={newMatch.matchType} onChange={onNewChange} className="glass-select w-full">
                  {MATCH_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg px-4 py-2 transition-colors"
                >
                  Create Match
                </button>
              </div>
            </form>
          )}

          {selectedMatch && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-slate-300 text-sm">
                Selected: <span className="text-white font-medium">{selectedMatch.opponent}</span>{' '}
                <span className="text-slate-400">({new Date(selectedMatch.date).toLocaleDateString()})</span>
              </div>
              <button
                onClick={() => setStep(2)}
                className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-lg px-6 py-2 transition-colors"
              >
                Next: Select Squad →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---- STEP 2: Squad Selection ---- */}
      {step === 2 && (
        <div className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-lg font-semibold border-l-4 border-yellow-400 pl-3">
              Step 2 — Select Squad
            </h2>
            <button onClick={() => setStep(1)} className="text-sm text-slate-400 hover:text-white transition-colors">
              ← Change Match
            </button>
          </div>

          {/* Counter bar */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg mb-5 text-sm font-medium ${
              squadValid
                ? 'bg-green-600/20 text-green-300 border border-green-500/30'
                : 'bg-yellow-600/20 text-yellow-300 border border-yellow-500/30'
            }`}
          >
            <span>{squadCount} selected</span>
            <span className="text-slate-400">·</span>
            <span>Min 11, Max 15</span>
            {squadValid && <span className="ml-auto">Ready ✓</span>}
          </div>

          {/* Player grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
            {players.map((p) => {
              const selected = !!selectedSquad.find((s) => s._id === p._id)
              const disabled = !p.isActive && !selected
              return (
                <button
                  key={p._id}
                  onClick={() => !disabled && togglePlayer(p)}
                  className={`relative rounded-xl p-3 flex flex-col items-center gap-1 border-2 transition-all text-center
                    ${disabled ? 'opacity-30 cursor-not-allowed border-white/5 bg-white/2' : 'cursor-pointer'}
                    ${selected ? 'border-yellow-400 bg-yellow-400/10' : 'border-white/10 bg-white/5 hover:border-blue-400/50 hover:bg-blue-900/20'}
                  `}
                >
                  {selected && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-black text-[10px] font-bold">
                      ✓
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${selected ? 'bg-yellow-400 text-black' : 'bg-blue-900 text-white'}`}>
                    {initials(p.fullName)}
                  </div>
                  <span className="text-xs text-white font-medium leading-tight">{p.fullName}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${roleBadge[p.role] ?? 'bg-slate-700 text-slate-300'}`}>
                    {p.role}
                  </span>
                  {!p.isActive && <span className="text-[10px] text-red-400">Inactive</span>}
                </button>
              )
            })}
          </div>

          <button
            disabled={!squadValid}
            onClick={confirmSquad}
            className={`w-full sm:w-auto px-8 py-2.5 rounded-lg font-semibold transition-colors ${
              squadValid
                ? 'bg-yellow-400 hover:bg-yellow-300 text-black'
                : 'bg-white/5 text-slate-500 cursor-not-allowed'
            }`}
          >
            Confirm Squad ({squadCount}) →
          </button>
        </div>
      )}

      {/* ---- STEP 3: Stats Entry ---- */}
      {step === 3 && selectedMatch && (
        <>
          {/* Match + squad summary bar */}
          <div className="glass p-4 flex flex-wrap items-center gap-4 text-sm">
            <div className="text-slate-400">
              Match:{' '}
              <span className="text-white font-medium">
                {selectedMatch.opponent} — {new Date(selectedMatch.date).toLocaleDateString()}
              </span>
            </div>
            <div className="text-slate-400">
              Squad: <span className="text-white font-medium">{selectedSquad.length} players</span>
            </div>
            <button
              onClick={() => setStep(2)}
              className="ml-auto text-blue-400 hover:text-blue-300 underline text-xs"
            >
              Change Squad
            </button>
          </div>

          {/* Batting Entry */}
          <div className="glass p-6">
            <h2 className="text-white text-lg font-semibold border-l-4 border-yellow-400 pl-3 mb-4">
              Batting Entry
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-white/10">
                  <tr>
                    {['Player', 'Runs', 'Balls', '4s', '6s', 'Out', 'Action'].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-yellow-400 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedSquad.map((p, i) => (
                    <tr key={p._id} className="border-b border-white/5 hover:bg-blue-900/10 transition-colors">
                      <td className="px-3 py-2 text-slate-200 whitespace-nowrap">{p.fullName}</td>
                      <td className="px-3 py-2">
                        <input value={entries[i]?.runs ?? ''} onChange={(e) => onEntryChange(i, 'runs', e.target.value)} className={inputCls} />
                      </td>
                      <td className="px-3 py-2">
                        <input value={entries[i]?.balls ?? ''} onChange={(e) => onEntryChange(i, 'balls', e.target.value)} className={inputCls} />
                      </td>
                      <td className="px-3 py-2">
                        <input value={entries[i]?.fours ?? ''} onChange={(e) => onEntryChange(i, 'fours', e.target.value)} className={inputCls} />
                      </td>
                      <td className="px-3 py-2">
                        <input value={entries[i]?.sixes ?? ''} onChange={(e) => onEntryChange(i, 'sixes', e.target.value)} className={inputCls} />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={entries[i]?.out ?? false}
                          onChange={(e) => onEntryChange(i, 'out', e.target.checked)}
                          className="accent-yellow-400"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => submitEntry(i)}
                          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bowling Entry */}
          <div className="glass p-6">
            <h2 className="text-white text-lg font-semibold border-l-4 border-yellow-400 pl-3 mb-4">
              Bowling Entry
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-white/10">
                  <tr>
                    {['Player', 'Balls', 'Runs', 'Wickets', 'Wides', 'No Balls', 'Action'].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-yellow-400 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedSquad.map((p, i) => (
                    <tr key={p._id} className="border-b border-white/5 hover:bg-blue-900/10 transition-colors">
                      <td className="px-3 py-2 text-slate-200 whitespace-nowrap">{p.fullName}</td>
                      <td className="px-3 py-2">
                        <input value={bowlingEntries[i]?.balls ?? ''} onChange={(e) => onBowlingChange(i, 'balls', e.target.value)} className={inputCls} />
                      </td>
                      <td className="px-3 py-2">
                        <input value={bowlingEntries[i]?.runs ?? ''} onChange={(e) => onBowlingChange(i, 'runs', e.target.value)} className={inputCls} />
                      </td>
                      <td className="px-3 py-2">
                        <input value={bowlingEntries[i]?.wickets ?? ''} onChange={(e) => onBowlingChange(i, 'wickets', e.target.value)} className={inputCls} />
                      </td>
                      <td className="px-3 py-2">
                        <input value={bowlingEntries[i]?.wides ?? ''} onChange={(e) => onBowlingChange(i, 'wides', e.target.value)} className={inputCls} />
                      </td>
                      <td className="px-3 py-2">
                        <input value={bowlingEntries[i]?.noBalls ?? ''} onChange={(e) => onBowlingChange(i, 'noBalls', e.target.value)} className={inputCls} />
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => submitBowling(i)}
                          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
