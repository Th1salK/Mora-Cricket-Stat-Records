import Link from 'next/link'

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Team Header */}
      <header>
        <h1 className="text-white text-2xl font-bold">Mora Cricket Team</h1>
        <p className="text-slate-400 text-sm mt-1">Statistics Dashboard</p>
      </header>

      {/* Quick Actions */}
      <section>
        <h2 className="text-white text-lg font-semibold border-l-4 border-yellow-400 pl-3 mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/stats/enter"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg px-5 py-3 transition-colors text-sm"
          >
            Enter Match Stats
          </Link>
          <Link
            href="/career"
            className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/40 font-semibold rounded-lg px-5 py-3 transition-colors text-sm"
          >
            Career Overview
          </Link>
          <Link
            href="/matches"
            className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-semibold rounded-lg px-5 py-3 transition-colors text-sm"
          >
            View Matches
          </Link>
        </div>
      </section>

      {/* Navigation Cards */}
      <section>
        <h2 className="text-white text-lg font-semibold border-l-4 border-yellow-400 pl-3 mb-4">
          Stats
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/stats/batting" className="glass glass-hover p-5 block">
            <div className="text-yellow-400 text-xl font-bold mb-1">Batting</div>
            <div className="text-slate-400 text-sm">View batting statistics by format</div>
          </Link>
          <Link href="/stats/bowling" className="glass glass-hover p-5 block">
            <div className="text-yellow-400 text-xl font-bold mb-1">Bowling</div>
            <div className="text-slate-400 text-sm">View bowling statistics by format</div>
          </Link>
          <Link href="/career" className="glass glass-hover p-5 block">
            <div className="text-yellow-400 text-xl font-bold mb-1">Career</div>
            <div className="text-slate-400 text-sm">All-time stats across all formats</div>
          </Link>
        </div>
      </section>
    </div>
  )
}
