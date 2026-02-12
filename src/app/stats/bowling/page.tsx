type BowlingStat = {
  playerId: string
  fullName?: string
  matches?: number
  balls?: number
  runs?: number
  wickets?: number
  wides?: number
  noBalls?: number
  average?: number | null
  economy?: number | null
  strikeRate?: number | null
}

export default async function Page() {
  const res = await fetch('{process.env.NEXT_PUBLIC_BASE_URL}/api/stats/bowling', { cache: 'no-store' })
  const data: BowlingStat[] = (await res.json()) || []

  const stats = Array.isArray(data) ? data.sort((a, b) => (b.wickets || 0) - (a.wickets || 0)) : []

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Bowling Stats</h1>

      {stats.length === 0 ? (
        <div className="p-4 bg-white border rounded text-gray-600 ">No stats yet</div>
      ) : (
        <div className="overflow-x-auto bg-white border rounded text-black">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Player</th>
                <th className="px-4 py-2 text-right">Balls</th>
                <th className="px-4 py-2 text-right">Runs</th>
                <th className="px-4 py-2 text-right">Wickets</th>
                <th className="px-4 py-2 text-right">Average</th>
                <th className="px-4 py-2 text-right">Economy</th>
                <th className="px-4 py-2 text-right">Strike Rate</th>
                <th className="px-4 py-2 text-right">Wides</th>
                <th className="px-4 py-2 text-right">No-balls</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.playerId} className="border-t">
                  <td className="px-4 py-2">{s.fullName ?? 'Unknown'}</td>
                  <td className="px-4 py-2 text-right">{s.balls ?? 0}</td>
                  <td className="px-4 py-2 text-right">{s.runs ?? 0}</td>
                  <td className="px-4 py-2 text-right">{s.wickets ?? 0}</td>
                  <td className="px-4 py-2 text-right">{s.average == null ? '-' : Number(s.average).toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{s.economy == null ? '-' : Number(s.economy).toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{s.strikeRate == null ? '-' : Number(s.strikeRate).toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{s.wides ?? 0}</td>
                  <td className="px-4 py-2 text-right">{s.noBalls ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
