import type { Metadata } from 'next'
import { Inbox } from '@/components/chat/inbox'

export const metadata: Metadata = { title: 'Messages' }

export default function MessagesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 md:px-6">
      <h1 className="mb-6 font-display text-3xl font-semibold tracking-tight">Messages</h1>
      <Inbox />
    </div>
  )
}
