import Link from 'next/link'
import { EmptyState } from '@/components/ui/EmptyState'
export default function NotFound() { return <EmptyState title="Page not found" message="This page or record may have moved or been removed." action={<Link href="/" className="button button--primary">Back to dashboard</Link>} /> }
