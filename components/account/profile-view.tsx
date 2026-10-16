'use client'

import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { BadgeCheck, Camera, MapPin, Package, Heart, Store } from 'lucide-react'
import { initialsOf, useAuth, type Gender } from '@/components/auth-provider'
import { useShop } from '@/components/shop-provider'
import { useWishlists } from '@/components/wishlist-provider'
import { Avatar } from '@/components/account/account-menu'
import { AccountShell, Card } from '@/components/account/account-shell'
import { Field, Select, SubmitButton, inputClass } from '@/components/forms'
import { countries, getCountry, maxBirthDate, type CountryCode } from '@/lib/geo'

export function ProfileView() {
  return (
    <AccountShell title="My profile" description="Manage your personal details and default delivery location.">
      <ProfileContent />
    </AccountShell>
  )
}

function ProfileContent() {
  const { user, updateProfile } = useAuth()
  const { orders, addresses, wishlist } = useShop()
  const { lists } = useWishlists()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(() => ({
    firstName: user!.firstName,
    lastName: user!.lastName,
    phone: user!.phone,
    country: user!.country,
    region: user!.region,
    birthDate: user!.birthDate,
    gender: user!.gender,
    marketing: user!.marketing,
  }))
  if (!user) return null
  const country = getCountry(form.country)
  const dirty = (Object.keys(form) as (keyof typeof form)[]).some((k) => form[k] !== user[k])

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    if (form.firstName.trim().length < 2 || form.lastName.trim().length < 2) return toast.error('Please enter your full name')
    setSaving(true)
    const res = await updateProfile({ ...form, firstName: form.firstName.trim(), lastName: form.lastName.trim() })
    setSaving(false)
    if (res.ok) toast.success('Profile updated')
    else toast.error(res.error)
  }

  function onAvatar(file: File) {
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image')
    if (file.size > 3 * 1024 * 1024) return toast.error('Image must be under 3MB')
    const reader = new FileReader()
    reader.onload = () => {
      updateProfile({ avatarUrl: String(reader.result) })
      toast.success('Profile photo updated')
    }
    reader.readAsDataURL(file)
  }

  const stats = [
    { label: 'Orders', value: orders.length, href: '/orders', icon: Package },
    { label: 'Saved items', value: wishlist.size, href: '/wishlist', icon: Heart },
    { label: 'Gift lists', value: lists.length, href: '/wishlist', icon: Heart },
    { label: 'Addresses', value: addresses.length, href: '/account/addresses', icon: MapPin },
  ]

  const defaultAddress = addresses[0]

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative w-fit">
            <Avatar name={initialsOf(user)} src={user.avatarUrl} size="lg" />
            <label className="absolute -bottom-1 -right-1 flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-foreground text-background hover:opacity-90">
              <Camera className="size-4" aria-hidden="true" />
              <span className="sr-only">Change profile photo</span>
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && onAvatar(e.target.files[0])} />
            </label>
          </div>
          <div className="flex-1">
            <p className="text-xl font-semibold">{`${user.firstName} ${user.lastName}`}</p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              {user.email}
              {user.emailVerified && <BadgeCheck className="size-4 text-primary" aria-label="Verified email" />}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {`Member since ${new Date(user.createdAt).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })}`}
            </p>
          </div>
          {user.seller ? (
            <Link href="/sell" className="flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium hover:bg-muted">
              <Store className="size-4" aria-hidden="true" />
              {user.seller.status === 'approved' ? 'Seller dashboard' : 'Application under review'}
            </Link>
          ) : (
            <Link href="/sell" className="flex h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background hover:opacity-90">
              <Store className="size-4" aria-hidden="true" />
              Start selling
            </Link>
          )}
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <Link key={s.label} href={s.href} className="rounded-xl bg-muted/60 p-3 transition-colors hover:bg-muted">
              <dt className="text-xs text-muted-foreground">{s.label}</dt>
              <dd className="font-display text-2xl font-semibold tabular-nums">{s.value}</dd>
            </Link>
          ))}
        </dl>
      </Card>

      <Card
        title="Default delivery location"
        description="Used to estimate delivery fees and pre-fill checkout."
        action={
          <Link href="/account/addresses" className="text-sm font-medium text-primary hover:underline underline-offset-2">
            Manage
          </Link>
        }
      >
        {defaultAddress ? (
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div className="text-sm">
              <p className="font-medium">{`${defaultAddress.fullName} · ${defaultAddress.label}`}</p>
              <p className="text-muted-foreground">{`${defaultAddress.line1}, ${defaultAddress.city}, ${defaultAddress.state}`}</p>
              <p className="text-muted-foreground">{defaultAddress.phone}</p>
            </div>
          </div>
        ) : (
          <Link href="/account/addresses" className="flex items-center gap-2 text-sm font-medium text-primary">
            <MapPin className="size-4" aria-hidden="true" />
            Add a delivery address
          </Link>
        )}
      </Card>

      <Card title="Personal details" description="Your email is used to sign in and cannot be changed here.">
        <form onSubmit={onSave} className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" htmlFor="pf-first">
            <input id="pf-first" autoComplete="given-name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Last name" htmlFor="pf-last">
            <input id="pf-last" autoComplete="family-name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Email" htmlFor="pf-email">
            <input id="pf-email" value={user.email} readOnly disabled className={`${inputClass} opacity-70`} />
          </Field>
          <Field label="Phone number" htmlFor="pf-phone">
            <div className="flex gap-2">
              <span className="flex h-12 shrink-0 items-center rounded-xl border bg-muted/50 px-3 text-sm font-medium tabular-nums">{country.dialCode}</span>
              <input id="pf-phone" type="tel" autoComplete="tel-national" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
            </div>
          </Field>
          <Field label="Country" htmlFor="pf-country">
            <Select id="pf-country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value as CountryCode, region: '' })}>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <Field label={country.regionLabel} htmlFor="pf-region">
            <Select id="pf-region" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
              <option value="">{`Select ${country.regionLabel.toLowerCase()}`}</option>
              {country.regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </Select>
          </Field>
          <Field label="Date of birth" htmlFor="pf-dob">
            <input id="pf-dob" type="date" max={maxBirthDate(16)} value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Gender" htmlFor="pf-gender" optional>
            <Select id="pf-gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}>
              <option value="prefer-not">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </Select>
          </Field>
          <label className="flex cursor-pointer items-center gap-3 text-sm sm:col-span-2">
            <input type="checkbox" checked={form.marketing} onChange={(e) => setForm({ ...form, marketing: e.target.checked })} className="size-4 accent-primary" />
            Email me deals, price drops and new arrivals
          </label>
          <div className="flex justify-end gap-3 sm:col-span-2">
            <SubmitButton loading={saving} disabled={!dirty || saving} className="w-auto px-6">
              Save changes
            </SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  )
}
