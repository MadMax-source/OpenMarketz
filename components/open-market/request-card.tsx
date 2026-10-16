'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Clock, MapPin, MessageSquareText } from 'lucide-react'
import { formatPrice, getCategory } from '@/lib/data'
import { ME, conditionLabels, timeAgo, type MarketRequest } from '@/lib/open-market'
import { useOpenMarket } from '@/components/open-market/open-market-provider'
import { cn } from '@/lib/utils'

export function RequestStatusBadge({ status }: { status: MarketRequest['status'] }) {
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-0.5 text-xs font-medium',
        status === 'open' && 'bg-primary/10 text-primary',
        status === 'accepted' && 'bg-foreground text-background',
        status === 'closed' && 'bg-muted text-muted-foreground',
      )}
    >
      {status === 'open' ? 'Open for offers' : status === 'accepted' ? 'Offer accepted' : 'Closed'}
    </span>
  )
}

export function RequestCard({ request }: { request: MarketRequest }) {
  const { responsesFor } = useOpenMarket()
  const count = responsesFor(request.id).length
  return (
    <Link
      href={`/open-market/requests/${request.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[16/10] bg-muted">
        {request.image && (
          <Image src={request.image || '/placeholder.svg'} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <RequestStatusBadge status={request.status} />
          {request.buyerId === ME && <span className="rounded-full bg-background px-2.5 py-0.5 text-xs font-medium">Your request</span>}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs text-muted-foreground">{`${getCategory(request.category)?.name ?? 'Other'} · ${conditionLabels[request.condition]}`}</p>
        <h3 className="line-clamp-2 font-medium leading-snug">{request.title}</h3>
        <p className="font-display text-lg font-semibold tabular-nums">
          {`${formatPrice(request.budgetMin)} – ${formatPrice(request.budgetMax)}`}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="size-3.5" aria-hidden="true" />{request.location}</span>
          <span className="flex items-center gap-1"><Clock className="size-3.5" aria-hidden="true" />{timeAgo(request.postedHoursAgo)}</span>
          <span className="flex items-center gap-1 font-medium text-foreground"><MessageSquareText className="size-3.5" aria-hidden="true" />{`${count} offer${count === 1 ? '' : 's'}`}</span>
        </div>
      </div>
    </Link>
  )
}
