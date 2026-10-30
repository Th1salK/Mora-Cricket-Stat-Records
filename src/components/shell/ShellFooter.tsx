'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@heroui/react'
import { Lock, Logout } from '@/components/ui/icons'
import { PlayerAvatar } from '@/components/ui/PlayerAvatar'

export function ShellFooter({ isAdmin, onNavigate }: { isAdmin: boolean; onNavigate?: () => void }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function logout() {
    setPending(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (!response.ok) throw new Error('Could not sign out. Please try again.')
      onNavigate?.()
      router.refresh()
      router.push('/')
    } catch {
      setError('Could not sign out. Please try again.')
    } finally { setPending(false) }
  }
  return <footer className="mt-auto border-t border-separator pt-5">
    {isAdmin ? <>
      <div className="flex items-center gap-3">
        <PlayerAvatar name="Admin" size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Team Admin</p>
          <p className="text-xs text-win">Signed in</p>
        </div>
        <Button variant="ghost" isIconOnly aria-label="Sign out" isPending={pending} onPress={logout}><Logout /></Button>
      </div>
      {error && <p role="alert" className="mt-3 text-xs text-danger">{error}</p>}
    </> : <div className="rounded-[14px] bg-surface p-4">
      <p className="text-sm font-semibold">Team admin?</p>
      <p className="mt-2 text-xs leading-4 text-text-secondary">Sign in to add matches and update scorecards.</p>
      <Link href="/login" onNavigate={onNavigate}
        className="mt-4 flex min-h-10 items-center justify-center gap-2 rounded-[12px] bg-brand-pressed px-3 py-2 text-sm font-medium text-accent-foreground hover:bg-brand-deep active:bg-brand-deep">
        <Lock />Admin login
      </Link>
    </div>}
  </footer>
}
