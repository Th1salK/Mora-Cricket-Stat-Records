'use client'
import { useEffect } from 'react'
import { Button, Drawer } from '@heroui/react'
import { Close } from '@/components/ui/icons'
import { ShellPanel } from '@/components/shell/ShellPanel'
import type { ShellProps } from '@/components/shell/types'

export function MobileDrawer({ onOpenChange, ...props }: ShellProps & {
  onOpenChange: (open: boolean) => void
}) {
  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)')
    const closeOnDesktop = () => { if (media.matches) onOpenChange(false) }
    media.addEventListener('change', closeOnDesktop)
    return () => media.removeEventListener('change', closeOnDesktop)
  }, [onOpenChange])
  return <Drawer.Backdrop variant="opaque">
      <Drawer.Content placement="left">
        <Drawer.Dialog id="mobile-navigation" className="max-w-[90vw] overflow-y-auto border-r border-separator bg-background px-4 py-6">
          <Drawer.Heading className="sr-only">Navigation menu</Drawer.Heading>
          <ShellPanel {...props} onNavigate={() => onOpenChange(false)} closeAction={
            <Button variant="ghost" isIconOnly aria-label="Close navigation menu" onPress={() => onOpenChange(false)}><Close size={22} /></Button>
          } />
        </Drawer.Dialog>
      </Drawer.Content>
  </Drawer.Backdrop>
}
