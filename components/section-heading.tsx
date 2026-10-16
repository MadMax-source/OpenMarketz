import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel = 'View all',
  children,
}: {
  eyebrow?: string
  title: string
  href?: string
  linkLabel?: string
  children?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-primary">{eyebrow}</p>}
        <h2 className="font-display text-2xl font-semibold tracking-tight text-balance md:text-3xl">{title}</h2>
      </div>
      <div className="flex items-center gap-4">
        {children}
        {href && (
          <Link
            href={href}
            className="group flex shrink-0 items-center gap-1 text-sm font-medium text-foreground hover:text-primary"
          >
            {linkLabel}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  )
}
