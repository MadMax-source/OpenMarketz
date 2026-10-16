import Image from 'next/image'
import { BadgeCheck, ShieldCheck, Truck } from 'lucide-react'

export function AuthShell({
  title,
  description,
  children,
  image = '/images/auth-shopper.png',
  quote = 'Shop thousands of verified sellers, bargain in chat and get it delivered anywhere in Nigeria.',
}: {
  title: string
  description: React.ReactNode
  children: React.ReactNode
  image?: string
  quote?: string
}) {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 md:px-6 md:py-12 lg:grid-cols-[1fr_minmax(0,0.9fr)] lg:gap-16">
      <section className="mx-auto flex w-full max-w-md flex-col justify-center lg:mx-0 lg:max-w-none">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-balance md:text-4xl">{title}</h1>
          <p className="text-muted-foreground text-pretty">{description}</p>
        </div>
        {children}
      </section>

      <aside className="relative hidden min-h-[640px] overflow-hidden rounded-3xl bg-muted lg:block">
        <Image src={image || '/placeholder.svg'} alt="" fill priority sizes="45vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-5 p-8 text-background">
          <p className="font-display text-2xl font-medium leading-snug text-balance">{quote}</p>
          <ul className="flex flex-wrap gap-2 text-xs font-medium">
            {[
              { icon: BadgeCheck, label: 'Verified sellers' },
              { icon: ShieldCheck, label: 'Buyer protection' },
              { icon: Truck, label: 'Nationwide delivery' },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-1.5 rounded-full bg-background/15 px-3 py-1.5 backdrop-blur">
                <Icon className="size-3.5" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}
