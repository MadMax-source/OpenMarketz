import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { getProductsBySeller, getSeller, sellers } from '@/lib/data'
import { StoreHeader } from '@/components/store/store-header'
import { ListingView } from '@/components/listing/listing-view'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function generateStaticParams() {
  return sellers.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const seller = getSeller(slug)
  return { title: seller?.name ?? 'Store', description: seller?.tagline }
}

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const seller = getSeller(slug)
  if (!seller) notFound()
  const items = getProductsBySeller(seller.id)

  return (
    <>
      <StoreHeader seller={seller} productCount={items.length} />
      <div className="mx-auto max-w-7xl px-4 pt-10 md:px-6">
        <Tabs defaultValue="products" className="gap-8">
          <TabsList>
            <TabsTrigger value="products">{`Products (${items.length})`}</TabsTrigger>
            <TabsTrigger value="about">About the store</TabsTrigger>
          </TabsList>
          <TabsContent value="products">
            <ListingView products={items} showCategoryFilter emptyMessage="This store has no matching products." />
          </TabsContent>
          <TabsContent value="about">
            <div className="grid gap-8 md:grid-cols-[1fr_320px]">
              <div>
                <h2 className="font-display text-xl font-semibold">{`About ${seller.name}`}</h2>
                <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{seller.about}</p>
              </div>
              <div className="rounded-2xl bg-secondary p-5">
                <ShieldCheck className="size-6 text-primary" aria-hidden="true" />
                <p className="mt-3 font-medium">
                  {seller.verified ? 'Verified by OpenMarketz' : 'Verification in progress'}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {seller.verified
                    ? 'This seller passed ID, business registration and address checks. Every order is covered by buyer protection.'
                    : 'Orders from this seller are still fully covered by OpenMarketz buyer protection and escrow payments.'}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
