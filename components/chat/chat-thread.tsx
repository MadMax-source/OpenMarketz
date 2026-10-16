'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { HandCoins, Mic, SendHorizontal, X } from 'lucide-react'
import { formatPrice, getSeller, products } from '@/lib/data'
import { useShop, type Conversation } from '@/components/shop-provider'
import { VoiceRecorder, type VoiceNote } from '@/components/voice-recorder'
import { cn } from '@/lib/utils'

const time = (at: number) => new Date(at).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' })

export function ChatThread({ conversation }: { conversation: Conversation }) {
  const { sendMessage, markRead, offers } = useShop()
  const [text, setText] = useState('')
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [voiceNote, setVoiceNote] = useState<VoiceNote>()
  const endRef = useRef<HTMLDivElement>(null)
  const product = products.find((p) => p.id === conversation.productId)
  const seller = getSeller(conversation.sellerId)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    if (conversation.unread) markRead(conversation.id)
  }, [conversation.messages.length, conversation.unread, conversation.id, markRead])

  function send() {
    if (!text.trim() && !voiceNote) return
    sendMessage(conversation.id, { text: text.trim() || undefined, voiceNote })
    setText('')
    setVoiceNote(undefined)
    setVoiceOpen(false)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {product && (
        <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-3">
          <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
            <Image src={product.image || '/placeholder.svg'} alt="" fill sizes="44px" className="object-cover" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{product.name}</p>
            <p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4" aria-live="polite">
        {conversation.messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm font-medium">{`Start a chat with ${seller?.name ?? 'the seller'}`}</p>
            <p className="mt-1 max-w-60 text-xs text-muted-foreground">
              {`Ask about condition, delivery or availability. Usually replies ${seller?.responseTime ?? 'quickly'}.`}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {['Is this still available?', 'Can I inspect before paying?', 'Do you deliver to Abuja?'].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage(conversation.id, { text: q })}
                  className="rounded-full border px-3 py-1.5 text-xs hover:bg-muted"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        <ul className="flex flex-col gap-3">
          {conversation.messages.map((m) => {
            const offer = m.offerId ? offers.find((o) => o.id === m.offerId) : undefined
            const mine = m.from === 'buyer'
            return (
              <li key={m.id} className={cn('flex flex-col gap-1', mine ? 'items-end' : 'items-start')}>
                <div
                  className={cn(
                    'flex max-w-[85%] flex-col gap-2 rounded-2xl px-3.5 py-2.5 text-sm',
                    mine ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md bg-muted',
                  )}
                >
                  {offer && mine && (
                    <div className="flex items-center gap-2 rounded-xl bg-background/15 px-2.5 py-2">
                      <HandCoins className="size-4 shrink-0" aria-hidden="true" />
                      <div>
                        <p className="text-xs opacity-80">Offer</p>
                        <p className="font-semibold">{formatPrice(offer.offerPrice)}</p>
                      </div>
                    </div>
                  )}
                  {m.voiceNote && <audio src={m.voiceNote.url} controls className="h-9 w-56 max-w-full" aria-label="Voice note" />}
                  {m.text && <p className="leading-relaxed">{m.text}</p>}
                </div>
                <span className="px-1 text-[10px] text-muted-foreground">{time(m.at)}</span>
              </li>
            )
          })}
        </ul>
        <div ref={endRef} />
      </div>

      <div className="border-t p-3">
        {voiceOpen && (
          <div className="mb-2 flex items-center gap-2">
            <div className="flex-1">
              <VoiceRecorder value={voiceNote} onChange={setVoiceNote} />
            </div>
            <button
              type="button"
              onClick={() => { setVoiceOpen(false); setVoiceNote(undefined) }}
              aria-label="Cancel voice note"
              className="flex size-10 items-center justify-center rounded-full hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
        <form
          onSubmit={(e) => { e.preventDefault(); send() }}
          className="flex items-end gap-2"
        >
          <button
            type="button"
            onClick={() => setVoiceOpen((v) => !v)}
            aria-label="Record voice note"
            aria-pressed={voiceOpen}
            className={cn('flex size-11 shrink-0 items-center justify-center rounded-full border hover:bg-muted', voiceOpen && 'border-primary text-primary')}
          >
            <Mic className="size-4" />
          </button>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                if (e.nativeEvent.isComposing || e.keyCode === 229) return
                e.preventDefault()
                send()
              }
            }}
            rows={1}
            placeholder="Write a message…"
            aria-label="Message"
            className="max-h-32 min-h-11 flex-1 resize-none rounded-3xl border bg-transparent px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={!text.trim() && !voiceNote}
            aria-label="Send message"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
          >
            <SendHorizontal className="size-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
