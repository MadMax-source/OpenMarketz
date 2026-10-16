import type { Metadata } from 'next'
import { products } from '@/lib/data'
import { ListingView } from '@/components/listing/listing-view'
import { PageIntro } from '@/components/listing/page-intro'

export const metadata: Metadata = {
  title: 'All products',
  description: 'Browse every product from verified sellers on Kasuwa.',
}

export default function ProductsPage() {
  return (
    <>
      <PageIntro
        title="All products"
        description="Everything from our verified sellers, in one place."
        crumbs={[{ label: 'All products' }]}
      />
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <ListingView products={products} showCategoryFilter />
      </div>
    </>
  )
}
