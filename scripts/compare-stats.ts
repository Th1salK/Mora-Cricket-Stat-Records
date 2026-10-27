import mongoose from 'mongoose'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { connectWithFallback } from '@/lib/mongodb'
import { MATCH_TYPES } from '@/lib/constants'
import { mapMatch, mapBatting, mapBowling } from '@/lib/queries/mapping'
import { comparePlayerStats } from '@/lib/stats/compare'
import Match from '@/models/Match'
import Player from '@/models/Player'
import BattingPerformance from '@/models/BattingPerformance'
import BowlingPerformance from '@/models/BowlingPerformance'

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not defined.')
  // No collections, indexes or records may be created by this comparison.
  mongoose.set('autoCreate', false)
  mongoose.set('autoIndex', false)
  await connectWithFallback(uri)
  try {
    const matches = (await Match.find().select('_id date matchType opponent innings result season').lean()).map(mapMatch)
    const matchMap = new Map(matches.map((match) => [match.matchId, match]))
    const [batDocs, bowlDocs] = await Promise.all([
      BattingPerformance.find().select('matchId playerId runs balls fours sixes out dismissal')
        .populate({ path: 'playerId', model: Player, select: 'fullName isActive' }).lean(),
      BowlingPerformance.find().select('matchId playerId balls runs wickets wides noBalls maidens')
        .populate({ path: 'playerId', model: Player, select: 'fullName isActive' }).lean(),
    ])
    const batting = batDocs.map((row) => mapBatting(row, matchMap)).filter((row) => row !== null)
    const bowling = bowlDocs.map((row) => mapBowling(row, matchMap)).filter((row) => row !== null)
    const scopes = ['All', ...MATCH_TYPES].map((type) => ({
      type, ...comparePlayerStats(batting.filter((row) => type === 'All' || row.matchType === type),
        bowling.filter((row) => type === 'All' || row.matchType === type)),
    }))
    const fieldsCompared = scopes.reduce((sum, scope) => sum + scope.fieldsCompared, 0)
    const differences = scopes.flatMap((scope) => scope.differences.map((difference) => ({ scope: scope.type, ...difference })))
    const expected = differences.filter((row) => row.classification === 'EXPECTED').length
    const unexpected = differences.length - expected
    const uniquePlayers = new Set([...batting, ...bowling].map((row) => row.playerId)).size
    const playerScopes = scopes.reduce((sum, scope) => sum + scope.playersCompared, 0)
    const skipped = batDocs.length + bowlDocs.length - batting.length - bowling.length
    const summary = { playersCompared: uniquePlayers, playerScopeComparisons: playerScopes, fieldsCompared,
      expectedDifferences: expected, unexpectedDifferences: unexpected, orphanRowsSkipped: skipped }
    console.table(summary)
    const day = new Date().toISOString().slice(0, 10)
    const cell = (value: unknown) => String(value).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ')
    const report = [
      '# Stats comparison — ' + day, '', 'Read-only comparison across all seasons, then each match type. No database writes.',
      '', ...Object.entries(summary).map(([key, value]) => '- ' + key + ': ' + value), '',
      'Every numeric/display field exposed by the legacy per-player functions is compared. New-only fields (outs, balls, maidens, innings bowled and the not-out high-score flag) are covered by unit tests.',
      'Orphan records are excluded using the same mapping helpers as the app; inactive players are included in this all-time comparison.',
      '', '| Scope | Player ID | Discipline | Field | Legacy | New | Classification | Explanation |',
      '|---|---|---|---|---:|---:|---|---|',
      ...differences.map((row) => '| ' + [row.scope, row.playerId, row.discipline, row.field, row.legacy, row.current, row.classification, row.reason].map(cell).join(' | ') + ' |'),
      ...(differences.length === 0 ? ['| All | — | — | — | — | — | Equal | No differences |'] : []), '',
      '## Scopes', '', '| Scope | Players | Fields compared | Differences |', '|---|---:|---:|---:|',
      ...scopes.map((scope) => '| ' + [scope.type, scope.playersCompared, scope.fieldsCompared, scope.differences.length].join(' | ') + ' |'), '',
    ].join('\n')
    const output = join(process.cwd(), 'scripts', 'output')
    await mkdir(output, { recursive: true })
    const path = join(output, 'compare-stats-' + day + '.md')
    await writeFile(path, report)
    console.log('Report: ' + path)
    if (unexpected > 0) process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}
main().catch((err) => {
  console.error('Failed to compare stats:', err)
  process.exit(1)
})
