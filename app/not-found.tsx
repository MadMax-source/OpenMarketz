import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-32 text-center">
      <p className="font-display text-6xl font-semibold text-primary">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold">We couldn&apos;t find that page</h1>
      <p className="mt-2 text-muted-foreground">It may have moved, or the product is no longer available.</p>
      <Link href="/" className="mt-8 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">
        Back to home
      </Link>
    </div>
  )
}
