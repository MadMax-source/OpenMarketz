'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Eye, Minus, Pause, Play, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { formatPrice, getCategory } from '@/lib/data'
import type { ListingStatus } from '@/lib/seller'
import { useSeller } from '@/components/seller/seller-provider'
import { PageHeader, StatusPill } from '@/components/seller/seller-shell'
import { inputClass } from '@/components/forms'
import { cn } from '@/lib/utils'

const filters: { id: 'all' | ListingStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Live' },
  { id: 'draft', label: 'Drafts' },
  { id: 'paused', label: 'Paused' },
]

export function SellerProducts() {
  const { listings, setListingStatus, updateStock } = useSeller()
  const [filter, setFilter] = useState<(typeof filters)[number]['id']>('all')
  const [query, setQuery] = useState('')

  const shown = useMemo(
    () => listings.filter((l) => (filter === 'all' || l.status === filter) && l.name.toLowerCase().includes(query.trim().toLowerCase())),
    [listings, filter, query],
  )

  return (
    <div>
      <PageHeader
        title="Products"
        description={`${listings.filter((l) => l.status === 'active').length} live listings`}
        action={
          <Link href="/seller/products/new" className="flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
            <Plus className="size-4" aria-hidden="true" />
            Post a product
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Filter listings" className="flex gap-1 rounded-xl bg-muted p-1">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn('h-8 rounded-lg px-3 text-sm font-medium text-muted-foreground', filter === f.id && 'bg-card text-foreground shadow-sm')}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="relative ml-auto w-full sm:w-64">
          <span className="sr-only">Search your products</span>
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" className={cn(inputClass, 'h-10 pl-9')} />
        </label>
      </div>

      {shown.length === 0 ? (
        <div className="rounded-3xl border border-dashed p-10 text-center">
          <p className="font-medium">No products here yet</p>
          <Link href="/seller/products/new" className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">Post your first product</Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((l) => (
            <li key={l.id} className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <Image src={l.image} alt="" width={64} height={64} className="size-16 shrink-0 rounded-xl object-cover" unoptimized={l.image.startsWith('blob:')} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{l.name}</p>
                    <StatusPill status={l.status} label={l.status === 'active' ? 'Live' : undefined} />
                    {l.negotiable && <span className="text-xs font-medium text-primary">Bargain on</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {`${formatPrice(l.price)} · ${getCategory(l.category)?.name ?? l.category}`}
                    {l.minPrice ? ` · floor ${formatPrice(l.minPrice)}` : ''}
                  </p>
                  <p className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="size-3.5" aria-hidden="true" />{l.views} views</span>
                    <span>{`${l.sold} sold`}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-xl border" aria-label={`Stock for ${l.name}`} role="group">
                  <button type="button" onClick={() => updateStock(l.id, l.stock - 1)} aria-label="Decrease stock" className="flex size-9 items-center justify-center hover:bg-muted">
                    <Minus className="size-3.5" />
                  </button>
                  <span className={cn('w-12 text-center text-sm font-medium tabular-nums', l.stock <= 3 && 'text-deal')}>{l.stock}</span>
                  <button type="button" onClick={() => updateStock(l.id, l.stock + 1)} aria-label="Increase stock" className="flex size-9 items-center justify-center hover:bg-muted">
                    <Plus className="size-3.5" />
                  </button>
                </div>
                {l.status === 'active' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setListingStatus(l.id, 'paused')
                      toast(`${l.name} paused`)
                    }}
                    className="flex h-9 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium hover:bg-muted"
                  >
                    <Pause className="size-3.5" aria-hidden="true" />
                    Pause
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setListingStatus(l.id, 'active')
                      toast.success(`${l.name} is live`)
                    }}
                    className="flex h-9 items-center gap-1.5 rounded-xl bg-foreground px-3 text-sm font-medium text-background"
                  >
                    <Play className="size-3.5" aria-hidden="true" />
                    {l.status === 'draft' ? 'Publish' : 'Resume'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
