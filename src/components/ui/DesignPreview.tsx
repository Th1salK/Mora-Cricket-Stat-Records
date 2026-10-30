'use client'
import { Suspense, useState } from 'react'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { UrlSearch, UrlSelect } from '@/components/ui/UrlControls'
import { ExportCsv } from '@/components/ui/ExportCsv'
import { LeaderCard } from '@/components/ui/LeaderCard'
import { RunsChart } from '@/components/ui/RunsChart'
import { Banner } from '@/components/ui/Banner'
import { Stepper } from '@/components/ui/Stepper'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EditDrawer } from '@/components/ui/EditDrawer'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { ShareButton } from '@/components/ui/ShareButton'
import { PlayerCard } from '@/components/ui/PlayerCard'
import { MatchList } from '@/components/ui/MatchList'
import { Button } from '@heroui/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { SectionCard } from '@/components/ui/SectionCard'
import { StatTile, type StatTone } from '@/components/ui/StatTile'
import { MatchTypeBadge } from '@/components/ui/MatchTypeBadge'
import { ResultBadge } from '@/components/ui/ResultBadge'
import { RoleChip } from '@/components/ui/RoleChip'
import { PlayerAvatar } from '@/components/ui/PlayerAvatar'
import { RankBadge } from '@/components/ui/RankBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { icons, Trophy, Ball, Bat, Calendar, Search } from '@/components/ui/icons'
import { MATCH_TYPES } from '@/lib/constants'
import { ResultBar } from '@/components/ui/ResultBar'
import { SeasonSelector } from '@/components/shell/SeasonSelector'
import type { Outcome, PlayerRole } from '@/lib/ui/formatColors'

const roles: PlayerRole[] = ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper']
const outcomes: Outcome[] = ['won', 'lost', 'draw', 'tie', 'no result']
const variants = ['primary', 'secondary', 'ghost', 'outline', 'danger', 'tertiary', 'danger-soft'] as const
const tones: StatTone[] = ['default', 'teal', 'ball', 'gold', 'brand']
const typeScale = [
  ['Display / Hero', 'font-display text-5xl leading-none tracking-[0.01em] uppercase md:text-8xl', 'Mora Cricket'],
  ['Display / H1', 'font-display text-4xl leading-none tracking-[0.01em] uppercase md:text-[52px]', 'Batting stats'],
  ['Stat L', 'text-4xl leading-[1.2] font-semibold tracking-[-0.015em] tabular-nums', '412'],
  ['Stat M', 'text-2xl leading-[1.25] font-semibold tracking-[-0.01em] tabular-nums', '72*'],
  ['Heading / H2', 'text-[22px] leading-[1.28] font-bold tracking-[-0.01em]', 'Season leaders'],
  ['Heading / H3', 'text-[17px] leading-[1.4] font-semibold tracking-[-0.005em]', 'Recent matches'],
  ['Body / L', 'text-base leading-6', 'Cricket statistics for the team.'],
  ['Body / M', 'text-sm leading-[1.43]', 'Per-player batting performance'],
  ['Body / M Strong', 'text-sm leading-[1.43] font-semibold', 'Behan Inuka'],
  ['Body / S', 'text-xs leading-[1.33]', 'Based on six matches'],
  ['Label / Small', 'text-xs leading-[1.33] font-medium text-teal', 'Statistics'],
  ['Table / Head', 'text-xs leading-[1.33] font-semibold text-text-secondary', 'Average'],
  ['Table / Cell', 'text-sm leading-[1.43] font-medium tabular-nums', '31.69'],
] as const

export function DesignPreview() {
  const [dialog, setDialog] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [message, setMessage] = useState('Preview actions do not change team data.')
  return <div className="space-y-4 md:space-y-5">
    <PageHeader eyebrow="Development only" title="Design system" subtitle="Sample content for shared UI components. These are not team statistics."
      actions={<Button onPress={() => setMessage('Sample primary action pressed.')}><Trophy />Sample action</Button>} />
    <p role="status" aria-live="polite" className="text-sm text-text-secondary">{message}</p>

    <SectionCard title="HeroUI buttons" subtitle="Real v3 variants. Ghost is the low-emphasis option; there is no light variant.">
      <div className="flex flex-wrap gap-3">
        {variants.map((variant) => <Button key={variant} variant={variant} onPress={() => setMessage(`Sample ${variant} button pressed.`)}>{variant}</Button>)}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button size="sm" variant="secondary" onPress={() => setMessage('Small button pressed.')}>Small</Button>
        <Button size="md" variant="secondary" onPress={() => setMessage('Medium button pressed.')}>Medium</Button>
        <Button size="lg" variant="secondary" onPress={() => setMessage('Large button pressed.')}>Large</Button>
        <Button isIconOnly variant="ghost" aria-label="Sample search" onPress={() => setMessage('Search icon button pressed.')}><Search /></Button>
        <Button isDisabled>Disabled</Button>
      </div>
    </SectionCard>

    <SectionCard title="Season selector" subtitle="Sample seasons for keyboard and URL checks; no database records are changed.">
      <div className="max-w-xs">
        <SeasonSelector seasons={[{ id: 'preview-2026', name: '2026', matchCount: 15 }, { id: 'preview-2025', name: '2025', matchCount: 22 }]} currentSeasonId="preview-2026" />
      </div>
    </SectionCard>

    <SectionCard title="Stat tiles" subtitle="All five tones; sample values only."
      action={<Button variant="ghost" size="sm" onPress={() => setMessage('Section action pressed.')}>Section action</Button>}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {tones.map((tone, index) => <StatTile key={tone} tone={tone} label={tone} value={['15', '412', '24', '72*', '10'][index]}
          hint="Sample value" icon={index === 2 ? <Ball /> : <Bat />} />)}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <StatTile label="Large sample value" value="412" icon={<Bat />} tone="teal" large />
        <StatTile label="Missing sample average" value="–" hint="Not out in every innings" />
      </div>
    </SectionCard>

    <SectionCard title="Badges and chips" subtitle="Every format, outcome and player role.">
      <div className="flex flex-wrap gap-2">{MATCH_TYPES.map((matchType) => <MatchTypeBadge key={matchType} matchType={matchType} />)}</div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {outcomes.map((outcome) => <ResultBadge key={outcome} outcome={outcome} />)}
        <ResultBadge outcome={null} /><ResultBadge outcome="won" internal />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">{roles.map((role) => <RoleChip key={role} role={role} />)}</div>
    </SectionCard>

    <SectionCard title="Avatars and ranks" subtitle="Initials, all roles, four sizes and the empty-name fallback.">
      <div className="flex flex-wrap items-center gap-4">
        {([28, 40, 56, 72] as const).map((size, index) => <PlayerAvatar key={size} name="Behan Inuka" role={roles[index]} size={size} />)}
        <PlayerAvatar name="Behan" /><PlayerAvatar name="" />
      </div>
      <div className="mt-4 flex gap-3">{[1, 2, 3, 4, 12].map((rank) => <RankBadge key={rank} rank={rank} />)}</div>
    </SectionCard>

    <EmptyState icon={<Calendar size={22} />} title="No sample matches" message="Try a different season or match type."
      action={<Button variant="secondary" onPress={() => setMessage('Sample empty-state action pressed.')}>Reset sample filters</Button>} />

    <SectionCard title="Outline icons" subtitle="24 × 24 viewBox, 1.75px stroke; no icon package.">
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-8">
        {Object.entries(icons).map(([name, Icon]) => <div key={name} className="flex flex-col items-center gap-2 rounded-[12px] bg-surface-secondary p-3">
          <Icon size={22} /><span className="text-xs text-text-secondary">{name}</span>
        </div>)}
      </div>
    </SectionCard>

    <SectionCard title="Result bars" subtitle="Wins, losses, drawn/tied games and no results remain distinguishable.">
      <ResultBar won={3} lost={2} draw={1} tie={0} noResult={0} />
      <div className="mt-4"><ResultBar won={0} lost={0} draw={0} tie={0} noResult={0} /></div>
    </SectionCard>


    <SectionCard title="Filters and actions" subtitle="Preview filters update this URL only."><div className="flex flex-wrap gap-3"><FilterTabs label="Sample filters" options={[{ label: 'All', href: '/design', active: true }, { label: 'Practice', href: '/design?matchType=Practice', active: false }]} /><Suspense><UrlSearch placeholder="Search sample players" /><UrlSelect label="Sample sort" name="sort" value="newest" options={[{ id: 'newest', label: 'Newest first' }, { id: 'oldest', label: 'Oldest first' }]} /></Suspense><ExportCsv csv={'Player,Runs\r\nSample player,72'} name="sample-preview" /><ShareButton /></div></SectionCard>
    <SectionCard title="Leaders, player cards and charts" subtitle="Illustrative sample values only."><div className="grid gap-5 md:grid-cols-2"><LeaderCard rank={1} name="Sample Player" role="Batsman" href="/design" value="72" unit="Runs" stats={[{ label: 'Average', value: '36.00' }]} /><PlayerCard player={{ id: 'sample', fullName: 'Sample Player', shortName: 'Sample', aliases: [], role: 'Batsman', isActive: true, battingStyle: null, bowlingStyle: null, matches: 1, runs: 72, wickets: 0 }} seasonId="all" seasonLabel="Sample season" /><RunsChart rows={[{ date: '2026-01-01', runs: 15 }, { date: '2026-01-02', runs: 72 }]} /></div></SectionCard>
    <SectionCard title="Match rows"><MatchList rows={[{ id: 'sample', date: '2026-01-01', opponent: 'Sample opponent', venue: 'Home', venueName: null, matchType: 'Friendly', overs: 20, mora: null, opposition: null, outcome: null, margin: null, marginType: null, isInternal: false, source: 'manual' }]} /></SectionCard>
    <SectionCard title="Alerts, steps and overlays"><div className="space-y-4">{(['info', 'warning', 'error', 'success'] as const).map((tone) => <Banner key={tone} tone={tone}>Sample {tone} notice</Banner>)}<Stepper step={3} /><div className="flex gap-3"><Button onPress={() => setDialog(true)}>Preview confirmation</Button><Button variant="secondary" onPress={() => setDrawer(true)}>Preview drawer</Button></div><ConfirmDialog open={dialog} title="Sample confirmation" onClose={() => setDialog(false)} onConfirm={() => { setMessage('Sample confirmed.'); setDialog(false) }}>This preview does not change team data.</ConfirmDialog><EditDrawer title="Sample edit panel" open={drawer} onClose={() => setDrawer(false)}><label className="block text-sm">Sample name<input className="ui-field mt-2" defaultValue="Sample Player" /></label></EditDrawer></div></SectionCard>
    <SectionCard title="Loading state"><PageSkeleton kind="profile" /></SectionCard>

    <SectionCard title="Type scale" subtitle="Inter for content; uppercase Jersey 25 only for display text.">
      <div className="space-y-5">
        {typeScale.map(([label, className, sample]) => <div key={label}>
          <p className="mb-2 text-xs text-text-secondary">{label}</p>
          <p className={className}>{sample}</p>
        </div>)}
      </div>
    </SectionCard>
  </div>
}
