import { BadgeCheck } from 'lucide-react'
import { reviewsSample, type Product } from '@/lib/data'
import { Rating } from '@/components/rating'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const distribution = [72, 18, 6, 3, 1]

export function ProductDetails({ product }: { product: Product }) {
  return (
    <Tabs defaultValue="specs" className="gap-6">
      <TabsList>
        <TabsTrigger value="specs">Specifications</TabsTrigger>
        <TabsTrigger value="reviews">{`Reviews (${product.reviews.toLocaleString()})`}</TabsTrigger>
      </TabsList>

      <TabsContent value="specs">
        <dl className="divide-y overflow-hidden rounded-2xl border">
          {[{ label: 'Brand', value: product.brand }, ...product.specs].map((s) => (
            <div key={s.label} className="grid grid-cols-[minmax(0,160px)_1fr] gap-4 px-5 py-3.5 text-sm">
              <dt className="text-muted-foreground">{s.label}</dt>
              <dd className="font-medium">{s.value}</dd>
            </div>
          ))}
        </dl>
      </TabsContent>

      <TabsContent value="reviews">
        <div className="grid gap-10 md:grid-cols-[280px_1fr]">
          <div>
            <p className="font-display text-5xl font-semibold">{product.rating.toFixed(1)}</p>
            <Rating value={product.rating} size="md" className="mt-2" />
            <p className="mt-1 text-sm text-muted-foreground">{`Based on ${product.reviews.toLocaleString()} reviews`}</p>
            <ul className="mt-6 flex flex-col gap-2">
              {distribution.map((pct, i) => (
                <li key={i} className="flex items-center gap-3 text-xs">
                  <span className="w-3 text-muted-foreground">{5 - i}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <span className="block h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                  </span>
                  <span className="w-8 text-right text-muted-foreground">{`${pct}%`}</span>
                </li>
              ))}
            </ul>
          </div>
          <ul className="flex flex-col divide-y">
            {reviewsSample.map((r) => (
              <li key={r.id} className="py-5 first:pt-0">
                <div className="flex items-center justify-between gap-3">
                  <Rating value={r.rating} />
                  <span className="text-xs text-muted-foreground">{r.date}</span>
                </div>
                <p className="mt-2 font-medium">{r.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                <p className="mt-3 flex items-center gap-1.5 text-xs">
                  <span className="font-medium">{r.name}</span>
                  {r.verified && (
                    <span className="flex items-center gap-1 text-primary">
                      <BadgeCheck className="size-3.5" />
                      Verified purchase
                    </span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </TabsContent>
    </Tabs>
  )
}
