import Link from 'next/link'
import { ArrowRight, BadgeCheck, Clock, MapPin, ThumbsUp } from 'lucide-react'
import { formatCompact, getProductsBySeller, type Seller } from '@/lib/data'

export function SellerCard({ seller }: { seller: Seller }) {
  return (
    <div className="flex flex-col gap-5 rounded-3xl bg-muted/60 p-6 md:flex-row md:items-center">
      <div className="flex flex-1 items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary font-display font-semibold text-primary-foreground">
          {seller.initials}
        </span>
        <div>
          <p className="text-xs text-muted-foreground">Sold by</p>
          <p className="flex items-center gap-1.5 font-display text-lg font-semibold">
            {seller.name}
            {seller.verified && <BadgeCheck className="size-4 text-primary" aria-label="Verified seller" />}
          </p>
          <p className="text-sm text-muted-foreground">{seller.tagline}</p>
        </div>
      </div>
      <dl className="grid grid-cols-3 gap-4 text-sm md:flex md:gap-8">
        <Stat icon={ThumbsUp} label="Positive" value={`${seller.positiveRate}%`} />
        <Stat icon={Clock} label="Replies" value={seller.responseTime.replace('within ', '< ')} />
        <Stat icon={MapPin} label="Ships from" value={seller.location.split(',')[1]?.trim() ?? seller.location} />
      </dl>
      <Link
        href={`/store/${seller.slug}`}
        className="group flex h-11 items-center justify-center gap-1.5 rounded-full border bg-background px-5 text-sm font-medium hover:bg-background/70"
      >
        {`Visit store · ${formatCompact(getProductsBySeller(seller.id).length)} items`}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  )
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  )
}
