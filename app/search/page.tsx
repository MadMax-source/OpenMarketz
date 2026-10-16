import type { Metadata } from 'next'
import Link from 'next/link'
import { categories, searchProducts } from '@/lib/data'
import { ListingView } from '@/components/listing/listing-view'
import { PageIntro } from '@/components/listing/page-intro'

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const { q } = await searchParams
  return { title: q ? `Results for "${q}"` : 'Search' }
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams
  const query = q.trim()
  const results = searchProducts(query)

  return (
    <>
      <PageIntro
        title={query ? `Results for "${query}"` : 'Search'}
        description={
          query
            ? `${results.length} ${results.length === 1 ? 'product' : 'products'} found across verified stores.`
            : 'Browse everything, or use the search bar to find something specific.'
        }
        crumbs={[{ label: 'Search' }]}
      />
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {query && results.length === 0 ? (
          <div className="rounded-3xl bg-muted/60 px-6 py-16 text-center">
            <p className="font-display text-xl font-semibold">{`We couldn't find "${query}"`}</p>
            <p className="mt-2 text-sm text-muted-foreground">Check the spelling or explore a category instead.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {categories.map((c) => (
                <Link key={c.slug} href={`/category/${c.slug}`} className="rounded-full border bg-background px-4 py-1.5 text-sm hover:bg-muted">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <ListingView key={query} products={results} showCategoryFilter />
        )}
      </div>
    </>
  )
}
