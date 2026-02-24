interface StatCardProps {
  label: string
  value: string | number
  subtitle?: string
}

export default function StatCard({ label, value, subtitle }: StatCardProps) {
  return (
    <div className="glass glass-hover p-5">
      <div className="text-yellow-400 text-3xl font-bold">{value}</div>
      <div className="text-slate-400 text-sm mt-1">{label}</div>
      {subtitle && <div className="text-slate-500 text-xs mt-0.5">{subtitle}</div>}
    </div>
  )
}
