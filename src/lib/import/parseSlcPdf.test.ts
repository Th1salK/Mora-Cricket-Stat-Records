import { describe, expect, it } from 'vitest'
import fixture from '@/lib/import/fixtures/slc-scorecard.json'
import { parseSlcPdf } from '@/lib/import/parseSlcPdf'
import { buildDraft, DraftSchema, draftWarnings, swapSides } from '@/lib/import/draft'
import { buildPublishPayload } from '@/lib/import/publish'
import { parseHowOut } from '@/lib/import/parse'

const pages = () => structuredClone(fixture)
const sample = () => parseSlcPdf(pages())

describe('SL Cricket Scorers PDF', () => {
  it('reads every Mora batting figure from the sample and excludes opposition rows', () => {
    const data = sample()
    expect(data.innings).toHaveLength(2)
    const mora = data.innings[0]
    expect(mora.total).toEqual({ runs: 123, wickets: 10, overs: '42.1' })
    expect(mora.extras).toEqual({ byes: 0, legByes: 1, wides: 8, noBalls: 3, penalty: 0 })
    expect(mora.batting.map(row => [row.name, row.runs, row.balls, row.fours, row.sixes])).toEqual([
      ['Nihan Kuruppu', 1, 9, 0, 0], ['Sathira Vikasitha', 21, 66, 1, 0], ['Shashitha Achintha', 11, 28, 1, 0],
      ['Kavindu Lankeshwara', 2, 10, 0, 0], ['Behan Wickramasinghe', 40, 55, 4, 0], ['Mudusaritha Gangamina', 15, 17, 1, 1],
      ['Kevindu Perera', 0, 2, 0, 0], ['Yasiru Ruwantha', 11, 34, 1, 0], ['Dineth Gamage', 6, 24, 0, 0],
      ['Kasun Chamod', 3, 8, 0, 0], ['Achintha Dilshan', 1, 3, 0, 0],
    ])
    expect(mora.bowling).toEqual([])
    expect(data.innings[1].batting).toEqual([])
    expect(parseHowOut(mora.batting[1].howOut)).toMatchObject({ type: 'run out', fielder: 'Nethum Sanvidu' })
    expect(parseHowOut(mora.batting[8].howOut).type).toBe('not out')
    expect(parseHowOut(mora.batting[3].howOut)).toMatchObject({ type: 'stumped', fielder: 'Isuru Sandamal', bowler: 'Pasindu Denipitiya' })
  })

  it('reads every Mora bowling figure without mistaking dot balls or boundaries for wides', () => {
    const opposition = sample().innings[1]
    expect(opposition.total).toEqual({ runs: 124, wickets: 4, overs: '26.5' })
    expect(opposition.extras).toEqual({ byes: 2, legByes: 1, wides: 9, noBalls: 0, penalty: 0 })
    expect(opposition.bowling.map(row => [row.name, row.overs, row.maidens, row.runs, row.wickets, row.wides, row.noBalls])).toEqual([
      ['Yasiru Ruwantha', '9', 0, 31, 0, 0, 0], ['Achintha Dilshan', '3', 0, 16, 1, 2, 0],
      ['Kasun Chamod', '2', 0, 17, 0, 0, 0], ['Sathira Vikasitha', '1', 0, 4, 0, 1, 0],
      ['Shashitha Achintha', '7', 0, 27, 3, 5, 0], ['Behan Wickramasinghe', '1', 0, 5, 0, 1, 0],
      ['Kevindu Perera', '3.5', 0, 21, 0, 0, 0],
    ])
  })

  it('does not need or parse opposition player tables', () => {
    const input = pages()
    const bowlingY = input[2].find(item => item.text === 'Bowler')!.y
    input[2] = input[2].filter(item => item.y > bowlingY)
    const battingY = input[3].find(item => item.text === 'Batsman')!.y
    const extrasY = input[3].find(item => item.text.startsWith('Extras:'))!.y
    input[3] = input[3].filter(item => item.y > battingY || item.y <= extrasY)
    expect(parseSlcPdf(input)).toEqual(sample())
  })

  it('supports Mora batting second by identifying teams rather than fixed pages', () => {
    const input = pages().slice(2)
    input[0][input[0].findIndex(item => item.text.startsWith('Uni Moratuwa C C 123'))].text = 'Old Joes S C 123/10 (42.1 Ov)'
    input[1][input[1].findIndex(item => item.text.startsWith('Old Joes S C 124'))].text = 'Uni Moratuwa C C 124/4 (26.5 Ov)'
    const data = parseSlcPdf(input)
    expect(data.innings[0].batting).toEqual([])
    expect(data.innings[0].bowling).toHaveLength(6)
    expect(data.innings[1].batting).toHaveLength(6)
    expect(data.innings[1].bowling).toEqual([])
  })

  it('joins wrapped names and tolerates repeated headers on a continuation page', () => {
    const input = pages()
    const name = input[2].find(item => item.text === 'Behan Wickramasinghe (c)')!
    name.text = 'Behan'
    input[2].push({ text: 'Wickramasinghe ( c )', x: name.x, y: name.y - 4 })
    const boundary = input[2].find(item => item.text === 'Mudusaritha Gangamina')!.y
    const repeated = input[2].filter(item => item.y === 713.65 || item.y === 684.39)
    const split = [...input.slice(0, 2), input[2].filter(item => item.y >= boundary), [...repeated, ...input[2].filter(item => item.y < boundary)], input[3]]
    expect(parseSlcPdf(split)).toEqual(sample())
  })

  it.each(['overs', 'extras', 'last-batter', 'last-bowler', 'unknown-team', 'bowler-wickets'])('rejects incomplete or invalid %s data rather than inventing statistics', (kind) => {
    const input = pages()
    if (kind === 'overs') input[3].find(item => item.text === '3.5')!.text = '3.6'
    if (kind === 'extras') input[2].find(item => item.text.startsWith('Extras:'))!.text = 'Extras: (nb 99, wd 8, lb 1)'
    if (kind === 'last-batter') {
      const y = input[2].find(item => item.text === 'Achintha Dilshan')!.y
      input[2] = input[2].filter(item => item.y !== y)
    }
    if (kind === 'last-bowler') {
      const y = input[3].find(item => item.text === 'Kevindu Perera')!.y
      input[3] = input[3].filter(item => item.y !== y)
    }
    if (kind === 'unknown-team') input[2].find(item => item.text.startsWith('Uni Moratuwa C C 123'))!.text = 'Unknown XI 123/10 (42.1 Ov)'
    if (kind === 'bowler-wickets') {
      const y = input[3].find(item => item.text === 'Shashitha Achintha')!.y
      const x = input[3].find(item => item.text === 'W')!.x
      input[3].find(item => item.y === y && item.x === x)!.text = '9'
    }
    expect(() => parseSlcPdf(input)).toThrow()
  })

  it('rejects missing innings and unsupported text', () => {
    expect(() => parseSlcPdf([])).toThrow()
    expect(() => parseSlcPdf([fixture[2]])).toThrow()
  })

  it('survives draft saving and publishes only Mora records without false missing-table warnings', () => {
    const data = sample()
    const players = data.innings[0].batting.map((row, i) => ({ id: `player-${i}`, fullName: row.name, shortName: row.name, aliases: [] }))
    const draft = DraftSchema.parse({ ...buildDraft(data, players, 'Old Joes S C'), moraOnly: true })
    expect(draftWarnings(draft)).toEqual([])
    expect(swapSides(draft, players)).toBe(draft)
    const result = buildPublishPayload({ opponent: 'Old Joes S C', matchType: 'Div 3', date: '2026-06-07', venue: 'Away', overs: 50, result: { outcome: 'lost' } }, draft, players)
    expect(result.payload?.batting).toHaveLength(11)
    expect(result.payload?.bowling).toHaveLength(7)
    expect(result.payload?.match.result).toEqual({ outcome: 'lost', margin: 6, marginType: 'wickets' })
    expect(result.payload?.bowling.find(row => row.playerId === 'player-6')?.balls).toBe(23)
    draft.innings[0].batting[0].runs = 999
    expect(draftWarnings(draft).map(warning => warning.code)).toContain('batting-total')
    expect(draftWarnings(draft).map(warning => warning.code)).toContain('impossible-runs')
    draft.innings[1].bowling[0].overs = '9.6'
    expect(draftWarnings(draft).map(warning => warning.code)).toContain('bad-overs')
  })
})
