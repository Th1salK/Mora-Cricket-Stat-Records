'use client'
import { Button } from '@heroui/react'
import { EmptyState } from '@/components/ui/EmptyState'
export default function PageError({ retry }: { retry: () => void }) { return <EmptyState title="We couldn’t load this page" message="Please try again. If it keeps happening, return to the dashboard and try later." action={<Button onPress={retry}>Try again</Button>} /> }
