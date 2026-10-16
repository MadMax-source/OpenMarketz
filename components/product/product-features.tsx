import { Sparkles } from 'lucide-react'
import type { Product } from '@/lib/data'

export function ProductFeatures({ product }: { product: Product }) {
  if (!product.features?.length) return null
  return (
    <section aria-labelledby="features-heading">
      <div className="flex items-center gap-2">
        <Sparkles className="size-5 text-primary" aria-hidden="true" />
        <h2 id="features-heading" className="font-display text-2xl font-semibold tracking-tight">
          Key features
        </h2>
      </div>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {product.features.map((f, i) => (
          <li key={f.title} className="flex gap-4 rounded-2xl border bg-card p-5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-semibold text-primary">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <p className="font-medium">{f.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
