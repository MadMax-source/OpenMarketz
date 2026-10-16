'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Briefcase, Home, MapPin, MoreHorizontal, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { useShop, type Address } from '@/components/shop-provider'
import { useAuth } from '@/components/auth-provider'
import { AccountShell } from '@/components/account/account-shell'
import { Field, Select, SubmitButton, inputClass } from '@/components/forms'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { getCountry } from '@/lib/geo'
import { cn } from '@/lib/utils'

type Draft = Omit<Address, 'id'> & { id?: string }

const labelIcons = { Home, Work: Briefcase, Other: MapPin }

const blankDraft = (): Draft => ({ fullName: '', phone: '', line1: '', city: '', state: '', landmark: '', label: 'Home' })

export function AddressesView() {
  const [editing, setEditing] = useState<Draft | null>(null)
  return (
    <AccountShell
      title="Addresses"
      description="Choose where your orders and gifts should be delivered."
      actions={
        <button
          type="button"
          onClick={() => setEditing(blankDraft())}
          className="flex h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background hover:opacity-90"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add address
        </button>
      }
    >
      <AddressList onEdit={setEditing} />
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Edit address' : 'New delivery address'}</DialogTitle>
            <DialogDescription>Riders call this number on delivery day.</DialogDescription>
          </DialogHeader>
          {editing && <AddressForm key={editing.id ?? 'new'} initial={editing} onDone={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </AccountShell>
  )
}

function AddressList({ onEdit }: { onEdit: (d: Draft) => void }) {
  const { addresses, removeAddress, selectedAddressId, setSelectedAddressId } = useShop()
  const defaultId = selectedAddressId ?? addresses[0]?.id

  if (addresses.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted">
          <MapPin className="size-5 text-muted-foreground" aria-hidden="true" />
        </span>
        <p className="font-medium">No saved addresses yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">Add a delivery address so checkout is faster and delivery fees are accurate.</p>
        <button type="button" onClick={() => onEdit(blankDraft())} className="mt-2 h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
          Add your first address
        </button>
      </div>
    )
  }

  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {addresses.map((a) => {
        const Icon = labelIcons[a.label]
        const isDefault = a.id === defaultId
        return (
          <li key={a.id} className={cn('flex flex-col gap-3 rounded-2xl border bg-card p-5', isDefault && 'border-primary ring-1 ring-primary')}>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Icon className="size-4 text-primary" aria-hidden="true" />
                {a.label}
                {isDefault && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">Default</span>}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex size-8 items-center justify-center rounded-full hover:bg-muted" aria-label={`Options for ${a.label} address`}>
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => onEdit(a)}>
                    <Pencil className="size-4" aria-hidden="true" /> Edit
                  </DropdownMenuItem>
                  {!isDefault && (
                    <DropdownMenuItem onSelect={() => { setSelectedAddressId(a.id); toast.success('Default address updated') }}>
                      <Star className="size-4" aria-hidden="true" /> Set as default
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onSelect={() => { removeAddress(a.id); toast('Address removed') }} className="text-destructive focus:text-destructive">
                    <Trash2 className="size-4" aria-hidden="true" /> Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="text-sm leading-relaxed">
              <p className="font-medium">{a.fullName}</p>
              <p className="text-muted-foreground">{a.line1}</p>
              {a.landmark && <p className="text-muted-foreground">{`Near ${a.landmark}`}</p>}
              <p className="text-muted-foreground">{`${a.city}, ${a.state}`}</p>
              <p className="mt-1 tabular-nums text-muted-foreground">{a.phone}</p>
            </div>
            {!isDefault && (
              <button type="button" onClick={() => setSelectedAddressId(a.id)} className="mt-auto w-fit text-sm font-medium text-primary underline-offset-2 hover:underline">
                Deliver here by default
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function AddressForm({ initial, onDone }: { initial: Draft; onDone: () => void }) {
  const { saveAddress, setSelectedAddressId } = useShop()
  const { user } = useAuth()
  const country = getCountry(user?.country ?? 'NG')
  const [form, setForm] = useState<Draft>(() => ({
    ...initial,
    fullName: initial.fullName || (user ? `${user.firstName} ${user.lastName}` : ''),
    state: initial.state || user?.region || '',
  }))
  const [makeDefault, setMakeDefault] = useState(!initial.id)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setForm((f) => ({ ...f, [k]: v }))

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (form.fullName.trim().length < 3) next.fullName = "Enter the recipient's full name"
    if (!/^\+?[0-9\s-]{10,16}$/.test(form.phone.trim())) next.phone = 'Enter a valid phone number'
    if (form.line1.trim().length < 5) next.line1 = 'Enter a street address'
    if (form.city.trim().length < 2) next.city = 'Enter a city or area'
    if (!form.state) next.state = `Select a ${country.regionLabel.toLowerCase()}`
    setErrors(next)
    if (Object.keys(next).length) return
    const saved = saveAddress({ ...form, fullName: form.fullName.trim(), line1: form.line1.trim(), city: form.city.trim() })
    if (makeDefault) setSelectedAddressId(saved.id)
    toast.success(initial.id ? 'Address updated' : 'Address saved')
    onDone()
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
      <fieldset className="sm:col-span-2">
        <legend className="mb-2 text-sm font-medium">Label</legend>
        <div className="flex gap-2">
          {(['Home', 'Work', 'Other'] as const).map((l) => {
            const Icon = labelIcons[l]
            return (
              <label key={l} className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:text-primary">
                <input type="radio" name="label" value={l} checked={form.label === l} onChange={() => set('label', l)} className="sr-only" />
                <Icon className="size-4" aria-hidden="true" />
                {l}
              </label>
            )
          })}
        </div>
      </fieldset>
      <Field label="Recipient name" htmlFor="ad-name" error={errors.fullName}>
        <input id="ad-name" autoComplete="name" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} className={inputClass} />
      </Field>
      <Field label="Phone number" htmlFor="ad-phone" error={errors.phone}>
        <input id="ad-phone" type="tel" autoComplete="tel" placeholder={`${country.dialCode} 801 234 5678`} value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputClass} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Street address" htmlFor="ad-line1" error={errors.line1}>
          <input id="ad-line1" autoComplete="street-address" placeholder="House number and street name" value={form.line1} onChange={(e) => set('line1', e.target.value)} className={inputClass} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Nearest landmark" htmlFor="ad-landmark" optional>
          <input id="ad-landmark" placeholder="e.g. Opposite Shoprite" value={form.landmark ?? ''} onChange={(e) => set('landmark', e.target.value)} className={inputClass} />
        </Field>
      </div>
      <Field label="City / Area" htmlFor="ad-city" error={errors.city}>
        <input id="ad-city" autoComplete="address-level2" value={form.city} onChange={(e) => set('city', e.target.value)} className={inputClass} />
      </Field>
      <Field label={country.regionLabel} htmlFor="ad-state" error={errors.state}>
        <Select id="ad-state" value={form.state} onChange={(e) => set('state', e.target.value)} aria-invalid={!!errors.state}>
          <option value="">Select</option>
          {country.regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </Select>
      </Field>
      <label className="flex cursor-pointer items-center gap-3 text-sm sm:col-span-2">
        <input type="checkbox" checked={makeDefault} onChange={(e) => setMakeDefault(e.target.checked)} className="size-4 accent-primary" />
        Use as my default delivery address
      </label>
      <div className="sm:col-span-2">
        <SubmitButton>{initial.id ? 'Save changes' : 'Save address'}</SubmitButton>
      </div>
    </form>
  )
}
