'use client'
import type { ReactNode } from 'react'
import { Button, Modal } from '@heroui/react'
export function ConfirmDialog({ open, title, children, confirmLabel = 'Confirm', danger = false, busy = false, onClose, onConfirm }: { open: boolean; title: string; children: ReactNode; confirmLabel?: string; danger?: boolean; busy?: boolean; onClose: () => void; onConfirm: () => void | Promise<void> }) {
  return <Modal.Backdrop isOpen={open} onOpenChange={(value) => { if (!value && !busy) onClose() }}><Modal.Container size="sm"><Modal.Dialog className="w-full max-w-[460px] rounded-[16px] border border-separator bg-surface p-6"><Modal.Header><Modal.Heading className="text-xl font-semibold">{title}</Modal.Heading></Modal.Header><Modal.Body className="py-5 text-sm text-text-secondary">{children}</Modal.Body><Modal.Footer><Button variant="secondary" isDisabled={busy} onPress={onClose}>Cancel</Button><Button variant={danger ? 'danger' : 'primary'} isDisabled={busy} onPress={onConfirm}>{busy ? 'Working…' : confirmLabel}</Button></Modal.Footer></Modal.Dialog></Modal.Container></Modal.Backdrop>
}
