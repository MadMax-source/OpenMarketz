import Link from 'next/link'
import { categories } from '@/lib/data'
import { Logo } from '@/components/logo'

const columns = [
  { title: 'Shop', links: categories.slice(0, 5).map((c) => ({ label: c.name, href: `/category/${c.slug}` })) },
  {
    title: 'Customer care',
    links: [
      { label: 'Help center', href: '#' },
      { label: 'Track an order', href: '#' },
      { label: 'Returns & refunds', href: '#' },
      { label: 'Buyer protection', href: '#' },
    ],
  },
  {
    title: 'Sell',
    links: [
      { label: 'Start selling', href: '#' },
      { label: 'Seller handbook', href: '#' },
      { label: 'Fees & payouts', href: '#' },
      { label: 'Seller verification', href: '#' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t bg-muted/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)] md:px-6">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            {"Nigeria's marketplace for verified sellers. Every payment is held securely until your order arrives."}
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h2 className="text-sm font-semibold">{col.title}</h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
          <p>{'© 2026 OpenMarketz Marketplace Ltd. All rights reserved.'}</p>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-foreground">Privacy</Link>
            <Link href="#" className="hover:text-foreground">Terms</Link>
            <Link href="#" className="hover:text-foreground">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
