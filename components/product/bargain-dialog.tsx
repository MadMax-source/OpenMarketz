'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { HandCoins, Keyboard, Mic } from 'lucide-react'
import { formatPrice, type Product } from '@/lib/data'
import { useShop } from '@/components/shop-provider'
import { VoiceRecorder, type VoiceNote } from '@/components/voice-recorder'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const quickOffers = [0.95, 0.9, 0.85]

export function BargainDialog({ product, quantity }: { product: Product; quantity: number }) {
  const { submitOffer, offers } = useShop()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [mode, setMode] = useState<'text' | 'voice'>('text')
  const [message, setMessage] = useState('')
  const [voiceNote, setVoiceNote] = useState<VoiceNote>()
  const [error, setError] = useState('')

  const pending = offers.find((o) => o.productId === product.id && o.status === 'pending')
  const offerValue = Number(amount.replace(/[^\d]/g, ''))
  const minOffer = Math.round(product.price * 0.5)
  const percentOff = offerValue ? Math.round(((product.price - offerValue) / product.price) * 100) : 0

  function reset() {
    setAmount('')
    setMessage('')
    setVoiceNote(undefined)
    setError('')
    setMode('text')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!offerValue) return setError('Enter the price you want to pay.')
    if (offerValue >= product.price) return setError('Your offer should be lower than the current price.')
    if (offerValue < minOffer) return setError(`Offers below ${formatPrice(minOffer)} are unlikely to be accepted.`)
    submitOffer({ product, productId: product.id, offerPrice: offerValue, quantity, message: message.trim() || undefined, voiceNote })
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset() }}>
      <DialogTrigger
        disabled={!!pending}
        className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 text-sm font-medium text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <HandCoins className="size-4" aria-hidden="true" />
        {pending ? 'Offer pending' : 'Bargain'}
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Make an offer</DialogTitle>
          <DialogDescription>
            Send the seller your price. If they approve, the new price applies to you automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-2xl bg-muted p-3">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-background">
            <Image src={product.image || '/placeholder.svg'} alt="" fill sizes="56px" className="object-cover" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{product.name}</p>
            <p className="text-sm text-muted-foreground">
              {'Current price '}
              <span className="font-semibold text-foreground">{formatPrice(product.price)}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="offer-amount" className="text-sm font-medium">
              Your offer price
            </label>
            <div className="mt-2 flex h-14 items-center rounded-2xl border px-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <span className="font-display text-xl text-muted-foreground">{'₦'}</span>
              <input
                id="offer-amount"
                inputMode="numeric"
                autoComplete="off"
                value={offerValue ? offerValue.toLocaleString('en-NG') : ''}
                onChange={(e) => { setAmount(e.target.value); setError('') }}
                placeholder={Math.round(product.price * 0.9).toLocaleString('en-NG')}
                aria-invalid={!!error}
                aria-describedby="offer-hint"
                className="ml-2 min-w-0 flex-1 bg-transparent font-display text-xl font-semibold outline-none placeholder:font-normal placeholder:text-muted-foreground/60"
              />
              {percentOff > 0 && percentOff < 100 && (
                <span className="rounded-full bg-deal/10 px-2 py-0.5 text-xs font-semibold text-deal">{`-${percentOff}%`}</span>
              )}
            </div>
            <p id="offer-hint" className={cn('mt-2 text-xs', error ? 'text-deal' : 'text-muted-foreground')}>
              {error || (quantity > 1 ? `Price per unit · for ${quantity} units` : 'Price per unit')}
            </p>
            <div className="mt-3 flex gap-2">
              {quickOffers.map((ratio) => {
                const value = Math.round((product.price * ratio) / 100) * 100
                return (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => { setAmount(String(value)); setError('') }}
                    className={cn(
                      'flex-1 rounded-xl border px-2 py-2 text-xs transition-colors hover:border-foreground/40',
                      offerValue === value && 'border-primary bg-primary/5 text-primary',
                    )}
                  >
                    <span className="block font-semibold">{formatPrice(value)}</span>
                    <span className="text-muted-foreground">{`${Math.round((1 - ratio) * 100)}% off`}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Message to seller</p>
              <div className="flex rounded-full bg-muted p-0.5" role="tablist" aria-label="Message type">
                {([['text', Keyboard, 'Text'], ['voice', Mic, 'Voice']] as const).map(([value, Icon, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={mode === value}
                    onClick={() => setMode(value)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors',
                      mode === value ? 'bg-background font-medium shadow-sm' : 'text-muted-foreground',
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-2">
              {mode === 'text' ? (
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  maxLength={300}
                  aria-label="Message to seller"
                  placeholder="e.g. I can pay today and pick it up myself."
                  className="w-full resize-none rounded-2xl border bg-transparent p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              ) : (
                <VoiceRecorder value={voiceNote} onChange={setVoiceNote} />
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Optional — explain why this price works for you.</p>
          </div>

          <button
            type="submit"
            className="h-12 rounded-full bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {offerValue ? `Send offer of ${formatPrice(offerValue)}` : 'Send offer'}
          </button>
          <p className="-mt-2 text-center text-xs text-muted-foreground">
            {'Track responses in '}
            <Link href="/offers" className="font-medium text-foreground underline-offset-4 hover:underline">
              My offers
            </Link>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
