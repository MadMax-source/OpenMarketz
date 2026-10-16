'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Check } from 'lucide-react'
import { products } from '@/lib/data'
import { useAuth } from '@/components/auth-provider'
import { useShop } from '@/components/shop-provider'
import { occasions, useWishlists, type GiftList, type Occasion } from '@/components/wishlist-provider'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { fieldClass } from '@/components/checkout/checkout-ui'
import { cn } from '@/lib/utils'

export function GiftListDialog({
  open,
  onOpenChange,
  list,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  list?: GiftList
}) {
  const { user } = useAuth()
  const { wishlist } = useShop()
  const { createList, updateList } = useWishlists()
  const [name, setName] = useState(list?.name ?? '')
  const [occasion, setOccasion] = useState<Occasion>(list?.occasion ?? 'birthday')
  const [eventDate, setEventDate] = useState(list?.eventDate ?? '')
  const [note, setNote] = useState(list?.note ?? '')
  const [ownerName, setOwnerName] = useState(list?.ownerName ?? (user ? `${user.firstName} ${user.lastName}` : ''))
  const [ownerRegion, setOwnerRegion] = useState(list?.ownerRegion ?? (user?.region ?? ''))
  const [selected, setSelected] = useState<string[]>(list?.productIds ?? [...wishlist])
  const [error, setError] = useState('')

  const saved = products.filter((p) => wishlist.has(p.id))
  const pool = [...saved, ...products.filter((p) => !wishlist.has(p.id))].slice(0, 12)

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim().length < 3) return setError('Give your list a name (at least 3 characters).')
    if (!ownerName.trim()) return setError('Add the name gifts should be delivered to.')
    if (selected.length === 0) return setError('Pick at least one item for your list.')
    const input = { name: name.trim(), occasion, eventDate, note: note.trim(), ownerName: ownerName.trim(), ownerRegion: ownerRegion.trim(), productIds: selected }
    if (list) updateList(list.id, input)
    else createList(input)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{list ? 'Edit gift list' : 'Create a gift list'}</DialogTitle>
          <DialogDescription>
            Friends and family can open your list and pay for any item. We deliver straight to you.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-sm font-medium">List name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My 30th birthday wishlist" className={fieldClass} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Occasion</span>
              <select value={occasion} onChange={(e) => setOccasion(e.target.value as Occasion)} className={fieldClass}>
                {occasions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Event date <span className="font-normal text-muted-foreground">(optional)</span></span>
              <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={fieldClass} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Deliver gifts to</span>
              <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Full name" className={fieldClass} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">City / state shown to givers</span>
              <input value={ownerRegion} onChange={(e) => setOwnerRegion(e.target.value)} placeholder="e.g. Lekki, Lagos" className={fieldClass} />
            </label>
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-sm font-medium">Note to givers</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                maxLength={200}
                placeholder="Say thank you or share what the occasion means to you"
                className="w-full rounded-xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>

          <fieldset>
            <legend className="text-sm font-medium">{`Items (${selected.length} selected)`}</legend>
            <p className="text-xs text-muted-foreground">Your saved items appear first.</p>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {pool.map((p) => {
                const on = selected.includes(p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggle(p.id)}
                    aria-pressed={on}
                    className={cn('relative flex flex-col overflow-hidden rounded-xl border text-left transition-colors', on ? 'border-primary ring-2 ring-primary/30' : 'hover:border-foreground/30')}
                  >
                    <span className="relative aspect-square bg-muted">
                      <Image src={p.image || '/placeholder.svg'} alt="" fill sizes="120px" className="object-cover" />
                    </span>
                    <span className="line-clamp-1 px-2 py-1.5 text-xs">{p.name}</span>
                    {on && (
                      <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" aria-hidden="true" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </fieldset>

          {error && <p role="alert" className="text-sm text-deal">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => onOpenChange(false)} className="h-11 rounded-xl border px-5 text-sm font-medium hover:bg-muted">
              Cancel
            </button>
            <button type="submit" className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90">
              {list ? 'Save changes' : 'Create list'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
