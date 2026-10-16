import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCategory, getProduct, getProductsByCategory, getSeller, products } from '@/lib/data'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { ProductGallery } from '@/components/product/product-gallery'
import { PurchasePanel } from '@/components/product/purchase-panel'
import { SellerCard } from '@/components/product/seller-card'
import { ProductDetails } from '@/components/product/product-details'
import { ProductCard } from '@/components/product-card'
import { SectionHeading } from '@/components/section-heading'

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = getProduct(slug)
  return { title: product?.name ?? 'Product', description: product?.description }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) notFound()

  const category = getCategory(product.category)
  const seller = getSeller(product.sellerId)
  const sameCategory = getProductsByCategory(product.category).filter((p) => p.id !== product.id)
  const related = [...sameCategory, ...products.filter((p) => p.category !== product.category && p.id !== product.id)].slice(0, 5)

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 md:px-6">
      <Breadcrumbs
        items={[
          ...(category ? [{ label: category.name, href: `/category/${category.slug}` }] : []),
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="lg:sticky lg:top-40 lg:self-start">
          <ProductGallery images={product.gallery} name={product.name} />
        </div>
        <PurchasePanel product={product} />
      </div>

      {seller && (
        <div className="mt-16">
          <SellerCard seller={seller} />
        </div>
      )}

      <section className="mt-16" aria-label="Product details">
        <ProductDetails product={product} />
      </section>

      <section className="mt-20">
        <SectionHeading title="You may also like" href={category ? `/category/${category.slug}` : '/products'} />
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  )
}
