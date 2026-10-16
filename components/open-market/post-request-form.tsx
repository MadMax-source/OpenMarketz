'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Lightbulb } from 'lucide-react'
import { categories, formatPrice } from '@/lib/data'
import { countries } from '@/lib/geo'
import { conditionLabels, type RequestCondition } from '@/lib/open-market'
import { useAuth } from '@/components/auth-provider'
import { useOpenMarket } from '@/components/open-market/open-market-provider'
import { Field, FileDrop, Select, SubmitButton, inputClass } from '@/components/forms'
import { cn } from '@/lib/utils'

export function PostRequestForm() {
  const router = useRouter()
  const { user } = useAuth()
  const { postRequest } = useOpenMarket()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [condition, setCondition] = useState<RequestCondition>('any')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [state, setState] = useState(user?.region ?? '')
  const [city, setCity] = useState('')
  const [neededBy, setNeededBy] = useState('')
  const [photo, setPhoto] = useState<{ name: string; url: string } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const states = countries[0].regions

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const min = Number(budgetMin)
    const max = Number(budgetMax)
    const qty = Number(quantity)
    const err: Record<string, string> = {}
    if (title.trim().length < 8) err.title = 'Give a clear title (at least 8 characters).'
    if (description.trim().length < 30) err.description = 'Add more detail so sellers can make accurate offers (30+ characters).'
    if (!category) err.category = 'Choose a category.'
    if (!min || min < 500) err.budgetMin = 'Enter a minimum budget.'
    if (!max || max < min) err.budgetMax = 'Maximum must be at least the minimum.'
    if (!Number.isInteger(qty) || qty < 1 || qty > 10000) err.quantity = 'Enter a quantity between 1 and 10,000.'
    if (!state) err.state = 'Choose your state.'
    if (!city.trim()) err.city = 'Enter your city or area.'
    setErrors(err)
    if (Object.keys(err).length) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    const req = postRequest({
      title: title.trim(), description: description.trim(), category, condition, budgetMin: min, budgetMax: max, quantity: qty,
      location: `${city.trim()}, ${state}`, neededBy, image: photo?.url,
    })
    router.push(`/open-market/requests/${req.id}?posted=1`)
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-8 md:px-6 lg:grid-cols-[1fr_300px]">
      <div>
        <Link href="/open-market" className="text-xs font-medium uppercase tracking-wider text-primary">Open Market</Link>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Post a request</h1>
        <p className="mt-1 text-muted-foreground">Tell sellers exactly what you want. They will reply with offers.</p>

        <form onSubmit={submit} className="mt-8 flex flex-col gap-5" noValidate>
          <Field label="What are you looking for?" error={errors.title} htmlFor="t">
            <input id="t" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={90} placeholder="e.g. 3.5kVA petrol generator for home use" className={inputClass} aria-invalid={!!errors.title || undefined} />
          </Field>
          <Field label="Details" error={errors.description} hint="Brand, size, colour, specs, warranty, anything that matters." htmlFor="d">
            <textarea id="d" rows={5} value={description} maxLength={800} onChange={(e) => setDescription(e.target.value)} className={cn(inputClass, 'h-auto py-3')} aria-invalid={!!errors.description || undefined} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" error={errors.category} htmlFor="c">
              <Select id="c" value={category} onChange={(e) => setCategory(e.target.value)} aria-invalid={!!errors.category || undefined}>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="Quantity" error={errors.quantity} htmlFor="qty">
              <input id="qty" type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputClass} aria-invalid={!!errors.quantity || undefined} />
            </Field>
          </div>
          <fieldset>
            <legend className="text-sm font-medium">Condition</legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(Object.keys(conditionLabels) as RequestCondition[]).map((c) => (
                <label key={c} className={cn('flex h-11 cursor-pointer items-center justify-center rounded-xl border text-sm', condition === c && 'border-primary bg-primary/5 font-medium')}>
                  <input type="radio" name="cond" className="sr-only" checked={condition === c} onChange={() => setCondition(c)} />
                  {conditionLabels[c]}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Budget from (₦)" error={errors.budgetMin} htmlFor="bmin">
              <input id="bmin" inputMode="numeric" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value.replace(/\D/g, ''))} placeholder="250000" className={inputClass} aria-invalid={!!errors.budgetMin || undefined} />
            </Field>
            <Field label="Budget up to (₦)" error={errors.budgetMax} hint={budgetMax ? formatPrice(Number(budgetMax)) : undefined} htmlFor="bmax">
              <input id="bmax" inputMode="numeric" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value.replace(/\D/g, ''))} placeholder="380000" className={inputClass} aria-invalid={!!errors.budgetMax || undefined} />
            </Field>
            <Field label="State" error={errors.state} htmlFor="st">
              <Select id="st" value={state} onChange={(e) => setState(e.target.value)} aria-invalid={!!errors.state || undefined}>
                <option value="">Select state</option>
                {states.map((s) => <option key={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="City / area" error={errors.city} htmlFor="city">
              <input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Ikeja" className={inputClass} aria-invalid={!!errors.city || undefined} />
            </Field>
            <Field label="Needed by" optional htmlFor="nb">
              <input id="nb" type="date" value={neededBy} onChange={(e) => setNeededBy(e.target.value)} className={inputClass} />
            </Field>
          </div>
          <Field label="Reference photo" optional>
            <FileDrop label="Add a photo" accept="image/*" hint="Helps sellers match exactly what you want" file={photo} previewUrl={photo?.url} onFile={(f) => setPhoto({ name: f.name, url: URL.createObjectURL(f) })} onClear={() => setPhoto(null)} />
          </Field>
          <SubmitButton loading={loading} className="sm:w-auto sm:self-start sm:px-10">Post request</SubmitButton>
        </form>
      </div>
      <aside className="flex flex-col gap-3 rounded-3xl bg-accent p-6 text-accent-foreground lg:sticky lg:top-40 lg:self-start">
        <Lightbulb className="size-6 text-primary" aria-hidden="true" />
        <h2 className="font-semibold">Tips for better offers</h2>
        <ul className="flex list-disc flex-col gap-2 pl-4 text-sm text-accent-foreground/85">
          <li>Be specific about brand, model or size.</li>
          <li>A realistic budget gets more replies.</li>
          <li>Add a photo of what you have in mind.</li>
          <li>Never pay outside OpenMarketz — escrow protects you.</li>
        </ul>
      </aside>
    </div>
  )
}
