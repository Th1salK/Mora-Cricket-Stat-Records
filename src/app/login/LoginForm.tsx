'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@heroui/react'
import { Banner } from '@/components/ui/Banner'

export default function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }

      router.push('/')
      router.refresh()
    } catch {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return <form onSubmit={onSubmit} className="space-y-6"><label className="block text-sm font-medium">Username<input name="username" autoComplete="username" required value={username} onChange={(e) => setUsername(e.target.value)} className="ui-field mt-2" /></label><label className="block text-sm font-medium">Password<span className="relative mt-2 block"><input type={showPassword ? 'text' : 'password'} name="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="ui-field pr-20" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-2 min-w-14 text-xs text-text-secondary">{showPassword ? 'Hide' : 'Show'}</button></span></label>{error && <Banner tone="error">{error}</Banner>}<Button type="submit" isDisabled={loading} className="w-full">{loading ? 'Signing in…' : 'Sign in'}</Button><div className="flex flex-wrap justify-between gap-4 border-t border-separator pt-5 text-xs text-text-secondary"><Link href="/" className="min-h-10 py-2">← Back to dashboard</Link><span className="py-2">Mora Cricket © {new Date().getFullYear()}</span></div></form>
}
