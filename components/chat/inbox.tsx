'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { useShop } from '@/components/shop-provider'
import { getSeller, products } from '@/lib/data'
import { ChatThread } from '@/components/chat/chat-thread'
import { cn } from '@/lib/utils'

export function Inbox() {
  const { conversations } = useShop()
  const [activeId, setActiveId] = useState<string | null>(null)
  const active = conversations.find((c) => c.id === activeId)

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed py-20 text-center">
        <MessageCircle className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="mt-4 font-medium">No conversations yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Tap “Chat seller” on any product to start one.</p>
        <Link href="/products" className="mt-4 text-sm font-medium text-primary hover:underline">Browse products</Link>
      </div>
    )
  }

  return (
    <div className="grid h-[calc(100dvh-14rem)] min-h-[480px] overflow-hidden rounded-3xl border bg-card md:grid-cols-[320px_1fr]">
      <ul className={cn('overflow-y-auto border-r', active && 'hidden md:block')} aria-label="Conversations">
        {conversations.map((c) => {
          const seller = getSeller(c.sellerId)
          const product = products.find((p) => p.id === c.productId)
          const last = c.messages.at(-1)
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setActiveId(c.id)}
                aria-current={c.id === activeId}
                className={cn('flex w-full items-center gap-3 border-b p-4 text-left transition-colors', c.id === activeId ? 'bg-muted' : 'hover:bg-muted/50')}
              >
                <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <Image src={product?.image || '/placeholder.svg'} alt="" fill sizes="48px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{seller?.name}</p>
                    {c.unread > 0 && (
                      <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">{c.unread}</span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{product?.name}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {last ? (last.voiceNote ? 'Voice note' : last.offerId && !last.text ? 'Price offer' : last.text) : 'Say hello'}
                  </p>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
      <div className={cn('flex min-h-0 flex-col', !active && 'hidden md:flex')}>
        {active ? (
          <>
            <button type="button" onClick={() => setActiveId(null)} className="flex items-center gap-1.5 border-b px-4 py-2 text-sm text-muted-foreground md:hidden">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Conversations
            </button>
            <ChatThread conversation={active} />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Select a conversation</div>
        )}
      </div>
    </div>
  )
}
