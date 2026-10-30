'use client'
import { useState } from 'react'
import { Button } from '@heroui/react'
export function ShareButton() { const [message, setMessage] = useState('Share'); return <Button aria-label="Copy scorecard link" variant="secondary" onPress={async () => { try { await navigator.clipboard.writeText(location.href); setMessage('Link copied') } catch { setMessage('Copy the URL from your browser') } }}><span role="status">{message}</span></Button> }
