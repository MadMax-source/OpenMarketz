'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, HandCoins, Megaphone, ShieldCheck } from 'lucide-react'
import { categories } from '@/lib/data'
import { useOpenMarket } from '@/components/open-market/open-market-provider'
import { RequestCard } from '@/components/open-market/request-card'

const steps = [
  { icon: Megaphone, title: 'Post what you need', body: 'Describe the item, your budget and where you are. It takes under a minute.' },
  { icon: HandCoins, title: 'Sellers send offers', body: 'Verified sellers compete with their best price, delivery time and photos.' },
  { icon: BadgeCheck, title: 'Accept and pay safely', body: 'Pick the best offer and check out. Your money is held in escrow until delivery.' },
]

export function OpenMarketLanding() {
  const { requests, responses } = useOpenMarket()
  const open = requests.filter((r) => r.status === 'open')

  return (
    <div className="flex flex-col gap-16 pb-16">
      <section className="bg-foreground text-background">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:px-6 md:py-20">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-background/10 px-3 py-1 text-xs font-medium">Open Market</p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-balance md:text-5xl">
              {"Can't find it? Tell sellers what you want."}
            </h1>
            <p className="mt-4 max-w-md text-background/70">
              Post a request with your budget and let verified sellers across Nigeria come to you with offers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/open-market/new" className="flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90">
                Post a request
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href="/open-market/requests" className="flex h-12 items-center rounded-xl border border-background/25 px-6 text-sm font-semibold hover:bg-background/10">
                Browse requests
              </Link>
            </div>
            <dl className="mt-10 flex gap-8">
              <div><dt className="text-xs text-background/60">Open requests</dt><dd className="font-display text-2xl font-semibold tabular-nums">{open.length * 183}</dd></div>
              <div><dt className="text-xs text-background/60">Offers this week</dt><dd className="font-display text-2xl font-semibold tabular-nums">{(responses.length * 412).toLocaleString()}</dd></div>
              <div><dt className="text-xs text-background/60">Avg. first offer</dt><dd className="font-display text-2xl font-semibold">38 min</dd></div>
            </dl>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {requests.slice(0, 4).map((r, i) => (
              <Link key={r.id} href={`/open-market/requests/${r.id}`} className={`group relative overflow-hidden rounded-2xl bg-background/10 ${i % 2 ? 'translate-y-6' : ''}`}>
                <div className="relative aspect-square">
                  <Image src={r.image || '/placeholder.svg'} alt="" fill sizes="25vw" className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-105" />
                </div>
                <p className="absolute inset-x-2 bottom-2 line-clamp-2 rounded-lg bg-background/95 p-2 text-xs font-medium text-foreground">{r.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 md:px-6" aria-labelledby="how">
        <h2 id="how" className="font-display text-2xl font-semibold tracking-tight md:text-3xl">How Open Market works</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="rounded-2xl border bg-card p-6">
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" aria-hidden="true" /></span>
                <span className="font-display text-3xl font-semibold text-muted-foreground/40">{`0${i + 1}`}</span>
              </div>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 md:px-6" aria-labelledby="latest">
        <div className="flex items-end justify-between gap-4">
          <h2 id="latest" className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Latest requests</h2>
          <Link href="/open-market/requests" className="text-sm font-medium text-primary hover:underline">View all</Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {open.slice(0, 6).map((r) => <RequestCard key={r.id} request={r} />)}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 md:px-6" aria-labelledby="cats">
        <h2 id="cats" className="font-display text-2xl font-semibold tracking-tight">Browse requests by category</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link key={c.slug} href={`/open-market/requests?category=${c.slug}`} className="h-10 rounded-full border px-4 text-sm leading-10 hover:bg-muted">{c.name}</Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-accent p-8 md:flex-row md:items-center md:p-10">
          <div className="flex gap-4">
            <ShieldCheck className="size-8 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <h2 className="font-display text-xl font-semibold text-accent-foreground">Are you a seller?</h2>
              <p className="mt-1 max-w-lg text-sm text-accent-foreground/80">Buyers are posting what they want right now. Respond with an offer and win customers without paying for ads.</p>
            </div>
          </div>
          <Link href="/open-market/requests" className="flex h-11 shrink-0 items-center rounded-xl bg-foreground px-5 text-sm font-semibold text-background">Find buyers</Link>
        </div>
      </section>
    </div>
  )
}
