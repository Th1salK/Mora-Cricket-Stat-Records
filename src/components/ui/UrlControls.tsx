'use client'
import { useEffect, useRef, useState } from 'react'
import { SearchField, Select, ListBox } from '@heroui/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
export function UrlSearch({ placeholder }: { placeholder: string }) {
  const params = useSearchParams(), router = useRouter(), pathname = usePathname()
  const query = params.get('q') ?? ''
  const [value, setValue] = useState(query)
  const [previousQuery, setPreviousQuery] = useState(query)
  if (previousQuery !== query) { setPreviousQuery(query); setValue(query) }
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  return <SearchField aria-label={placeholder} value={value} onChange={(next) => {
    setValue(next); clearTimeout(timer.current)
    timer.current = setTimeout(() => { const url = new URLSearchParams(window.location.search); if (next) url.set('q', next); else url.delete('q'); url.delete('page'); router.replace(`${pathname}?${url}`) }, 300)
  }}><SearchField.Group className="min-h-10"><SearchField.SearchIcon /><SearchField.Input className="min-h-10" placeholder={placeholder} /></SearchField.Group></SearchField>
}
export function UrlSelect({ label, name, value, options }: { label: string; name: string; value: string; options: { id: string; label: string }[] }) {
  const params = useSearchParams(), router = useRouter(), pathname = usePathname()
  return <Select aria-label={label} value={value} onChange={(key) => { if (key === null) return; const url = new URLSearchParams(params.toString()); url.set(name, String(key)); url.delete('page'); router.push(`${pathname}?${url}`) }}>
    <Select.Trigger className="min-h-10 min-w-36 bg-surface-secondary"><Select.Value /><Select.Indicator /></Select.Trigger>
    <Select.Popover><ListBox>{options.map((option) => <ListBox.Item key={option.id} id={option.id} textValue={option.label}>{option.label}<ListBox.ItemIndicator /></ListBox.Item>)}</ListBox></Select.Popover>
  </Select>
}
