import { Hero } from '@/components/home/hero'
import { TrustStrip } from '@/components/home/trust-strip'
import { CategoryGrid } from '@/components/home/category-grid'
import { FlashDeals } from '@/components/home/flash-deals'
import { PromoBanners } from '@/components/home/promo-banners'
import { TrendingProducts } from '@/components/home/trending-products'
import { SellerSpotlight } from '@/components/home/seller-spotlight'

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <CategoryGrid />
      <FlashDeals />
      <PromoBanners />
      <TrendingProducts />
      <SellerSpotlight />
    </>
  )
}
