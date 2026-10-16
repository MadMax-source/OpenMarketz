'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowRight, ShieldCheck, Star } from 'lucide-react'

const ease = [0.22, 1, 0.36, 1] as const

export function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 md:px-6 md:pt-10">
      <div className="grid items-center gap-10 overflow-hidden rounded-3xl bg-secondary px-6 py-10 md:grid-cols-2 md:px-12 md:py-14">
        <div className="flex flex-col items-start">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="flex items-center gap-2 rounded-full bg-background px-3 py-1 text-xs font-medium text-secondary-foreground"
          >
            <span className="size-1.5 rounded-full bg-primary" />
            {'Over 12,000 verified sellers'}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease }}
            className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-balance md:text-5xl lg:text-6xl"
          >
            Everything you love, from sellers you can trust.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease }}
            className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground text-pretty"
          >
            Shop phones, fashion, home essentials and more. Your payment is held safely until your order arrives.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              href="/products"
              className="group flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Start shopping
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#deals"
              className="flex h-12 items-center rounded-full border border-foreground/10 bg-background px-6 text-sm font-medium transition-colors hover:bg-background/70"
            >
              {"Today's deals"}
            </Link>
          </motion.div>
          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex gap-8"
          >
            {[
              ['2M+', 'Happy shoppers'],
              ['36', 'States covered'],
              ['4.8', 'Avg. seller rating'],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="font-display text-2xl font-semibold">{value}</dd>
                <dd className="text-xs text-muted-foreground">{label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease }}
          className="relative"
        >
          <div className="relative aspect-[4/3.4] overflow-hidden rounded-2xl">
            <Image
              src="/images/hero.png"
              alt="A curated selection of products available on OpenMarketz"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease }}
            className="absolute -bottom-4 left-4 flex items-center gap-3 rounded-2xl bg-background p-3 pr-5 shadow-xl shadow-foreground/10 md:-left-6"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Buyer protection</p>
              <p className="text-xs text-muted-foreground">Full refund if it&apos;s not as described</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65, ease }}
            className="absolute right-4 top-4 hidden items-center gap-2 rounded-full bg-background/95 px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur sm:flex"
          >
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            {'4.9 · Ankara House'}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
