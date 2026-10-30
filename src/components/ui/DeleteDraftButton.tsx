'use client'
import { useState } from 'react'
import { Button } from '@heroui/react'
import { useRouter } from 'next/navigation'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { deleteDraftAction } from '@/lib/actions/importActions'
export function DeleteDraftButton({ id, opponent }: { id: string; opponent: string }) {
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), router = useRouter()
  return <><Button variant="ghost" size="sm" onPress={() => setOpen(true)} aria-label={`Delete draft vs ${opponent}`}>Delete</Button><ConfirmDialog open={open} title="Delete saved draft?" danger confirmLabel="Delete draft" busy={busy} onClose={() => setOpen(false)} onConfirm={async () => { setBusy(true); try { const result = await deleteDraftAction(id); if (!result.ok) setError(result.error ?? 'Could not delete draft'); else { setOpen(false); router.refresh() } } catch { setError('Could not delete draft. Try again.') } finally { setBusy(false) } }}><p>vs {opponent}. This draft cannot be recovered.</p>{error && <p role="alert" className="mt-3 text-danger">{error}</p>}</ConfirmDialog></>
}
