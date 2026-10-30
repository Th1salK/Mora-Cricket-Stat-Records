export type NavIcon = 'Grid' | 'Calendar' | 'Users' | 'Bat' | 'Ball' | 'Trophy' | 'Upload' | 'Edit' | 'List' | 'UserCog' | 'Home' | 'Chart'
export type NavItem = { label: string; href: string; icon: NavIcon }
export type NavGroup = { label: string; items: NavItem[] }

export function navGroups(isAdmin: boolean): NavGroup[] {
  const groups: NavGroup[] = [
    { label: 'Overview', items: [
      { label: 'Dashboard', href: '/', icon: 'Grid' },
      { label: 'Matches', href: '/matches', icon: 'Calendar' },
      { label: 'Players', href: '/players', icon: 'Users' },
    ] },
    { label: 'Statistics', items: [
      { label: 'Batting', href: '/stats/batting', icon: 'Bat' },
      { label: 'Bowling', href: '/stats/bowling', icon: 'Ball' },
      { label: 'Records', href: '/records', icon: 'Trophy' },
    ] },
  ]
  if (isAdmin) groups.push({ label: 'Admin', items: [
    { label: 'Import match', href: '/admin/import', icon: 'Upload' },
    { label: 'Saved drafts', href: '/admin/drafts', icon: 'Edit' },
    { label: 'Manage matches', href: '/admin/matches', icon: 'List' },
    { label: 'Manage players', href: '/admin/players', icon: 'UserCog' },
  ] })
  return groups
}

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== '/' && pathname.startsWith(href + '/'))
}

export const mobileTabs: NavItem[] = [
  { label: 'Home', href: '/', icon: 'Home' },
  { label: 'Matches', href: '/matches', icon: 'Calendar' },
  { label: 'Players', href: '/players', icon: 'Users' },
  { label: 'Stats', href: '/stats/batting', icon: 'Chart' },
  { label: 'Records', href: '/records', icon: 'Trophy' },
]

export function tabActive(pathname: string, href: string): boolean {
  return href === '/stats/batting' ? pathname.startsWith('/stats/') : isActive(pathname, href)
}
