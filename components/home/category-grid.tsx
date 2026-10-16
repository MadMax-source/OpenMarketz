import Image from 'next/image'
import Link from 'next/link'
import { categories, getProductsByCategory } from '@/lib/data'
import { Reveal } from '@/components/reveal'
import { SectionHeading } from '@/components/section-heading'

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-20 md:px-6" aria-labelledby="categories-heading">
      <SectionHeading eyebrow="Explore" title="Shop by category" href="/products" linkLabel="All products" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
        {categories.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.04}>
            <Link
              href={`/category/${c.slug}`}
              className="group relative flex aspect-[4/3.2] flex-col justify-end overflow-hidden rounded-2xl bg-muted p-4"
            >
              <Image
                src={c.image || '/placeholder.svg'}
                alt=""
                fill
                sizes="(min-width: 640px) 25vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
              <span className="relative font-medium text-background">{c.name}</span>
              <span className="relative text-xs text-background/75">
                {`${getProductsByCategory(c.slug).length} products`}
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
