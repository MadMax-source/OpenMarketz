'use client'

import Image from 'next/image'
import { useEffect, useId, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'

type Msg = { id: number; from: 'agent' | 'me'; text: string }

const quickReplies = ['Where is my order?', 'I want a refund', 'Seller verification', 'Payment failed']

function replyFor(text: string) {
  const t = text.toLowerCase()
  if (t.includes('order') || t.includes('track')) return 'I can help with that. Please share your order number (e.g. OMZ-123456) and I will check its delivery status.'
  if (t.includes('refund') || t.includes('return')) return 'Returns are free within 7 days for items not as described. Open the order in My Orders and tap "Request return", or tell me the order number and I will start it for you.'
  if (t.includes('seller') || t.includes('verif')) return 'Seller verification usually takes 24–48 hours after you submit your ID and business details at /sell. I can check the status of your application if you share your store name.'
  if (t.includes('pay')) return 'Sorry about that! If you were debited, the money is reversed automatically within 24 hours. Could you share the last 4 digits of the card or the transfer reference?'
  return 'Thanks for the details. A member of our team will look into this now — you can also reach us on WhatsApp for faster replies.'
}

export function LiveChat({ className, compact = false }: { className?: string; compact?: boolean }) {
  const inputId = useId()
  const [messages, setMessages] = useState<Msg[]>([
    { id: 0, from: 'agent', text: 'Hi, I’m Amaka from OpenMarketz support. How can I help you today?' },
  ])
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const listRef = useRef<HTMLOListElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  function send(text: string) {
    const value = text.trim()
    if (!value || typing) return
    setMessages((m) => [...m, { id: m.length, from: 'me', text: value }])
    setDraft('')
    setTyping(true)
    setTimeout(() => {
      setMessages((m) => [...m, { id: m.length, from: 'agent', text: replyFor(value) }])
      setTyping(false)
    }, 1200)
  }

  return (
    <section aria-label="Live chat with support" className={cn('flex h-[560px] flex-col overflow-hidden rounded-3xl border bg-card', className)}>
      <header className={cn('flex items-center gap-3 border-b p-4', compact && 'hidden')}>
        <span className="relative size-11 shrink-0">
          <Image src="/images/support-agent.png" alt="" fill sizes="44px" className="rounded-full object-cover" />
          <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-card bg-primary" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-semibold">Live chat</h2>
          <p className="text-xs text-muted-foreground">Amaka · Online · replies in ~2 min</p>
        </div>
      </header>

      <ol ref={listRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4" aria-live="polite">
        {messages.map((m) => (
          <li key={m.id} className={cn('max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed', m.from === 'me' ? 'self-end rounded-br-md bg-primary text-primary-foreground' : 'self-start rounded-bl-md bg-muted')}>
            {m.text}
          </li>
        ))}
        {typing && (
          <li className="flex gap-1 self-start rounded-2xl rounded-bl-md bg-muted px-4 py-3" aria-label="Agent is typing">
            {[0, 150, 300].map((d) => <span key={d} className="size-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${d}ms` }} />)}
          </li>
        )}
      </ol>

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2">
        {quickReplies.map((q) => (
          <button key={q} type="button" onClick={() => send(q)} className="h-8 shrink-0 rounded-full border px-3 text-xs font-medium hover:bg-muted">{q}</button>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(draft) }} className="flex gap-2 border-t p-3">
        <label htmlFor={inputId} className="sr-only">Type your message</label>
        <input
          id={inputId}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()
          }}
          placeholder="Type your message…"
          className="h-11 flex-1 rounded-xl border bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button type="submit" aria-label="Send" disabled={!draft.trim() || typing} className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50">
          <Send className="size-4" aria-hidden="true" />
        </button>
      </form>
    </section>
  )
}
