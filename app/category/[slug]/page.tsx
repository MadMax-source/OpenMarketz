import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { categories, getCategory, getProductsByCategory } from '@/lib/data'
import { ListingView } from '@/components/listing/listing-view'
import { PageIntro } from '@/components/listing/page-intro'
import { cn } from '@/lib/utils'

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const category = getCategory(slug)
  return { title: category?.name ?? 'Category', description: category?.description }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = getCategory(slug)
  if (!category) notFound()

  return (
    <>
      <PageIntro
        title={category.name}
        description={category.description}
        crumbs={[{ label: 'All products', href: '/products' }, { label: category.name }]}
      />
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <nav aria-label="Other categories" className="no-scrollbar -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              aria-current={c.slug === slug ? 'page' : undefined}
              className={cn(
                'shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors',
                c.slug === slug ? 'border-foreground bg-foreground text-background' : 'hover:bg-muted',
              )}
            >
              {c.name}
            </Link>
          ))}
        </nav>
        <ListingView products={getProductsByCategory(slug)} />
      </div>
    </>
  )
}
