'use client'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useId, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, Search, TrendingUp, X } from 'lucide-react'
import { categories, formatPrice, searchProducts } from '@/lib/data'
import { cn } from '@/lib/utils'

const popular = ['Smartphone', 'Ankara dress', 'Headphones', 'Vitamin C serum', 'Blender']

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()

  const trimmed = query.trim()
  const productMatches = useMemo(() => (trimmed ? searchProducts(trimmed).slice(0, 5) : []), [trimmed])
  const categoryMatches = useMemo(
    () => (trimmed ? categories.filter((c) => c.name.toLowerCase().includes(trimmed.toLowerCase())).slice(0, 3) : []),
    [trimmed],
  )

  function go(path: string) {
    setOpen(false)
    inputRef.current?.blur()
    router.push(path)
  }

  function submit(value = query) {
    const q = value.trim()
    if (!q) return
    setQuery(q)
    go(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <div className={cn('relative', className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="flex h-11 items-center gap-2 rounded-full border bg-muted/60 pl-4 pr-1.5 transition-colors focus-within:border-primary/40 focus-within:bg-background focus-within:ring-4 focus-within:ring-primary/10"
      >
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <label htmlFor={`${listId}-input`} className="sr-only">
          Search products, brands and stores
        </label>
        <input
          id={`${listId}-input`}
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setOpen(false)
              inputRef.current?.blur()
            }
            if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()
          }}
          placeholder="Search products, brands and stores"
          autoComplete="off"
          aria-controls={listId}
          aria-expanded={open}
          role="combobox"
          className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
            aria-label="Clear search"
            className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
        <button
          type="submit"
          className="hidden h-8 rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:block"
        >
          Search
        </button>
      </form>

      <AnimatePresence>
        {open && (
          <motion.div
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            onMouseDown={(e) => e.preventDefault()}
            className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border bg-popover p-2 shadow-xl shadow-foreground/5"
          >
            {!trimmed ? (
              <div className="p-2">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <TrendingUp className="size-3.5" />
                  Popular searches
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {popular.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => submit(term)}
                      className="rounded-full border px-3 py-1 text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-accent"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            ) : productMatches.length === 0 && categoryMatches.length === 0 ? (
              <p className="p-3 text-sm text-muted-foreground">{`No matches for "${trimmed}". Press Enter to search anyway.`}</p>
            ) : (
              <div className="flex flex-col">
                {categoryMatches.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    role="option"
                    aria-selected={false}
                    onClick={() => go(`/category/${c.slug}`)}
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    <span>
                      <span className="text-muted-foreground">{'Category · '}</span>
                      {c.name}
                    </span>
                    <ArrowUpRight className="size-3.5 text-muted-foreground" />
                  </button>
                ))}
                {productMatches.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    role="option"
                    aria-selected={false}
                    onClick={() => go(`/product/${p.slug}`)}
                    className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-left hover:bg-muted"
                  >
                    <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image src={p.image || '/placeholder.svg'} alt="" fill sizes="40px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                    <span className="text-sm font-medium">{formatPrice(p.price)}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => submit()}
                  className="mt-1 rounded-xl border-t px-3 pb-1 pt-2.5 text-left text-sm font-medium text-primary hover:underline"
                >
                  {`See all results for "${trimmed}"`}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
