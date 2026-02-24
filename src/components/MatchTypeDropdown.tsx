'use client'

const MATCH_TYPES = ['Home and Home', 'Practice', 'Div 3', 'Inter Uni', 'SLUG'] as const

interface MatchTypeDropdownProps {
  value: string
  onChange: (val: string) => void
  includeAll?: boolean
}

export default function MatchTypeDropdown({ value, onChange, includeAll = true }: MatchTypeDropdownProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="glass-select"
    >
      {includeAll && <option value="All">All</option>}
      {MATCH_TYPES.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  )
}
