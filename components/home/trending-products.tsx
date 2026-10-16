'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { categories, products } from '@/lib/data'
import { ProductCard } from '@/components/product-card'
import { SectionHeading } from '@/components/section-heading'
import { cn } from '@/lib/utils'

const tabs = [{ slug: 'all', name: 'All' }, ...categories.slice(0, 5)]

export function TrendingProducts() {
  const [active, setActive] = useState('all')
  const list = (active === 'all' ? [...products].sort((a, b) => b.sold - a.sold) : products.filter((p) => p.category === active)).slice(0, 10)

  return (
    <section className="mx-auto max-w-7xl px-4 pt-20 md:px-6">
      <SectionHeading eyebrow="Popular right now" title="Trending this week" href="/products" />
      <div role="tablist" aria-label="Filter trending products" className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {tabs.map((t) => (
          <button
            key={t.slug}
            role="tab"
            type="button"
            aria-selected={active === t.slug}
            onClick={() => setActive(t.slug)}
            className={cn(
              'relative shrink-0 rounded-full px-4 py-2 text-sm transition-colors',
              active === t.slug ? 'text-background' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {active === t.slug && (
              <motion.span
                layoutId="trending-pill"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                className="absolute inset-0 rounded-full bg-foreground"
              />
            )}
            <span className="relative">{t.name}</span>
          </button>
        ))}
      </div>
      <motion.div layout className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
        <AnimatePresence mode="popLayout">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  )
}
