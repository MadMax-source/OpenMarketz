'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CalendarDays, Gift, Heart, Pencil, Plus, Share2, Trash2, Users } from 'lucide-react'
import { formatPrice, products } from '@/lib/data'
import { useShop } from '@/components/shop-provider'
import { decodeList, demoFriendList, encodeList, occasions, useWishlists, type GiftList } from '@/components/wishlist-provider'
import { ProductCard } from '@/components/product-card'
import { GiftListDialog } from '@/components/wishlist/gift-list-dialog'
import { ShareDialog } from '@/components/wishlist/share-dialog'
import { fieldClass } from '@/components/checkout/checkout-ui'
import { cn } from '@/lib/utils'

export function WishlistView() {
  const [tab, setTab] = useState<'saved' | 'lists'>('lists')
  const { wishlist } = useShop()
  const { lists } = useWishlists()
  const [creating, setCreating] = useState(false)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-primary">Wishlists</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Save it. Share it. Get it gifted.</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Build gift lists from things you love, send them to friends to pay for you, or pay for someone else&apos;s list.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="size-4" aria-hidden="true" />
          New gift list
        </button>
      </div>

      <div role="tablist" aria-label="Wishlist sections" className="mt-8 flex gap-1 border-b">
        {[
          { id: 'lists' as const, label: 'Gift lists', count: lists.length },
          { id: 'saved' as const, label: 'Saved items', count: wishlist.size },
        ].map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              '-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
              tab === t.id ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="mt-8">{tab === 'lists' ? <GiftLists onCreate={() => setCreating(true)} /> : <SavedItems />}</div>

      {creating && <GiftListDialog open={creating} onOpenChange={setCreating} />}
    </div>
  )
}

function SavedItems() {
  const { wishlist } = useShop()
  const saved = products.filter((p) => wishlist.has(p.id))
  if (saved.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-muted">
          <Heart className="size-6 text-muted-foreground" aria-hidden="true" />
        </span>
        <h2 className="font-display text-xl font-semibold">No saved items yet</h2>
        <p className="max-w-sm text-sm text-muted-foreground">Tap the heart on any product to save it here, then add it to a gift list.</p>
        <Link href="/search" className="mt-2 flex h-11 items-center rounded-xl bg-foreground px-5 text-sm font-medium text-background">
          Start browsing
        </Link>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
      {saved.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}

function GiftLists({ onCreate }: { onCreate: () => void }) {
  const { lists } = useWishlists()
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">My lists</h2>
        {lists.length === 0 ? (
          <button type="button" onClick={onCreate} className="flex flex-col items-center gap-2 rounded-3xl border border-dashed py-14 text-center hover:bg-muted/50">
            <Gift className="size-7 text-muted-foreground" aria-hidden="true" />
            <span className="font-medium">Create your first gift list</span>
            <span className="text-sm text-muted-foreground">Birthdays, weddings, baby showers and more.</span>
          </button>
        ) : (
          lists.map((list) => <GiftListCard key={list.id} list={list} />)
        )}
      </div>
      <aside className="flex flex-col gap-4">
        <PayForOthers />
      </aside>
    </div>
  )
}

function GiftListCard({ list }: { list: GiftList }) {
  const { giftsFor, deleteList } = useWishlists()
  const [sharing, setSharing] = useState(false)
  const [editing, setEditing] = useState(false)
  const items = list.productIds.flatMap((id) => products.find((p) => p.id === id) ?? [])
  const gifts = giftsFor(list.id)
  const giftedIds = new Set(gifts.map((g) => g.productId))
  const total = items.reduce((s, p) => s + p.price, 0)
  const funded = items.filter((p) => giftedIds.has(p.id)).reduce((s, p) => s + p.price, 0)
  const pct = total ? Math.round((funded / total) * 100) : 0
  const occasion = occasions.find((o) => o.value === list.occasion)?.label

  return (
    <article className="rounded-3xl border bg-card p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-accent px-2.5 py-0.5 font-medium text-accent-foreground">{occasion}</span>
            {list.eventDate && (
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                {new Date(list.eventDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
          <h3 className="mt-2 font-display text-xl font-semibold">{list.name}</h3>
          {list.note && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{list.note}</p>}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setEditing(true)} aria-label="Edit list" className="flex size-9 items-center justify-center rounded-full hover:bg-muted">
            <Pencil className="size-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => deleteList(list.id)} aria-label="Delete list" className="flex size-9 items-center justify-center rounded-full text-deal hover:bg-muted">
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <ul className="no-scrollbar mt-5 flex gap-3 overflow-x-auto">
        {items.map((p) => (
          <li key={p.id} className="relative w-24 shrink-0">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
              <Image src={p.image || '/placeholder.svg'} alt={p.name} fill sizes="96px" className={cn('object-cover', giftedIds.has(p.id) && 'opacity-50')} />
              {giftedIds.has(p.id) && (
                <span className="absolute inset-x-1 bottom-1 rounded-md bg-primary py-0.5 text-center text-[10px] font-semibold text-primary-foreground">Gifted</span>
              )}
            </div>
            <p className="mt-1 text-xs font-medium tabular-nums">{formatPrice(p.price)}</p>
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-muted-foreground">{`${formatPrice(funded)} of ${formatPrice(total)} gifted`}</span>
          <span className="font-medium tabular-nums">{`${pct}%`}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Amount gifted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {gifts.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2 rounded-2xl bg-muted/60 p-3 text-sm">
          {gifts.slice(-3).map((g) => (
            <li key={`${g.reference}-${g.productId}`} className="flex gap-2">
              <Gift className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <span>
                <span className="font-medium">{g.anonymous ? 'Someone special' : g.giverName}</span>
                {` paid for ${products.find((p) => p.id === g.productId)?.name ?? 'an item'}`}
                {g.message && <span className="text-muted-foreground">{` — "${g.message}"`}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSharing(true)}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-foreground px-5 text-sm font-semibold text-background hover:opacity-90"
        >
          <Share2 className="size-4" aria-hidden="true" />
          Ask someone to pay
        </button>
        <Link href={`/w/${encodeList(list)}`} className="flex h-11 items-center justify-center rounded-xl border px-5 text-sm font-medium hover:bg-muted">
          Preview as giver
        </Link>
      </div>

      {sharing && <ShareDialog list={list} open={sharing} onOpenChange={setSharing} />}
      {editing && <GiftListDialog list={list} open={editing} onOpenChange={setEditing} />}
    </article>
  )
}

function PayForOthers() {
  const router = useRouter()
  const [link, setLink] = useState('')
  const [error, setError] = useState('')
  const friendToken = encodeList({ ...demoFriendList, createdAt: 0 })
  const friendItems = demoFriendList.productIds.flatMap((id) => products.find((p) => p.id === id) ?? [])

  function open(e: React.FormEvent) {
    e.preventDefault()
    const token = link.trim().split('/w/').pop()?.split(/[?#]/)[0] ?? ''
    if (!token || !decodeList(token)) return setError('That link does not look like an OpenMarketz wishlist.')
    router.push(`/w/${token}`)
  }

  return (
    <>
      <div className="rounded-3xl bg-primary p-6 text-primary-foreground">
        <Users className="size-6" aria-hidden="true" />
        <h2 className="mt-3 font-display text-xl font-semibold">{"Pay for someone's wishlist"}</h2>
        <p className="mt-1 text-sm opacity-85">Paste a wishlist link a friend sent you. Pick what to gift and we deliver it to them.</p>
        <form onSubmit={open} className="mt-4 flex flex-col gap-2" noValidate>
          <label htmlFor="wishlist-link" className="sr-only">Wishlist link</label>
          <input
            id="wishlist-link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="openmarketz.ng/w/…"
            className="h-12 w-full rounded-xl bg-primary-foreground px-4 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary-foreground/50"
          />
          {error && <p role="alert" className="text-xs">{error}</p>}
          <button type="submit" className="h-11 rounded-xl bg-foreground text-sm font-semibold text-background hover:opacity-90">
            Open wishlist
          </button>
        </form>
      </div>

      <div className="rounded-3xl border bg-card p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Shared with you</p>
        <h3 className="mt-2 font-semibold">{demoFriendList.name}</h3>
        <p className="text-sm text-muted-foreground">{`From ${demoFriendList.ownerName} · ${demoFriendList.ownerRegion}`}</p>
        <div className="mt-3 flex -space-x-2">
          {friendItems.map((p) => (
            <span key={p.id} className="relative size-10 overflow-hidden rounded-full border-2 border-card bg-muted">
              <Image src={p.image || '/placeholder.svg'} alt="" fill sizes="40px" className="object-cover" />
            </span>
          ))}
        </div>
        <Link href={`/w/${friendToken}`} className="mt-4 flex h-10 items-center justify-center rounded-xl border text-sm font-medium hover:bg-muted">
          View and gift
        </Link>
      </div>
    </>
  )
}
