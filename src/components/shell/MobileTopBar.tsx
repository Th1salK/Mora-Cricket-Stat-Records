'use client'
import { Button } from '@heroui/react'
import { Menu } from '@/components/ui/icons'
import { ShellBrand } from '@/components/shell/ShellBrand'

export function MobileTopBar({ hasLogo, isOpen, onOpen }: { hasLogo: boolean; isOpen: boolean; onOpen: () => void }) {
  return <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-separator bg-background px-4 md:hidden">
    <ShellBrand compact hasLogo={hasLogo} />
    <Button variant="ghost" isIconOnly aria-label="Open navigation menu" aria-expanded={isOpen} aria-controls="mobile-navigation" onPress={onOpen}><Menu size={22} /></Button>
  </header>
}
