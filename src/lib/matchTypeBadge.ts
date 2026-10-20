import type { MatchTypeValue } from "@/lib/constants"

export function getMatchTypeBadgeClass(matchType: string): string {
  const map: Record<MatchTypeValue, string> = {
    'Home and Home': 'badge badge-home-and-home',
    'Practice': 'badge badge-practice',
    'Friendly': 'badge badge-friendly',
    'Div 3': 'badge badge-div3',
    'Inter Uni': 'badge badge-inter-uni',
    'SLUG': 'badge badge-slug',
  }
  return map[matchType as MatchTypeValue] || 'badge'
}
