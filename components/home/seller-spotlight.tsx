import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck, MapPin, Star } from 'lucide-react'
import { formatCompact, getProductsBySeller, sellers } from '@/lib/data'
import { Reveal } from '@/components/reveal'
import { SectionHeading } from '@/components/section-heading'

export function SellerSpotlight() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-20 md:px-6">
      <SectionHeading eyebrow="Top rated" title="Stores worth following" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sellers.slice(0, 4).map((s, i) => {
          const items = getProductsBySeller(s.id).slice(0, 3)
          return (
            <Reveal key={s.id} delay={i * 0.06}>
              <Link
                href={`/store/${s.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-foreground/5"
              >
                <div className="relative h-24 bg-muted">
                  <Image src={s.banner || '/placeholder.svg'} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col p-4 pt-0">
                  <span className="-mt-6 flex size-12 items-center justify-center rounded-xl border-4 border-card bg-primary font-display text-sm font-semibold text-primary-foreground">
                    {s.initials}
                  </span>
                  <p className="mt-3 flex items-center gap-1.5 font-medium">
                    {s.name}
                    {s.verified && <BadgeCheck className="size-4 text-primary" aria-label="Verified seller" />}
                  </p>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{s.tagline}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 text-foreground">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      {s.rating}
                    </span>
                    <span>{`${formatCompact(s.followers)} followers`}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {s.location.split(',')[1]?.trim()}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {items.map((p) => (
                      <div key={p.id} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                        <Image src={p.image || '/placeholder.svg'} alt={p.name} fill sizes="80px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
