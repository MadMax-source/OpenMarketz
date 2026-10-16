'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { BadgeCheck, Building2, Check, IdCard, Landmark, Store } from 'lucide-react'
import { categories } from '@/lib/data'
import { countries, getCountry, maxBirthDate, type CountryCode } from '@/lib/geo'
import { useAuth } from '@/components/auth-provider'
import { Field, FileDrop, FormAlert, Select, SubmitButton, inputClass } from '@/components/forms'
import { cn } from '@/lib/utils'

const steps = [
  { label: 'Brand', icon: Store },
  { label: 'Owner & ID', icon: IdCard },
  { label: 'Business', icon: Building2 },
  { label: 'Payout', icon: Landmark },
]

type Upload = { name: string; url: string } | null
const toUpload = (f: File): Upload => ({ name: f.name, url: URL.createObjectURL(f) })

export function SellerOnboarding() {
  const { user, submitSellerApplication } = useAuth()
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const [brandName, setBrandName] = useState('')
  const [handle, setHandle] = useState('')
  const [description, setDescription] = useState('')
  const [cats, setCats] = useState<string[]>([])
  const [logo, setLogo] = useState<Upload>(null)
  const [banner, setBanner] = useState<Upload>(null)

  const [ownerName, setOwnerName] = useState(user ? `${user.firstName} ${user.lastName}` : '')
  const [birthDate, setBirthDate] = useState('')
  const [country, setCountry] = useState<CountryCode>(user?.country ?? 'NG')
  const c = getCountry(country)
  const [idType, setIdType] = useState(c.idTypes[0].value)
  const [idNumber, setIdNumber] = useState('')
  const [idDoc, setIdDoc] = useState<Upload>(null)
  const [selfie, setSelfie] = useState<Upload>(null)

  const [businessType, setBusinessType] = useState<'individual' | 'registered'>('individual')
  const [regNumber, setRegNumber] = useState('')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [region, setRegion] = useState(user?.region ?? '')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')

  const [bank, setBank] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [agree, setAgree] = useState(false)

  const id = c.idTypes.find((t) => t.value === idType) ?? c.idTypes[0]

  if (!user) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-20 text-center">
        <Store className="size-8 text-primary" aria-hidden="true" />
        <h1 className="font-display text-3xl font-semibold">Start selling on OpenMarketz</h1>
        <p className="text-muted-foreground">Create a free account or sign in first. Your seller store is linked to your personal account.</p>
        <div className="flex gap-3">
          <Link href="/signup?next=/sell" className="flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground">Create account</Link>
          <Link href="/login?next=/sell" className="flex h-11 items-center rounded-xl border px-5 text-sm font-semibold hover:bg-muted">Sign in</Link>
        </div>
      </div>
    )
  }

  if (user.seller) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-20 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <BadgeCheck className="size-8" aria-hidden="true" />
        </span>
        <h1 className="font-display text-3xl font-semibold">{`${user.seller.brandName} is under review`}</h1>
        <p className="text-muted-foreground">
          {`We're verifying your ${getCountry(user.seller.country).idTypes.find((t) => t.value === user.seller?.idType)?.label ?? 'ID'} and business details. This usually takes 24–48 hours. We'll email ${user.seller.businessEmail} when your store is live.`}
        </p>
        {user.seller.bannerUrl && (
          <div className="relative aspect-[3/1] w-full overflow-hidden rounded-2xl bg-muted">
            <Image src={user.seller.bannerUrl} alt="" fill className="object-cover" unoptimized />
          </div>
        )}
        <Link href="/" className="flex h-11 items-center rounded-xl bg-foreground px-5 text-sm font-medium text-background">Back to shopping</Link>
      </div>
    )
  }

  function validate(s: number) {
    const e: Record<string, string> = {}
    if (s === 0) {
      if (brandName.trim().length < 2) e.brandName = 'Enter your brand name.'
      if (!/^[a-z0-9-]{3,30}$/.test(handle)) e.handle = '3–30 lowercase letters, numbers or hyphens.'
      if (description.trim().length < 40) e.description = 'Describe your company in at least 40 characters.'
      if (cats.length === 0) e.cats = 'Choose at least one category.'
      if (!logo) e.logo = 'Upload your brand logo.'
      if (!banner) e.banner = 'Upload a horizontal store banner.'
    }
    if (s === 1) {
      if (ownerName.trim().split(/\s+/).length < 2) e.ownerName = 'Enter your full legal name (first and last).'
      if (!birthDate || birthDate > maxBirthDate(18)) e.birthDate = 'You must be 18 or older to sell.'
      if (!id.pattern.test(idNumber.trim())) e.idNumber = `Invalid ${id.label}. ${id.hint}.`
      if (!idDoc) e.idDoc = 'Upload a clear photo of your ID.'
      if (!selfie) e.selfie = 'Upload a selfie holding your ID.'
    }
    if (s === 2) {
      if (businessType === 'registered' && regNumber.trim().length < 5) e.regNumber = 'Enter your business registration number.'
      if (phone.replace(/\D/g, '').length < 7) e.phone = 'Enter a valid phone number.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.email = 'Enter a valid email.'
      if (!region) e.region = `Choose your ${c.regionLabel.toLowerCase()}.`
      if (!city.trim()) e.city = 'Enter your city.'
      if (address.trim().length < 8) e.address = 'Enter your pickup / business address.'
    }
    if (s === 3) {
      if (!bank) e.bank = 'Choose your bank.'
      if (!c.accountNumber.pattern.test(accountNumber)) e.accountNumber = c.accountNumber.hint
      if (accountName.trim().length < 3) e.accountName = 'Enter the account holder name.'
      if (!agree) e.agree = 'You must accept the seller terms.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function next(e: React.FormEvent) {
    e.preventDefault()
    if (!validate(step)) return
    if (step < steps.length - 1) {
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setSubmitting(true)
    await submitSellerApplication({
      brandName: brandName.trim(), handle, logoUrl: logo?.url, bannerUrl: banner?.url, description: description.trim(), categories: cats,
      businessType, registrationNumber: regNumber || undefined, businessPhone: `${c.dialCode} ${phone}`, businessEmail: email,
      country, region, city, address, ownerName: ownerName.trim(), ownerBirthDate: birthDate, idType, idNumber: idNumber.trim(),
      idDocumentName: idDoc?.name ?? '', bank, accountNumber, accountName: accountName.trim(),
    })
    setSubmitting(false)
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 md:px-6 lg:grid-cols-[1fr_360px]">
      <div>
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-primary">Seller verification</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Open your OpenMarketz store</h1>
        <p className="mt-2 text-muted-foreground">Verified sellers get the green badge, higher placement and buyer trust.</p>

        <ol className="mt-8 grid grid-cols-4 gap-2" aria-label="Progress">
          {steps.map(({ label, icon: Icon }, i) => (
            <li key={label} className="flex flex-col gap-2">
              <span className={cn('h-1.5 rounded-full', i <= step ? 'bg-primary' : 'bg-muted')} />
              <span className={cn('flex items-center gap-1.5 text-xs font-medium', i === step ? 'text-foreground' : 'text-muted-foreground')} aria-current={i === step ? 'step' : undefined}>
                {i < step ? <Check className="size-3.5 text-primary" aria-hidden="true" /> : <Icon className="size-3.5" aria-hidden="true" />}
                <span className="hidden sm:inline">{label}</span>
              </span>
            </li>
          ))}
        </ol>

        <form onSubmit={next} className="mt-8 flex flex-col gap-5" noValidate>
          {step === 0 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Brand name" error={errors.brandName} htmlFor="brand">
                  <input id="brand" value={brandName} onChange={(e) => { setBrandName(e.target.value); if (!handle || handle === slug(brandName)) setHandle(slug(e.target.value)) }} className={inputClass} placeholder="e.g. Ankara House" aria-invalid={!!errors.brandName || undefined} />
                </Field>
                <Field label="Store link" error={errors.handle} hint={`openmarketz.ng/store/${handle || 'your-brand'}`} htmlFor="handle">
                  <input id="handle" value={handle} onChange={(e) => setHandle(e.target.value.toLowerCase())} className={inputClass} aria-invalid={!!errors.handle || undefined} />
                </Field>
              </div>
              <Field label="Description of company" error={errors.description} hint={`${description.length}/600 — what you sell, how long you've been in business, what makes you different.`} htmlFor="desc">
                <textarea id="desc" value={description} maxLength={600} rows={4} onChange={(e) => setDescription(e.target.value)} className={cn(inputClass, 'h-auto py-3')} aria-invalid={!!errors.description || undefined} />
              </Field>
              <fieldset className="flex flex-col gap-2">
                <legend className="text-sm font-medium">What do you sell?</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const on = cats.includes(cat.slug)
                    return (
                      <button key={cat.slug} type="button" aria-pressed={on} onClick={() => setCats(on ? cats.filter((x) => x !== cat.slug) : [...cats, cat.slug])} className={cn('h-9 rounded-full border px-4 text-sm', on ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted')}>
                        {cat.name}
                      </button>
                    )
                  })}
                </div>
                {errors.cats && <p role="alert" className="text-xs font-medium text-deal">{errors.cats}</p>}
              </fieldset>
              <div className="grid gap-5 sm:grid-cols-[auto_1fr]">
                <Field label="Brand logo" error={errors.logo}>
                  <FileDrop label="Logo" accept="image/*" shape="square" hint="Square, 400×400" file={logo} previewUrl={logo?.url} onFile={(f) => setLogo(toUpload(f))} onClear={() => setLogo(null)} invalid={!!errors.logo} />
                </Field>
                <Field label="Horizontal store banner" error={errors.banner}>
                  {banner ? (
                    <div className="relative aspect-[3/1] overflow-hidden rounded-2xl bg-muted">
                      <Image src={banner.url} alt="Banner preview" fill className="object-cover" unoptimized />
                      <button type="button" onClick={() => setBanner(null)} className="absolute right-2 top-2 rounded-lg bg-background/90 px-3 py-1 text-xs font-medium">Replace</button>
                    </div>
                  ) : (
                    <FileDrop label="Upload banner" accept="image/*" hint="Landscape, at least 1500×500" file={null} onFile={(f) => setBanner(toUpload(f))} onClear={() => setBanner(null)} invalid={!!errors.banner} />
                  )}
                </Field>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <FormAlert tone="info">Your identity is only used for verification and is never shown to buyers.</FormAlert>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Owner full name" error={errors.ownerName} hint="As it appears on your ID" htmlFor="owner">
                  <input id="owner" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className={inputClass} aria-invalid={!!errors.ownerName || undefined} />
                </Field>
                <Field label="Date of birth" error={errors.birthDate} htmlFor="dob">
                  <input id="dob" type="date" max={maxBirthDate(18)} value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputClass} aria-invalid={!!errors.birthDate || undefined} />
                </Field>
                <Field label="Country" htmlFor="country">
                  <Select id="country" value={country} onChange={(e) => { const nc = e.target.value as CountryCode; setCountry(nc); setIdType(getCountry(nc).idTypes[0].value); setIdNumber(''); setRegion(''); setBank('') }}>
                    {countries.map((x) => <option key={x.code} value={x.code}>{x.name}</option>)}
                  </Select>
                </Field>
                <Field label="Means of identification" htmlFor="idtype">
                  <Select id="idtype" value={idType} onChange={(e) => { setIdType(e.target.value); setIdNumber('') }}>
                    {c.idTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </Select>
                </Field>
                <Field label={`${id.label} number`} error={errors.idNumber} hint={id.hint} htmlFor="idnum" className="sm:col-span-2">
                  <input id="idnum" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder={id.placeholder} className={inputClass} aria-invalid={!!errors.idNumber || undefined} />
                </Field>
                <Field label="Photo of ID" error={errors.idDoc}>
                  <FileDrop label="Upload ID" accept="image/*,application/pdf" hint="Front side, JPG/PNG/PDF" file={idDoc} previewUrl={idDoc?.url} onFile={(f) => setIdDoc(toUpload(f))} onClear={() => setIdDoc(null)} invalid={!!errors.idDoc} />
                </Field>
                <Field label="Selfie holding ID" error={errors.selfie}>
                  <FileDrop label="Upload selfie" accept="image/*" hint="Face and ID clearly visible" file={selfie} previewUrl={selfie?.url} onFile={(f) => setSelfie(toUpload(f))} onClear={() => setSelfie(null)} invalid={!!errors.selfie} />
                </Field>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <fieldset className="sm:col-span-2">
                <legend className="text-sm font-medium">Business type</legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(['individual', 'registered'] as const).map((t) => (
                    <label key={t} className={cn('cursor-pointer rounded-xl border p-4 text-sm', businessType === t && 'border-primary bg-primary/5')}>
                      <input type="radio" name="btype" className="sr-only" checked={businessType === t} onChange={() => setBusinessType(t)} />
                      <span className="font-medium">{t === 'individual' ? 'Individual / sole trader' : 'Registered business'}</span>
                      <span className="block text-xs text-muted-foreground">{t === 'individual' ? 'Selling under your own name' : country === 'NG' ? 'CAC registered (RC / BN)' : 'Company registration number'}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              {businessType === 'registered' && (
                <Field label={country === 'NG' ? 'CAC number' : 'Registration number'} error={errors.regNumber} htmlFor="reg" className="sm:col-span-2">
                  <input id="reg" value={regNumber} onChange={(e) => setRegNumber(e.target.value)} placeholder={country === 'NG' ? 'RC1234567' : ''} className={inputClass} aria-invalid={!!errors.regNumber || undefined} />
                </Field>
              )}
              <Field label="Business phone" error={errors.phone} htmlFor="bphone">
                <div className="flex gap-2">
                  <span className="flex h-12 items-center rounded-xl border bg-muted px-3 text-sm">{c.dialCode}</span>
                  <input id="bphone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} aria-invalid={!!errors.phone || undefined} />
                </div>
              </Field>
              <Field label="Business email" error={errors.email} htmlFor="bemail">
                <input id="bemail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} aria-invalid={!!errors.email || undefined} />
              </Field>
              <Field label={c.regionLabel} error={errors.region} htmlFor="region">
                <Select id="region" value={region} onChange={(e) => setRegion(e.target.value)} aria-invalid={!!errors.region || undefined}>
                  <option value="">{`Select ${c.regionLabel.toLowerCase()}`}</option>
                  {c.regions.map((r) => <option key={r}>{r}</option>)}
                </Select>
              </Field>
              <Field label="City" error={errors.city} htmlFor="city">
                <input id="city" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} aria-invalid={!!errors.city || undefined} />
              </Field>
              <Field label="Pickup / business address" error={errors.address} htmlFor="addr" className="sm:col-span-2">
                <input id="addr" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} aria-invalid={!!errors.address || undefined} />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Bank" error={errors.bank} htmlFor="bank" className="sm:col-span-2">
                <Select id="bank" value={bank} onChange={(e) => setBank(e.target.value)} aria-invalid={!!errors.bank || undefined}>
                  <option value="">Select bank</option>
                  {c.banks.map((b) => <option key={b}>{b}</option>)}
                </Select>
              </Field>
              <Field label="Account number" error={errors.accountNumber} hint={c.accountNumber.hint} htmlFor="acct">
                <input id="acct" inputMode="numeric" value={accountNumber} onChange={(e) => { setAccountNumber(e.target.value.replace(/\s/g, '')); if (c.accountNumber.canResolve && c.accountNumber.pattern.test(e.target.value) && !accountName) setAccountName(ownerName.toUpperCase()) }} placeholder={c.accountNumber.placeholder} className={inputClass} aria-invalid={!!errors.accountNumber || undefined} />
              </Field>
              <Field label="Account name" error={errors.accountName} hint="Must match the owner or business name" htmlFor="acctname">
                <input id="acctname" value={accountName} onChange={(e) => setAccountName(e.target.value)} className={inputClass} aria-invalid={!!errors.accountName || undefined} />
              </Field>
              <label className="flex items-start gap-2 text-sm sm:col-span-2">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 size-4 accent-primary" />
                <span>I confirm these details are accurate and agree to the OpenMarketz seller terms and prohibited-items policy.</span>
              </label>
              {errors.agree && <p role="alert" className="text-xs font-medium text-deal sm:col-span-2">{errors.agree}</p>}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <button type="button" onClick={() => setStep(step - 1)} className="h-12 rounded-xl border px-6 text-sm font-medium hover:bg-muted">Back</button>
            )}
            <SubmitButton loading={submitting} className="w-auto flex-1 sm:flex-none sm:px-10">
              {step === steps.length - 1 ? 'Submit for verification' : 'Continue'}
            </SubmitButton>
          </div>
        </form>
      </div>

      <aside className="lg:sticky lg:top-40 lg:self-start" aria-label="Store preview">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Live store preview</p>
        <div className="overflow-hidden rounded-3xl border bg-card">
          <div className="relative aspect-[3/1] bg-muted">
            {banner ? <Image src={banner.url} alt="" fill className="object-cover" unoptimized /> : <Image src="/images/seller-onboarding.png" alt="" fill className="object-cover opacity-60" sizes="360px" />}
          </div>
          <div className="flex flex-col gap-2 p-5">
            <div className="-mt-12 flex size-16 items-center justify-center overflow-hidden rounded-2xl border-4 border-card bg-primary text-lg font-semibold text-primary-foreground">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo.url} alt="" className="size-full object-cover" />
              ) : (
                (brandName || 'Your brand').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
              )}
            </div>
            <h2 className="flex items-center gap-1.5 font-display text-lg font-semibold">
              {brandName || 'Your brand name'}
              <BadgeCheck className="size-4 text-primary" aria-label="Verified after review" />
            </h2>
            <p className="line-clamp-3 text-sm text-muted-foreground">{description || 'Your company description will appear here for buyers.'}</p>
            <p className="text-xs text-muted-foreground">{[city, region, c.name].filter(Boolean).join(', ')}</p>
          </div>
        </div>
      </aside>
    </div>
  )
}

function slug(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30)
}
