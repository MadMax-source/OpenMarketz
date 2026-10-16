import Link from 'next/link'

export function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="OpenMarketz home">
      <span className="flex size-8 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
        O
      </span>
      <span className="font-display text-xl font-semibold tracking-tight">
        open<span className="text-primary">marketz</span>
      </span>
    </Link>
  )
}
