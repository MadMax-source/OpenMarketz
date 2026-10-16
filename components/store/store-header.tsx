'use client'

import Image from 'next/image'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { BadgeCheck, Calendar, Check, MapPin, MessageCircle, Plus, Star } from 'lucide-react'
import { toast } from 'sonner'
import { formatCompact, type Seller } from '@/lib/data'
import { cn } from '@/lib/utils'

export function StoreHeader({ seller, productCount }: { seller: Seller; productCount: number }) {
  const [following, setFollowing] = useState(false)
  const followers = seller.followers + (following ? 1 : 0)

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 md:px-6">
      <div className="relative h-44 overflow-hidden rounded-3xl bg-muted md:h-64">
        <Image src={seller.banner || '/placeholder.svg'} alt="" fill priority sizes="100vw" className="object-cover" />
        <span className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
      </div>

      <div className="flex flex-col gap-6 px-2 md:flex-row md:items-end md:justify-between md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="-mt-12 flex size-24 items-center justify-center rounded-3xl border-4 border-background bg-primary font-display text-2xl font-semibold text-primary-foreground shadow-lg md:size-28"
          >
            {seller.initials}
          </motion.span>
          <div className="md:pb-1">
            <h1 className="flex items-center gap-2 font-display text-3xl font-semibold tracking-tight">
              {seller.name}
              {seller.verified && <BadgeCheck className="size-6 text-primary" aria-label="Verified seller" />}
            </h1>
            <p className="mt-1 text-muted-foreground">{seller.tagline}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 text-foreground">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <span className="font-medium">{seller.rating}</span>
                <span className="text-muted-foreground">{`(${seller.reviews.toLocaleString()} reviews)`}</span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {seller.location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                {`Selling since ${seller.joined}`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 md:pb-1">
          <button
            type="button"
            onClick={() => toast('Messaging is coming soon', { description: `${seller.name} usually replies ${seller.responseTime}.` })}
            className="flex h-11 items-center gap-2 rounded-full border px-5 text-sm font-medium hover:bg-muted"
          >
            <MessageCircle className="size-4" />
            Message
          </button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            aria-pressed={following}
            onClick={() => setFollowing((f) => !f)}
            className={cn(
              'flex h-11 min-w-32 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-colors',
              following ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground hover:opacity-90',
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={following ? 'on' : 'off'}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                {following ? <Check className="size-4" /> : <Plus className="size-4" />}
                {following ? 'Following' : 'Follow'}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-4">
        {[
          ['Followers', formatCompact(followers)],
          ['Products', String(productCount)],
          ['Positive feedback', `${seller.positiveRate}%`],
          ['Response time', seller.responseTime],
        ].map(([label, value]) => (
          <div key={label} className="bg-background px-5 py-4">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-1 font-display text-xl font-semibold capitalize">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
