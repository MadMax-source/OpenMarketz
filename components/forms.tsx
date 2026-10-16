'use client'

import { useId, useRef, useState } from 'react'
import { Check, Eye, EyeOff, ImagePlus, Loader2, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const inputClass =
  'h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20 aria-invalid:border-deal aria-invalid:focus:ring-deal/20 disabled:cursor-not-allowed disabled:opacity-60'

export const selectClass = cn(inputClass, 'appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10')

export function Field({
  label,
  hint,
  error,
  optional,
  className,
  children,
  htmlFor,
}: {
  label: string
  hint?: React.ReactNode
  error?: string
  optional?: boolean
  className?: string
  htmlFor?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="flex items-center justify-between text-sm font-medium">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-muted-foreground">Optional</span>}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs font-medium text-deal">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

export function Select({ className, children, ...props }: React.ComponentProps<'select'>) {
  return (
    <div className="relative">
      <select className={cn(inputClass, 'appearance-none pr-10', className)} {...props}>
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        fill="currentColor"
      >
        <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z" />
      </svg>
    </div>
  )
}

export function PasswordInput({ className, ...props }: React.ComponentProps<'input'>) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <input type={visible ? 'text' : 'password'} className={cn(inputClass, 'pr-12', className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}

export const passwordRules = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'An uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'A number', test: (p: string) => /\d/.test(p) },
  { label: 'A symbol (e.g. ! @ #)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

export const isStrongPassword = (p: string) => passwordRules.slice(0, 3).every((r) => r.test(p))

export function PasswordStrength({ password }: { password: string }) {
  const score = passwordRules.filter((r) => r.test(password)).length
  const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['bg-muted', 'bg-deal', 'bg-amber-500', 'bg-primary/70', 'bg-primary']
  if (!password) return null
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1" aria-hidden="true">
          {[1, 2, 3, 4].map((i) => (
            <span key={i} className={cn('h-1.5 flex-1 rounded-full transition-colors', i <= score ? colors[score] : 'bg-muted')} />
          ))}
        </div>
        <span className="text-xs font-medium text-muted-foreground" aria-live="polite">
          {labels[score]}
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
        {passwordRules.map((r) => {
          const ok = r.test(password)
          return (
            <li key={r.label} className={cn('flex items-center gap-1.5 text-xs', ok ? 'text-primary' : 'text-muted-foreground')}>
              <Check className={cn('size-3', !ok && 'opacity-30')} aria-hidden="true" />
              {r.label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function OtpInput({ value, onChange, length = 6, invalid }: { value: string; onChange: (v: string) => void; length?: number; invalid?: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  const setAt = (i: number, d: string) => {
    const next = digits.slice()
    next[i] = d
    onChange(next.join('').slice(0, length))
  }

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="Verification code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          value={d}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid || undefined}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '')
            if (!v) return setAt(i, '')
            setAt(i, v.slice(-1))
            refs.current[i + 1]?.focus()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !d) refs.current[i - 1]?.focus()
          }}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
            if (pasted) {
              e.preventDefault()
              onChange(pasted)
              refs.current[Math.min(pasted.length, length - 1)]?.focus()
            }
          }}
          className="aspect-square w-full min-w-0 max-w-14 rounded-xl border bg-background text-center text-xl font-semibold tabular-nums outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 aria-invalid:border-deal"
        />
      ))}
    </div>
  )
}

export function FileDrop({
  label,
  accept,
  file,
  previewUrl,
  onFile,
  onClear,
  hint,
  shape = 'wide',
  invalid,
}: {
  label: string
  accept: string
  file?: { name: string } | null
  previewUrl?: string
  onFile: (file: File) => void
  onClear: () => void
  hint: string
  shape?: 'square' | 'wide'
  invalid?: boolean
}) {
  const id = useId()
  const [dragging, setDragging] = useState(false)

  if (file) {
    return (
      <div className={cn('flex items-center gap-3 rounded-2xl border bg-muted/40 p-3', shape === 'square' && 'w-fit')}>
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="" className={cn('shrink-0 rounded-xl object-cover', shape === 'square' ? 'size-20' : 'size-14')} />
        ) : (
          <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-background">
            <Upload className="size-5 text-muted-foreground" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="flex items-center gap-1 text-xs text-primary">
            <Check className="size-3" aria-hidden="true" />
            Uploaded
          </p>
        </div>
        <button type="button" onClick={onClear} aria-label={`Remove ${label}`} className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-background hover:text-foreground">
          <X className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <label
      htmlFor={id}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        const f = e.dataTransfer.files[0]
        if (f) onFile(f)
      }}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition-colors hover:border-primary/60 hover:bg-primary/5',
        dragging && 'border-primary bg-primary/5',
        invalid && 'border-deal/60',
        shape === 'square' && 'size-36',
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <ImagePlus className="size-5" aria-hidden="true" />
      </span>
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">{hint}</span>
      <input
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
          e.target.value = ''
        }}
      />
    </label>
  )
}

export function SubmitButton({ loading, children, className, ...props }: React.ComponentProps<'button'> & { loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading || props.disabled}
      aria-busy={loading || undefined}
      className={cn(
        'flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}

export function FormAlert({ children, tone = 'error' }: { children: React.ReactNode; tone?: 'error' | 'info' | 'success' }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-xl border px-4 py-3 text-sm',
        tone === 'error' && 'border-deal/30 bg-deal/5 text-deal',
        tone === 'info' && 'border-primary/20 bg-primary/5 text-foreground',
        tone === 'success' && 'border-primary/30 bg-primary/10 text-primary',
      )}
    >
      {children}
    </div>
  )
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
