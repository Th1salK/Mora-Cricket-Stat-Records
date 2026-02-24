export function getMatchTypeBadgeClass(matchType: string): string {
  const map: Record<string, string> = {
    'Home and Home': 'badge badge-home-and-home',
    'Practice': 'badge badge-practice',
    'Div 3': 'badge badge-div3',
    'Inter Uni': 'badge badge-inter-uni',
    'SLUG': 'badge badge-slug',
  }
  return map[matchType] || 'badge'
}
