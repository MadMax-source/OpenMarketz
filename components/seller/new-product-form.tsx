'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { categories, formatPrice } from '@/lib/data'
import type { Product } from '@/lib/data'
import { useSeller } from '@/components/seller/seller-provider'
import { PageHeader } from '@/components/seller/seller-shell'
import { Field, FileDrop, FormAlert, Select, inputClass } from '@/components/forms'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

const conditions: NonNullable<Product['condition']>[] = ['Brand new', 'Foreign used', 'Locally used']

export function NewProductForm() {
  const router = useRouter()
  const { addListing } = useSeller()
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState(categories[0].slug)
  const [condition, setCondition] = useState<NonNullable<Product['condition']>>('Brand new')
  const [price, setPrice] = useState('')
  const [compareAt, setCompareAt] = useState('')
  const [stock, setStock] = useState('1')
  const [description, setDescription] = useState('')
  const [highlights, setHighlights] = useState('')
  const [negotiable, setNegotiable] = useState(true)
  const [minPrice, setMinPrice] = useState('')
  const [freeDelivery, setFreeDelivery] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>()
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!file) return setPreview(undefined)
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const priceNum = Number(price)
  const floorNum = Number(minPrice)
  const fee = Math.round(priceNum * 0.05)

  function validate() {
    const e: Record<string, string> = {}
    if (name.trim().length < 4) e.name = 'Give your product a clear name.'
    if (!Number.isFinite(priceNum) || priceNum < 100) e.price = 'Enter a price of at least ₦100.'
    if (compareAt && Number(compareAt) <= priceNum) e.compareAt = 'Original price must be higher than the selling price.'
    if (!Number.isInteger(Number(stock)) || Number(stock) < 0) e.stock = 'Enter a whole number.'
    if (description.trim().length < 30) e.description = 'Describe the product in at least 30 characters.'
    if (negotiable && minPrice && (floorNum >= priceNum || floorNum <= 0)) e.minPrice = 'Lowest price must be below the selling price.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function submit(status: 'active' | 'draft') {
    if (!validate()) {
      toast.error('Please fix the highlighted fields.')
      return
    }
    // Object URLs die on unmount, so the demo falls back to the category artwork for the listing image.
    const image = categories.find((c) => c.slug === category)?.image ?? '/placeholder.svg'
    addListing({
      name: name.trim(),
      brand: brand.trim() || 'Unbranded',
      category,
      condition,
      price: priceNum,
      compareAt: compareAt ? Number(compareAt) : undefined,
      stock: Number(stock),
      description: description.trim(),
      highlights: highlights.split('\n').map((h) => h.trim()).filter(Boolean),
      negotiable,
      minPrice: negotiable && minPrice ? floorNum : undefined,
      freeDelivery,
      image,
      gallery: [image],
      status,
    })
    toast.success(status === 'active' ? 'Your product is live' : 'Draft saved')
    router.push('/seller/products')
  }

  return (
    <div>
      <PageHeader title="Post a product" description="Buyers across Nigeria will see this listing on OpenMarketz." />
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          submit('active')
        }}
        className="grid gap-6 lg:grid-cols-[1fr_300px]"
      >
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-4 rounded-3xl border bg-card p-5">
            <h2 className="font-semibold">Photos</h2>
            <FileDrop
              label="Product photo"
              accept="image/*"
              file={file}
              previewUrl={preview}
              onFile={setFile}
              onClear={() => setFile(null)}
              hint="JPG or PNG, at least 800×800. Clear photos on a plain background sell faster."
            />
          </section>

          <section className="flex flex-col gap-4 rounded-3xl border bg-card p-5">
            <h2 className="font-semibold">Details</h2>
            <Field label="Product name" htmlFor="p-name" error={errors.name}>
              <input id="p-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Samsung Galaxy A55 128GB" className={inputClass} aria-invalid={!!errors.name} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Brand" htmlFor="p-brand" optional>
                <input id="p-brand" value={brand} onChange={(e) => setBrand(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Category" htmlFor="p-cat">
                <Select id="p-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </Select>
              </Field>
              <Field label="Condition" htmlFor="p-cond">
                <Select id="p-cond" value={condition} onChange={(e) => setCondition(e.target.value as typeof condition)}>
                  {conditions.map((c) => <option key={c}>{c}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Description" htmlFor="p-desc" error={errors.description}>
              <textarea id="p-desc" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} aria-invalid={!!errors.description} className={cn(inputClass, 'h-auto resize-none py-3')} />
            </Field>
            <Field label="Key highlights" htmlFor="p-hl" optional hint="One per line, e.g. 12-month warranty">
              <textarea id="p-hl" rows={3} value={highlights} onChange={(e) => setHighlights(e.target.value)} className={cn(inputClass, 'h-auto resize-none py-3')} />
            </Field>
          </section>

          <section className="flex flex-col gap-4 rounded-3xl border bg-card p-5">
            <h2 className="font-semibold">Price, stock & bargaining</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Selling price (₦)" htmlFor="p-price" error={errors.price}>
                <input id="p-price" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} className={inputClass} aria-invalid={!!errors.price} />
              </Field>
              <Field label="Original price (₦)" htmlFor="p-compare" optional error={errors.compareAt}>
                <input id="p-compare" inputMode="numeric" value={compareAt} onChange={(e) => setCompareAt(e.target.value.replace(/\D/g, ''))} className={inputClass} />
              </Field>
              <Field label="Quantity in stock" htmlFor="p-stock" error={errors.stock}>
                <input id="p-stock" inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value.replace(/\D/g, ''))} className={inputClass} />
              </Field>
            </div>

            <div className="flex items-start justify-between gap-4 rounded-2xl bg-muted/50 p-4">
              <div>
                <p className="text-sm font-medium">Allow buyers to bargain</p>
                <p className="text-xs text-muted-foreground">Buyers can send offers. You choose to accept, counter or decline.</p>
              </div>
              <Switch checked={negotiable} onCheckedChange={setNegotiable} aria-label="Allow bargaining" />
            </div>
            {negotiable && (
              <Field label="Lowest price you'd accept (₦)" htmlFor="p-min" optional error={errors.minPrice} hint="Private. Offers below this are declined automatically.">
                <input id="p-min" inputMode="numeric" value={minPrice} onChange={(e) => setMinPrice(e.target.value.replace(/\D/g, ''))} className={inputClass} />
              </Field>
            )}
            <div className="flex items-start justify-between gap-4 rounded-2xl bg-muted/50 p-4">
              <div>
                <p className="text-sm font-medium">Offer free delivery</p>
                <p className="text-xs text-muted-foreground">You cover the OpenMarketz delivery fee for this item.</p>
              </div>
              <Switch checked={freeDelivery} onCheckedChange={setFreeDelivery} aria-label="Offer free delivery" />
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-28 lg:h-fit">
          <div className="overflow-hidden rounded-3xl border bg-card">
            <div className="relative aspect-square bg-muted">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="size-full object-cover" />
              ) : (
                <Image src={categories.find((c) => c.slug === category)?.image ?? '/placeholder.svg'} alt="" fill sizes="300px" className="object-cover opacity-60" />
              )}
            </div>
            <div className="p-4">
              <p className="text-xs text-muted-foreground">Preview</p>
              <p className="truncate font-medium">{name || 'Your product name'}</p>
              <p className="font-display text-lg font-semibold">{priceNum ? formatPrice(priceNum) : '₦0'}</p>
              {negotiable && <p className="text-xs font-medium text-primary">Open to offers</p>}
            </div>
          </div>
          {priceNum > 0 && (
            <FormAlert tone="info">{`OpenMarketz commission (5%): ${formatPrice(fee)}. You receive ${formatPrice(priceNum - fee)} per sale after delivery.`}</FormAlert>
          )}
          <button type="submit" className="h-12 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90">Publish product</button>
          <button type="button" onClick={() => submit('draft')} className="h-12 rounded-xl border text-sm font-semibold hover:bg-muted">Save as draft</button>
        </aside>
      </form>
    </div>
  )
}
