import { BadgeCheck, RotateCcw, ShieldCheck, Truck } from 'lucide-react'

const items = [
  { icon: ShieldCheck, title: 'Secure escrow payments', body: 'Sellers get paid only after you confirm delivery.' },
  { icon: BadgeCheck, title: 'Verified sellers', body: 'Every store passes ID and business checks.' },
  { icon: Truck, title: 'Nationwide delivery', body: 'Fast shipping to all 36 states and the FCT.' },
  { icon: RotateCcw, title: '7-day easy returns', body: 'Changed your mind? Send it back, hassle-free.' },
]

export function TrustStrip() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-14 md:px-6" aria-label="Why shop with OpenMarketz">
      <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border lg:grid-cols-4">
        {items.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex flex-col gap-3 bg-background p-5 md:flex-row md:items-start md:gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
