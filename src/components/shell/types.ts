export type ShellSeason = { id: string; name: string; matchCount: number }
export type ShellProps = {
  isAdmin: boolean
  isSuperadmin?: boolean
  seasons: ShellSeason[]
  currentSeasonId: string | null
  hasLogo: boolean
}
