'use client'

import { useState } from 'react'
import { Button } from '@heroui/react'
import DraftReview from '@/components/import/DraftReview'
import type { Draft, MatchDetails } from '@/lib/import/draft'
import type { PlayerLite } from '@/lib/import/matchPlayers'

// Illustrative fixtures for /design only. No server actions or database writes.
const players: PlayerLite[] = [{ id: '111111111111111111111111', fullName: 'Sample Player', shortName: 'Sample', aliases: [] }]
const initialDetails: MatchDetails = { matchType: 'Friendly', date: '2026-01-01', opponent: 'Sample opposition', venue: 'Home', overs: 20 }
const initialDraft: Draft = {
  unreadable: [],
  innings: [
    {
      battingTeam: 'Mora CC', side: 'mora', total: { runs: 6, wickets: 0, overs: '1.0' },
      extras: { byes: 0, legByes: 0, wides: 0, noBalls: 0, penalty: 0 },
      batting: [{ name: 'Sample Player', howOut: 'not out', runs: 6, balls: 6, fours: 1, sixes: 0, match: null, playerId: players[0].id }],
      bowling: [], didNotBat: [],
    },
    {
      battingTeam: 'Sample opposition', side: 'opposition', total: { runs: 0, wickets: 0, overs: '1.0' },
      extras: { byes: 0, legByes: 0, wides: 0, noBalls: 0, penalty: 0 },
      batting: [], didNotBat: [],
      bowling: [{ name: 'Sample Player', overs: '1.0', maidens: 1, runs: 0, wickets: 0, wides: 0, noBalls: 0, match: null, playerId: players[0].id }],
    },
  ],
}

export function ImportReviewPreview({ onBack }: { onBack: () => void }) {
  const [draft, setDraft] = useState(initialDraft)
  const [details, setDetails] = useState(initialDetails)
  const [message, setMessage] = useState('Sample data only. Save and publish previews never change team records.')
  const [duplicate, setDuplicate] = useState(false)
  return <div className="fixed inset-x-0 top-14 bottom-0 z-40 space-y-5 overflow-y-auto bg-background p-4 md:top-0 md:left-64 md:p-10">
    <div className="flex flex-wrap gap-3">
      <Button variant="secondary" onPress={onBack}>Back to component preview</Button>
      <Button variant="secondary" onPress={() => setDuplicate(true)}>Preview duplicate warning</Button>
    </div>
    <p role="status" className="text-sm text-text-secondary">{message}</p>
    <DraftReview draft={draft} players={players} details={details} onDraftChange={setDraft} onDetailsChange={setDetails}
      onSave={() => setMessage('Sample draft saved in this preview only.')} saveLabel="Preview save draft" saving={false}
      onPublish={() => setMessage('Sample publish confirmed. No team records were written.')} publishing={false}
      duplicate={duplicate ? { message: 'Sample duplicate warning; no match is being published.', onPublishAnyway: () => { setMessage('Sample duplicate confirmed. No team records were written.'); setDuplicate(false) }, onDismiss: () => setDuplicate(false) } : null}
      notice="Development preview: sample scorecard for keyboard, warning and mobile action checks." />
  </div>
}
