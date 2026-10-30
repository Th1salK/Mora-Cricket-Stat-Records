import Image from 'next/image'
import Link from 'next/link'

export function ShellBrand({ hasLogo, compact = false }: { hasLogo: boolean; compact?: boolean }) {
  return <Link href="/" aria-label="Mora Cricket home" className="flex min-h-10 items-center gap-3 rounded-[8px]">
    {hasLogo ? <Image src="/brand/mora-logo.png" alt="" width={36} height={30} className="shrink-0" />
      : <span aria-hidden="true" className="inline-flex h-[30px] w-9 shrink-0 items-center justify-center rounded-[8px] bg-brand-soft text-sm font-bold text-accent">MC</span>}
    <span>
      <span className={compact ? 'block font-display text-xl leading-none uppercase' : 'block font-display text-[22px] leading-none uppercase'}>Mora Cricket</span>
      {!compact && <span className="mt-1 block text-xs leading-4 text-teal-bright">Stats Hub</span>}
    </span>
  </Link>
}
