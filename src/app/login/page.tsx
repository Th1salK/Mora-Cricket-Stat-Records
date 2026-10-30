import Image from 'next/image'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth'
import LoginForm from '@/app/login/LoginForm'
import { Shield } from '@/components/ui/icons'
export default async function LoginPage() {
  if (await isAdmin()) redirect('/')
  const photo = existsSync(join(process.cwd(), 'public/images/team-celebration.jpg'))
  return <div className="grid min-h-dvh md:grid-cols-[1.1fr_1fr]"><section className="relative flex min-h-64 flex-col justify-end overflow-hidden bg-linear-to-br from-brand-deep to-background p-6 md:min-h-dvh md:p-12">{photo && <Image src="/images/team-celebration.jpg" alt="University of Moratuwa cricket team celebrating" fill priority className="object-cover" sizes="55vw" />}<div className="absolute inset-0 bg-linear-to-t from-background to-background/30" /><div className="relative"><p className="mb-6 text-sm text-teal-bright">Mora Cricket · Stats Hub</p><h1 className="font-display text-4xl uppercase md:text-5xl">Run the scorebook.</h1><p className="mt-4 max-w-md text-sm text-text-secondary">Add matches, enter scorecards and keep every player’s numbers up to date for the whole team.</p><ul className="mt-5 hidden space-y-3 text-sm md:block">{['Enter batting and bowling scorecards in minutes', 'Stats and leaderboards update instantly', 'Manage the squad and match list'].map((s) => <li key={s}><span className="mr-3 text-teal-bright">✓</span>{s}</li>)}</ul></div></section><section className="flex items-center justify-center px-6 py-10 md:p-12"><div className="w-full max-w-[460px]"><span className="mb-6 inline-flex rounded-[14px] bg-brand-soft p-3 text-brand-hover"><Shield size={24} /></span><h2 className="text-3xl font-semibold">Admin login</h2><p className="mt-3 mb-7 text-sm text-text-secondary">Sign in to manage matches, players and stats.</p><LoginForm /></div></section></div>
}
