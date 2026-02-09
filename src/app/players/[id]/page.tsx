import { connectDB } from '@/lib/mongodb' //ensure mongodb connection
import Player from '@/models/Player' //lets me query players collection

type PlayerPageProps = {
  params: Promise<{
    id: string
  }>
}

function initials(name?: string) {
  if (!name) return ''
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  //unwrap async route params
  const { id } = await params

  //connect mongodb
  await connectDB()

  //get player by ID
  const player = await Player.findById(id).lean()

  //handle missing player
  if (!player) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-start justify-center">
        <div className="max-w-2xl w-full text-black">
          <div className="rounded-xl shadow p-6 bg-white">
            <h1 className="text-xl font-semibold text-red-600">Player not found</h1>
          </div>
        </div>
      </div>
    )
  }

  //fetch batting stats aggregated
  const battingFetch = await fetch('http://localhost:3000/api/stats/batting', { cache: 'no-store' })

  const battingStats = await battingFetch.json()

  //find players batting stats
  const batting = battingStats.find((s: any) => s.playerId === player._id.toString())

  //fetch bowling stats aggregated
  const bowlingFetch = await fetch('http://localhost:3000/api/stats/bowling', { cache: 'no-store' })

  const bowlingStats = await bowlingFetch.json()

  //find players bowling stats
  const bowling = bowlingStats.find((s: any) => s.playerId === player._id.toString())

  //page
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Player Header Card */}
        <div className="rounded-xl shadow p-6 bg-white flex items-center gap-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {initials(player.fullName)}
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{player.fullName}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">{player.role}</span>
              <span className="text-sm text-gray-600">Batting: <span className="font-medium text-gray-900">{player.battingStyle ?? '—'}</span></span>
              <span className="text-sm text-gray-600">Bowling: <span className="font-medium text-gray-900">{player.bowlingStyle ?? '—'}</span></span>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Batting Summary Card */}
          <div className="rounded-xl shadow p-6 bg-white">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Batting Summary</h2>

            {!batting ? (
              <div className="text-gray-500">No batting data available</div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Runs</div>
                  <div className="text-2xl font-bold text-gray-900">{batting.runs ?? 0}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Balls</div>
                  <div className="text-2xl font-bold text-gray-900">{batting.balls ?? 0}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">Outs</div>
                  <div className="text-2xl font-bold text-gray-900">{batting.outs ?? 0}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Average</div>
                  <div className="text-2xl font-bold text-gray-900">{batting.average == null ? '—' : Number(batting.average).toFixed(2)}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">Strike Rate</div>
                  <div className="text-2xl font-bold text-gray-900">{batting.strikeRate == null ? '—' : Number(batting.strikeRate).toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">4s</div>
                  <div className="text-2xl font-bold text-gray-900">{batting.fours ?? 0}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">6s</div>
                  <div className="text-2xl font-bold text-gray-900">{batting.sixes ?? 0}</div>
                </div>
              </div>
            )}
          </div>

          {/* Bowling Summary Card */}
          <div className="rounded-xl shadow p-6 bg-white">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bowling Summary</h2>

            {!bowling ? (
              <div className="text-gray-500">No bowling data available</div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Balls</div>
                  <div className="text-2xl font-bold text-gray-900">{bowling.balls ?? 0}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Runs</div>
                  <div className="text-2xl font-bold text-gray-900">{bowling.runs ?? 0}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">Wickets</div>
                  <div className="text-2xl font-bold text-gray-900">{bowling.wickets ?? 0}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Average</div>
                  <div className="text-2xl font-bold text-gray-900">{bowling.average == null ? '—' : Number(bowling.average).toFixed(2)}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">Economy</div>
                  <div className="text-2xl font-bold text-gray-900">{bowling.economy == null ? '—' : Number(bowling.economy).toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Strike Rate</div>
                  <div className="text-2xl font-bold text-gray-900">{bowling.strikeRate == null ? '—' : Number(bowling.strikeRate).toFixed(2)}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">Wides</div>
                  <div className="text-2xl font-bold text-gray-900">{bowling.wides ?? 0}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">No Balls</div>
                  <div className="text-2xl font-bold text-gray-900">{bowling.noBalls ?? 0}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
