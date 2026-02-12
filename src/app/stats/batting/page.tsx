type BattingStat = {
  playerId: string
  fullName?: string
  matches?: number
  runs?: number
  balls?: number
  fours?: number
  sixes?: number
  outs?: number
  average?: number | null
  strikeRate?: number
}

export default async function Page() {
  const res = await fetch('/api/stats/batting', { cache: 'no-store' })
  const data: BattingStat[] = (await res.json()) || []

  const stats = Array.isArray(data) ? data.sort((a, b) => (b.runs || 0) - (a.runs || 0)) : []

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Batting Stats</h1>

      {stats.length === 0 ? (
        <div className="p-4 bg-white border rounded text-gray-600">No stats yet</div>
      ) : (
        <div className="overflow-x-auto bg-white border rounded text-black">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Player</th>
                <th className="px-4 py-2 text-right">Runs</th>
                <th className="px-4 py-2 text-right">Balls</th>
                <th className="px-4 py-2 text-right">Outs</th>
                <th className="px-4 py-2 text-right">Average</th>
                <th className="px-4 py-2 text-right">Strike Rate</th>
                <th className="px-4 py-2 text-right">4s</th>
                <th className="px-4 py-2 text-right">6s</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.playerId} className="border-t">
                  <td className="px-4 py-2">{s.fullName ?? 'Unknown'}</td>
                  <td className="px-4 py-2 text-right">{s.runs ?? 0}</td>
                  <td className="px-4 py-2 text-right">{s.balls ?? 0}</td>
                  <td className="px-4 py-2 text-right">{s.outs ?? 0}</td>
                  <td className="px-4 py-2 text-right">{s.average == null ? '-' : Number(s.average).toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{s.strikeRate == null ? '-' : Number(s.strikeRate).toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{s.fours ?? 0}</td>
                  <td className="px-4 py-2 text-right">{s.sixes ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
