import Link from 'next/link'

export default function Home() {

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Team Header */}
        <header className="text-center">
          <div className="mx-auto w-28 h-28 rounded-full overflow-hidden bg-white shadow flex items-center justify-center">
            <img src="https://via.placeholder.com/96?text=M" alt="Mora Cricket Team" className="w-full h-full object-cover" />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Mora Cricket Team</h1>
        </header>

        {/* Quick Actions */}
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div>
            <Link href="/stats/enter" className="inline-block bg-blue-600 text-white px-5 py-3 rounded-md text-sm font-medium hover:bg-blue-700">
              Enter Match Stats
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
