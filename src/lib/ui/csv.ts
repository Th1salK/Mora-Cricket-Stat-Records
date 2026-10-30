export type CsvColumn<T> = { label: string; value: (row: T) => unknown }
export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]) {
  const cell = (value: unknown) => { const text = value == null ? '' : String(value); return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text }
  return [columns.map((column) => cell(column.label)).join(','), ...rows.map((row) => columns.map((column) => cell(column.value(row))).join(','))].join('\r\n')
}
