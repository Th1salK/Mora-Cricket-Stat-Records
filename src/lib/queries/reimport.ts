import type { MatchListRow } from '@/lib/queries/matchRows'
import type { MatchDetails } from '@/lib/import/draft'
export function matchPrefill(match: MatchListRow): MatchDetails {
  return { ...(match.season ? { season: match.season } : {}), date: match.date.slice(0, 10), opponent: match.opponent, venue: match.venue, overs: match.overs, matchType: match.matchType, ...(match.venueName ? { venueName: match.venueName } : {}) }
}
