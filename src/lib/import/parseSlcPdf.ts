import { ExtractionSchema, type Extraction, type Innings } from '@/lib/import/schema'
import { countsAsOut, oversToBalls, parseHowOut } from '@/lib/import/parse'

export type PdfTextItem = { text: string; x: number; y: number }
type Row = PdfTextItem[]
type Table = 'batting' | 'bowling'
type Section = { innings: Innings; mora: boolean; totalSeen: boolean }

function text(row: Row): string { return row.map(item => item.text).join(' ').replace(/\s+/g, ' ').trim() }

function rows(items: PdfTextItem[]): Row[] {
  const result: Row[] = []
  for (const item of [...items].sort((a, b) => b.y - a.y || a.x - b.x)) {
    const last = result[result.length - 1]
    if (last && Math.abs(last[0].y - item.y) < 2) last.push(item)
    else result.push([item])
  }
  return result.map(row => row.sort((a, b) => a.x - b.x))
}

function cleanName(value: string): string {
  return value.replace(/\(\s*(?:RHB|LHB|c|wk)\s*\)|†/gi, ' ').replace(/\s+/g, ' ').trim()
}

function number(value: string, label: string): number {
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) throw new Error(`Could not read ${label}. Use a complete SL Cricket Scorers PDF.`)
  return Number(value)
}

function validOvers(value: string): string {
  if (oversToBalls(value) === null) throw new Error(`Invalid overs "${value}" in the PDF.`)
  return value
}

// Header positions define cells; splitting entire rows on spaces would split player names too.
function cells(row: Row, header: Row): Record<string, string> {
  return Object.fromEntries(header.map((column, i) => [column.text,
    text(row.filter(item => item.x >= column.x - 3 && (i === header.length - 1 || item.x < header[i + 1].x - 3))),
  ]))
}

export function parseSlcPdf(pages: PdfTextItem[][]): Extraction {
  const sections: Section[] = []
  let current: Section | undefined
  let table: Table | null = null
  let header: Row = []
  let pending: Row = []
  let expected = 1

  function finishRow() {
    if (!pending.length || !current || !table) return
    const values = cells(pending, header)
    const position = number(values.No, 'the player row number')
    if (position !== expected || position > 11) throw new Error('The Mora table has missing or duplicate player rows. Check the PDF.')
    expected++
    const name = cleanName(values[table === 'batting' ? 'Batsman' : 'Bowler'])
    if (!name) throw new Error('A Mora player name is missing from the PDF.')
    if (table === 'batting') {
      let howOut = values.Status
      if (!howOut) throw new Error(`The dismissal for ${name} is missing.`)
      if (/^run out\s+[^()]+$/i.test(howOut)) howOut = howOut.replace(/^run out\s+(.+)$/i, 'run out ($1)')
      current.innings.batting.push({ name, howOut, runs: number(values.R, `${name}'s runs`), balls: number(values.B, `${name}'s balls`), fours: number(values['4s'], `${name}'s fours`), sixes: number(values['6s'], `${name}'s sixes`) })
    } else {
      current.innings.bowling.push({ name, overs: validOvers(values.O), maidens: number(values.M, `${name}'s maidens`), runs: number(values.R, `${name}'s runs`), wickets: number(values.W, `${name}'s wickets`), wides: number(values.WD, `${name}'s wides`), noBalls: number(values.NB, `${name}'s no-balls`) })
    }
    pending = []
  }

  for (const page of pages) for (const row of rows(page)) {
    const line = text(row)
    const title = line.match(/^(.+?)\s+(\d+)\/(\d+)\s+\(([\d.]+)\s*Ov\)/i)
    if (title && /\(1st Innings\)/i.test(line)) {
      finishRow()
      table = null
      const team = title[1].trim()
      const total = { runs: Number(title[2]), wickets: Number(title[3]), overs: validOvers(title[4]) }
      if (total.wickets > 10) throw new Error('The PDF innings has more than ten wickets.')
      if (current?.innings.battingTeam === team) {
        if (JSON.stringify(current.innings.total) !== JSON.stringify(total)) throw new Error('Repeated innings headings have different totals.')
        continue
      }
      current = { mora: /\bmora(?:tuwa)?\b/i.test(team), totalSeen: false, innings: { battingTeam: team, total, extras: { byes: null, legByes: null, wides: null, noBalls: null, penalty: null }, batting: [], bowling: [], didNotBat: [] } }
      sections.push(current)
      continue
    }
    if (!current) continue

    const battingHeader = ['No', 'Batsman', 'Status', 'R', 'B', 'M', '4s', '6s', 'SR']
    const bowlingHeader = ['No', 'Bowler', 'O', 'M', 'R', 'W', '0s', '4s', '6s', 'WD', 'NB', 'Eco']
    const keys = row.map(item => item.text)
    const kind = battingHeader.every(key => keys.includes(key)) ? 'batting' : bowlingHeader.every(key => keys.includes(key)) ? 'bowling' : null
    if (kind) {
      finishRow()
      // Never parse opposition batting or opposition bowling rows.
      table = (kind === 'batting' ? current.mora : !current.mora) ? kind : null
      header = row
      expected = current.innings[kind].length + 1
      continue
    }

    if (/^Extras:/i.test(line)) {
      finishRow(); table = null
      const breakdown = line.match(/^Extras:\s*\(([^)]*)\)\s+(\d+)$/i)
      if (!breakdown) throw new Error('Could not read the innings extras breakdown.')
      const extras = { byes: 0, legByes: 0, wides: 0, noBalls: 0, penalty: 0 }
      const labels = { b: 'byes', lb: 'legByes', wd: 'wides', nb: 'noBalls', p: 'penalty', pen: 'penalty' } as const
      const parts = breakdown[1].split(',').map(part => part.trim()).filter(Boolean)
      for (const part of parts) {
        const match = part.match(/^(b|lb|wd|nb|p|pen)\s+(\d+)$/i)
        if (!match) throw new Error(`Unrecognised extras "${part}" in the PDF.`)
        extras[labels[match[1].toLowerCase() as keyof typeof labels]] += Number(match[2])
      }
      if (Object.values(extras).reduce((sum, count) => sum + count, 0) !== Number(breakdown[2])) throw new Error('The PDF extras breakdown does not match its total.')
      current.innings.extras = extras
      continue
    }
    if (/^Total:/i.test(line)) {
      finishRow(); table = null
      const total = line.match(/^Total:\s*Overs\s+([\d.]+),\s*Wickets\s+(\d+)\s+(\d+)\s*\(CRR:/i)
      if (!total || oversToBalls(total[1]) !== oversToBalls(current.innings.total.overs) || Number(total[2]) !== current.innings.total.wickets || Number(total[3]) !== current.innings.total.runs) throw new Error('The innings heading and total do not agree. Check the PDF.')
      current.totalSeen = true
      continue
    }
    if (/^(To Bat:|Fall of Wickets)/i.test(line)) {
      finishRow(); table = null
      if (current.mora && /^To Bat:/i.test(line)) current.innings.didNotBat = line.replace(/^To Bat:\s*/i, '').split(',').map(cleanName).filter(Boolean)
      continue
    }
    if (!table || /Sri Lanka Cricket Scorers Association|TOURNAMENT|^\(Quarter Final\)|^\d+\/\d+\/\d+,|^\d+ of \d+$/i.test(line)) continue
    const values = cells(row, header)
    if (/^\d+$/.test(values.No)) { finishRow(); pending = [...row] }
    else if (pending.length) pending.push(...row)
  }
  finishRow()
  if (sections.length !== 2 || sections.filter(section => section.mora).length !== 1) throw new Error('Could not identify one Mora innings and one opposition innings. Use a complete two-innings SL Cricket Scorers PDF.')
  const mora = sections.find(section => section.mora)!
  const opposition = sections.find(section => !section.mora)!
  if (!mora.innings.batting.length || !opposition.innings.bowling.length) throw new Error('The PDF must contain both Mora batting and Mora bowling tables.')
  if (sections.some(section => !section.totalSeen || Object.values(section.innings.extras).some(value => value === null))) throw new Error('The PDF is missing an innings total or extras breakdown.')
  const dismissals = mora.innings.batting.map(row => parseHowOut(row.howOut))
  if (dismissals.every(dismissal => dismissal.type !== 'other') && dismissals.filter(dismissal => countsAsOut(dismissal.type)).length !== mora.innings.total.wickets) throw new Error('Mora batting dismissals do not match the wickets total. Check that the PDF is complete.')
  if (opposition.innings.bowling.reduce((sum, row) => sum + oversToBalls(row.overs)!, 0) !== oversToBalls(opposition.innings.total.overs)) throw new Error('Mora bowling overs do not match the innings total. Check that the PDF is complete.')
  if (opposition.innings.bowling.reduce((sum, row) => sum + row.wickets!, 0) > opposition.innings.total.wickets!) throw new Error('Mora bowlers have more wickets than the innings total.')
  return ExtractionSchema.parse({ innings: sections.map(section => section.innings), unreadable: [] })
}
