'use client'
import { Button } from '@heroui/react'
export function ExportCsv({ csv, name }: { csv: string; name: string }) {
  return <Button variant="secondary" onPress={() => {
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a'); link.href = url; link.download = `${name}.csv`; link.click(); URL.revokeObjectURL(url)
  }}>Export CSV</Button>
}
