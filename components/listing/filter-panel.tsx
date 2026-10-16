'use client'

import { Star } from 'lucide-react'
import type { Category } from '@/lib/data'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

export type Filters = {
  categories: string[]
  brands: string[]
  price: string | null
  minRating: number
  freeDelivery: boolean
  onSale: boolean
}

export const emptyFilters: Filters = {
  categories: [],
  brands: [],
  price: null,
  minRating: 0,
  freeDelivery: false,
  onSale: false,
}

export const priceRanges = [
  { id: 'u25', label: 'Under ₦25,000', min: 0, max: 25000 },
  { id: '25-75', label: '₦25,000 – ₦75,000', min: 25000, max: 75000 },
  { id: '75-250', label: '₦75,000 – ₦250,000', min: 75000, max: 250000 },
  { id: 'o250', label: 'Over ₦250,000', min: 250000, max: Infinity },
]

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export function FilterPanel({
  filters,
  onChange,
  brands,
  categories,
}: {
  filters: Filters
  onChange: (f: Filters) => void
  brands: string[]
  categories: Category[]
}) {
  return (
    <div className="flex flex-col divide-y">
      {categories.length > 0 && (
        <FilterGroup title="Category">
          {categories.map((c) => (
            <CheckRow
              key={c.slug}
              label={c.name}
              checked={filters.categories.includes(c.slug)}
              onChange={() => onChange({ ...filters, categories: toggle(filters.categories, c.slug) })}
            />
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Price">
        {priceRanges.map((r) => (
          <button
            key={r.id}
            type="button"
            aria-pressed={filters.price === r.id}
            onClick={() => onChange({ ...filters, price: filters.price === r.id ? null : r.id })}
            className={cn(
              'rounded-lg px-3 py-2 text-left text-sm transition-colors',
              filters.price === r.id ? 'bg-secondary font-medium text-secondary-foreground' : 'hover:bg-muted',
            )}
          >
            {r.label}
          </button>
        ))}
      </FilterGroup>

      <FilterGroup title="Customer rating">
        {[4.5, 4, 3].map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={filters.minRating === r}
            onClick={() => onChange({ ...filters, minRating: filters.minRating === r ? 0 : r })}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
              filters.minRating === r ? 'bg-secondary font-medium text-secondary-foreground' : 'hover:bg-muted',
            )}
          >
            <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
            {`${r} & up`}
          </button>
        ))}
      </FilterGroup>

      {brands.length > 1 && (
        <FilterGroup title="Brand">
          {brands.map((b) => (
            <CheckRow
              key={b}
              label={b}
              checked={filters.brands.includes(b)}
              onChange={() => onChange({ ...filters, brands: toggle(filters.brands, b) })}
            />
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Offers">
        <CheckRow
          label="Free delivery"
          checked={filters.freeDelivery}
          onChange={() => onChange({ ...filters, freeDelivery: !filters.freeDelivery })}
        />
        <CheckRow label="On sale" checked={filters.onSale} onChange={() => onChange({ ...filters, onSale: !filters.onSale })} />
      </FilterGroup>
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="py-5 first:pt-0">
      <legend className="mb-3 text-sm font-semibold">{title}</legend>
      <div className="flex flex-col gap-0.5">{children}</div>
    </fieldset>
  )
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted">
      <Checkbox checked={checked} onCheckedChange={onChange} />
      {label}
    </label>
  )
}
