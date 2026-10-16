import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/reveal'

export function PromoBanners() {
  return (
    <section className="mx-auto grid max-w-7xl gap-4 px-4 pt-20 md:grid-cols-2 md:px-6">
      <Reveal>
        <Link href="/category/fashion" className="group relative flex min-h-64 flex-col justify-end overflow-hidden rounded-3xl p-8">
          <Image src="/images/banner-fashion.png" alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
          <span className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-foreground/0" />
          <div className="relative text-background">
            <p className="text-xs font-medium uppercase tracking-wider text-background/80">Made in Lagos</p>
            <p className="mt-2 max-w-xs font-display text-3xl font-semibold leading-tight text-balance">Fresh prints from local designers</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium">
              Shop fashion
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      </Reveal>
      <Reveal delay={0.08}>
        <Link href="/category/phones" className="group relative flex min-h-64 flex-col justify-end overflow-hidden rounded-3xl p-8">
          <Image src="/images/banner-tech.png" alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
          <span className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-foreground/0" />
          <div className="relative text-background">
            <p className="text-xs font-medium uppercase tracking-wider text-background/80">Genuine & warrantied</p>
            <p className="mt-2 max-w-xs font-display text-3xl font-semibold leading-tight text-balance">Upgrade your tech for less</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium">
              Shop gadgets
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      </Reveal>
    </section>
  )
}
