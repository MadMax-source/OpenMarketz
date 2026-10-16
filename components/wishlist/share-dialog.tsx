'use client'

import { useState } from 'react'
import { Check, Copy, Link2, Mail, MessageCircle, Send } from 'lucide-react'
import { toast } from 'sonner'
import { shareUrl, type GiftList } from '@/components/wishlist-provider'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { fieldClass } from '@/components/checkout/checkout-ui'
import { cn } from '@/lib/utils'

export function ShareDialog({ list, open, onOpenChange }: { list: GiftList; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [tab, setTab] = useState<'link' | 'user'>('link')
  const [copied, setCopied] = useState(false)
  const [recipient, setRecipient] = useState('')
  const [message, setMessage] = useState(`Hi! I made a wishlist on OpenMarketz for my ${list.occasion.replace('-', ' ')}. You can pay for any item and it gets delivered to me.`)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const url = open ? shareUrl(list) : ''
  const text = `${message}\n\n${url}`

  async function copy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Link copied')
    window.setTimeout(() => setCopied(false), 2000)
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: list.name, text: message, url })
      } catch {}
    } else copy()
  }

  async function sendToUser(e: React.FormEvent) {
    e.preventDefault()
    const value = recipient.trim()
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    const isPhone = /^\+?\d[\d\s]{8,14}$/.test(value)
    const isHandle = /^@[a-z0-9_.]{3,}$/i.test(value)
    if (!isEmail && !isPhone && !isHandle) return setError('Enter an email, phone number or @username.')
    setError('')
    setSending(true)
    await new Promise((r) => setTimeout(r, 900))
    setSending(false)
    setRecipient('')
    toast.success('Pay-for-me request sent', { description: `${value} will get a notification with your list.` })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ask someone to pay for you</DialogTitle>
          <DialogDescription>{`Share "${list.name}". Anyone with the link can pay for items — no account needed.`}</DialogDescription>
        </DialogHeader>

        <div role="tablist" aria-label="Share method" className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
          {[
            { id: 'link' as const, label: 'Share a link', icon: Link2 },
            { id: 'user' as const, label: 'Send to a user', icon: Send },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn('flex h-9 items-center justify-center gap-2 rounded-lg text-sm font-medium', tab === id ? 'bg-background shadow-sm' : 'text-muted-foreground')}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Message</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full rounded-xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

        {tab === 'link' ? (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input readOnly value={url} aria-label="Share link" className={cn(fieldClass, 'truncate text-muted-foreground')} onFocus={(e) => e.currentTarget.select()} />
              <button type="button" onClick={copy} className="flex h-12 shrink-0 items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background">
                {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(text)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-semibold text-white hover:opacity-90"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                WhatsApp
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent(list.name)}&body=${encodeURIComponent(text)}`}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-medium hover:bg-muted"
              >
                <Mail className="size-4" aria-hidden="true" />
                Email
              </a>
              <button type="button" onClick={nativeShare} className="flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-medium hover:bg-muted">
                <Send className="size-4" aria-hidden="true" />
                More
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={sendToUser} className="flex flex-col gap-3" noValidate>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">{"Recipient's email, phone or @username"}</span>
              <input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                aria-invalid={Boolean(error)}
                placeholder="tunde@example.com or @tunde"
                className={fieldClass}
              />
            </label>
            {error && <p role="alert" className="text-sm text-deal">{error}</p>}
            <button
              type="submit"
              disabled={sending}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              <Send className="size-4" aria-hidden="true" />
              {sending ? 'Sending…' : 'Send pay-for-me request'}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
