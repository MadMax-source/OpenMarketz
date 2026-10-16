'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Heart, Lock, MapPin, MessageCircle, Package, ShieldCheck, Store, User as UserIcon } from 'lucide-react'
import { initialsOf, useAuth } from '@/components/auth-provider'
import { Avatar } from '@/components/account/account-menu'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/account', label: 'Profile', icon: UserIcon },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  { href: '/account/security', label: 'Login & security', icon: ShieldCheck },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/orders', label: 'Orders', icon: Package },
  { href: '/wishlist', label: 'Wishlists', icon: Heart },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/sell', label: 'Sell on OpenMarketz', icon: Store },
]

export function RequireAuth({ children, reason = 'view your account' }: { children: React.ReactNode; reason?: string }) {
  const { user } = useAuth()
  const pathname = usePathname()
  if (user) return <>{children}</>
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Lock className="size-6 text-muted-foreground" aria-hidden="true" />
      </span>
      <h1 className="font-display text-2xl font-semibold">Sign in required</h1>
      <p className="text-muted-foreground">{`Please sign in or create an account to ${reason}.`}</p>
      <div className="flex gap-3">
        <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90">
          Sign in
        </Link>
        <Link href={`/signup?next=${encodeURIComponent(pathname)}`} className="flex h-11 items-center rounded-xl border px-5 text-sm font-semibold hover:bg-muted">
          Create account
        </Link>
      </div>
    </div>
  )
}

export function AccountShell({ title, description, children, actions }: { title: string; description?: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <RequireAuth>
      <AccountLayout title={title} description={description} actions={actions}>
        {children}
      </AccountLayout>
    </RequireAuth>
  )
}

function AccountLayout({ title, description, children, actions }: { title: string; description?: string; children: React.ReactNode; actions?: React.ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()
  if (!user) return null

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:px-6 lg:grid-cols-[240px_1fr]">
      <aside className="flex flex-col gap-4">
        <div className="hidden items-center gap-3 lg:flex">
          <Avatar name={initialsOf(user)} src={user.avatarUrl} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{`${user.firstName} ${user.lastName}`}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <nav aria-label="Account" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors',
                  active ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            )
          })}
        </nav>
      </aside>
      <section className="min-w-0">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
            {description && <p className="mt-1 text-muted-foreground">{description}</p>}
          </div>
          {actions}
        </div>
        {children}
      </section>
    </div>
  )
}

export function Card({ title, description, children, className, action }: { title?: string; description?: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <div className={cn('rounded-2xl border bg-card p-5 md:p-6', className)}>
      {(title || action) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="font-semibold">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}
