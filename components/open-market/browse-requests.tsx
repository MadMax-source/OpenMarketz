'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { categories } from '@/lib/data'
import { ME, type RequestCondition } from '@/lib/open-market'
import { useOpenMarket } from '@/components/open-market/open-market-provider'
import { RequestCard } from '@/components/open-market/request-card'
import { Select, inputClass } from '@/components/forms'
import { cn } from '@/lib/utils'

type Sort = 'newest' | 'budget-high' | 'budget-low' | 'fewest-offers'

export function BrowseRequests({ initialCategory }: { initialCategory?: string }) {
  const { requests, responsesFor } = useOpenMarket()
  const [q, setQ] = useState('')
  const [category, setCategory] = useState(initialCategory ?? '')
  const [condition, setCondition] = useState<RequestCondition | ''>('')
  const [scope, setScope] = useState<'all' | 'open' | 'mine'>('open')
  const [sort, setSort] = useState<Sort>('newest')

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    const list = requests.filter(
      (r) =>
        (!term || `${r.title} ${r.description} ${r.location}`.toLowerCase().includes(term)) &&
        (!category || r.category === category) &&
        (!condition || r.condition === condition || r.condition === 'any') &&
        (scope === 'all' || (scope === 'open' ? r.status === 'open' : r.buyerId === ME)),
    )
    return [...list].sort((a, b) => {
      if (sort === 'budget-high') return b.budgetMax - a.budgetMax
      if (sort === 'budget-low') return a.budgetMin - b.budgetMin
      if (sort === 'fewest-offers') return responsesFor(a.id).length - responsesFor(b.id).length
      return a.postedHoursAgo - b.postedHoursAgo
    })
  }, [requests, q, category, condition, scope, sort, responsesFor])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/open-market" className="text-xs font-medium uppercase tracking-wider text-primary">Open Market</Link>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Buyer requests</h1>
          <p className="mt-1 text-muted-foreground">Respond with an offer, or post your own request.</p>
        </div>
        <Link href="/open-market/new" className="flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <Plus className="size-4" aria-hidden="true" />
          Post a request
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border bg-card p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="req-search" className="sr-only">Search requests</label>
          <input id="req-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search generators, lace, laptops…" className={cn(inputClass, 'pl-11')} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </Select>
          <Select aria-label="Condition" value={condition} onChange={(e) => setCondition(e.target.value as RequestCondition | '')}>
            <option value="">Any condition</option>
            <option value="new">Brand new</option>
            <option value="used">Used</option>
          </Select>
          <Select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="newest">Newest first</option>
            <option value="budget-high">Highest budget</option>
            <option value="budget-low">Lowest budget</option>
            <option value="fewest-offers">Fewest offers</option>
          </Select>
        </div>
        <div role="tablist" aria-label="Request scope" className="flex gap-2">
          {(['open', 'all', 'mine'] as const).map((s) => (
            <button key={s} role="tab" type="button" aria-selected={scope === s} onClick={() => setScope(s)} className={cn('h-9 rounded-full px-4 text-sm font-medium', scope === s ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground')}>
              {s === 'open' ? 'Open' : s === 'all' ? 'All' : 'My requests'}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">{`${results.length} request${results.length === 1 ? '' : 's'}`}</p>
      {results.length ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((r) => <RequestCard key={r.id} request={r} />)}
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-3xl border border-dashed py-16 text-center">
          <p className="font-medium">No requests match your filters</p>
          <Link href="/open-market/new" className="text-sm font-medium text-primary hover:underline">Post this as a new request</Link>
        </div>
      )}
    </div>
  )
}
