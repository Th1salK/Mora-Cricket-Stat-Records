'use client'
import type { ReactNode } from 'react'
import { Button, Drawer } from '@heroui/react'
export function EditDrawer({ title, open, onClose, children }: { title: string; open: boolean; onClose: () => void; children: ReactNode }) {
  return <Drawer.Backdrop isOpen={open} onOpenChange={(value) => { if (!value) onClose() }}><Drawer.Content placement="right"><Drawer.Dialog className="w-[440px] max-w-[100vw] overflow-y-auto border-l border-separator bg-background p-6"><div className="mb-6 flex items-center justify-between"><Drawer.Heading className="text-xl font-semibold">{title}</Drawer.Heading><Button variant="ghost" isIconOnly aria-label="Close edit panel" onPress={onClose}>×</Button></div><Drawer.Body>{children}</Drawer.Body></Drawer.Dialog></Drawer.Content></Drawer.Backdrop>
}
