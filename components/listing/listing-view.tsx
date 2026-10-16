'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { SearchX, SlidersHorizontal, X } from 'lucide-react'
import { categories, type Product } from '@/lib/data'
import { ProductCard } from '@/components/product-card'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { FilterPanel, priceRanges, type Filters, emptyFilters } from '@/components/listing/filter-panel'

const sortOptions = [
  { value: 'relevance', label: 'Most relevant' },
  { value: 'popular', label: 'Best selling' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
] as const

type Sort = (typeof sortOptions)[number]['value']

export function ListingView({
  products,
  showCategoryFilter = false,
  emptyMessage = 'No products match your filters.',
}: {
  products: Product[]
  showCategoryFilter?: boolean
  emptyMessage?: string
}) {
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [sort, setSort] = useState<Sort>('relevance')

  const brands = useMemo(() => Array.from(new Set(products.map((p) => p.brand))).sort(), [products])
  const availableCategories = useMemo(
    () => categories.filter((c) => products.some((p) => p.category === c.slug)),
    [products],
  )

  const results = useMemo(() => {
    const range = priceRanges.find((r) => r.id === filters.price)
    const filtered = products.filter(
      (p) =>
        (filters.categories.length === 0 || filters.categories.includes(p.category)) &&
        (filters.brands.length === 0 || filters.brands.includes(p.brand)) &&
        (!range || (p.price >= range.min && p.price < range.max)) &&
        p.rating >= filters.minRating &&
        (!filters.freeDelivery || p.freeDelivery) &&
        (!filters.onSale || Boolean(p.compareAt)),
    )
    const sorted = [...filtered]
    if (sort === 'popular') sorted.sort((a, b) => b.sold - a.sold)
    if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price)
    if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating)
    return sorted
  }, [products, filters, sort])

  const chips = [
    ...filters.categories.map((slug) => ({
      label: categories.find((c) => c.slug === slug)?.name ?? slug,
      clear: () => setFilters((f) => ({ ...f, categories: f.categories.filter((c) => c !== slug) })),
    })),
    ...filters.brands.map((b) => ({
      label: b,
      clear: () => setFilters((f) => ({ ...f, brands: f.brands.filter((x) => x !== b) })),
    })),
    ...(filters.price
      ? [{ label: priceRanges.find((r) => r.id === filters.price)!.label, clear: () => setFilters((f) => ({ ...f, price: null })) }]
      : []),
    ...(filters.minRating ? [{ label: `${filters.minRating}+ stars`, clear: () => setFilters((f) => ({ ...f, minRating: 0 })) }] : []),
    ...(filters.freeDelivery ? [{ label: 'Free delivery', clear: () => setFilters((f) => ({ ...f, freeDelivery: false })) }] : []),
    ...(filters.onSale ? [{ label: 'On sale', clear: () => setFilters((f) => ({ ...f, onSale: false })) }] : []),
  ]

  const panel = (
    <FilterPanel
      filters={filters}
      onChange={setFilters}
      brands={brands}
      categories={showCategoryFilter ? availableCategories : []}
    />
  )

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block" aria-label="Filters">
        <div className="sticky top-40">{panel}</div>
      </aside>

      <div className="min-w-0">
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            <span className="font-medium text-foreground">{results.length}</span>
            {results.length === 1 ? ' product' : ' products'}
          </p>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger className="flex h-9 items-center gap-2 rounded-full border px-4 text-sm hover:bg-muted lg:hidden">
                <SlidersHorizontal className="size-4" />
                Filters
                {chips.length > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {chips.length}
                  </span>
                )}
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="px-4 pb-6">{panel}</div>
              </SheetContent>
            </Sheet>
            <label className="sr-only" htmlFor="sort">
              Sort products
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-9 cursor-pointer rounded-full border bg-background px-4 text-sm outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <AnimatePresence>
          {chips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 flex flex-wrap items-center gap-2 overflow-hidden"
            >
              {chips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={chip.clear}
                  className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-accent"
                >
                  {chip.label}
                  <X className="size-3" aria-label="Remove filter" />
                </button>
              ))}
              <button
                type="button"
                onClick={() => setFilters(emptyFilters)}
                className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                Clear all
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
            <SearchX className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="mt-4 font-medium">{emptyMessage}</p>
            <p className="mt-1 text-sm text-muted-foreground">Try removing a filter or searching for something else.</p>
            {chips.length > 0 && (
              <button
                type="button"
                onClick={() => setFilters(emptyFilters)}
                className="mt-5 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {results.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 4} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}
