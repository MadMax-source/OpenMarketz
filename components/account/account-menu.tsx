'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, Heart, LayoutDashboard, LifeBuoy, LogOut, MapPin, MessageCircle, Package, ShieldCheck, Store, User as UserIcon } from 'lucide-react'
import { initialsOf, useAuth } from '@/components/auth-provider'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Avatar({ name, src, size = 'md' }: { name: string; src?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-20 text-2xl' }
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={`${sizes[size]} shrink-0 rounded-full object-cover`} />
  ) : (
    <span className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground`}>
      {name}
    </span>
  )
}

export function AccountMenu() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  if (!user) {
    return (
      <Link href="/login" className="ml-1 flex h-10 items-center gap-2 rounded-full border px-3 text-sm font-medium hover:bg-muted">
        <UserIcon className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">Sign in</span>
        <span className="sr-only sm:hidden">Sign in</span>
      </Link>
    )
  }

  const items = [
    { href: '/account', label: 'My profile', icon: UserIcon },
    { href: '/orders', label: 'Orders', icon: Package },
    { href: '/account/addresses', label: 'Addresses', icon: MapPin },
    { href: '/wishlist', label: 'Wishlists', icon: Heart },
    { href: '/messages', label: 'Messages', icon: MessageCircle },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/account/security', label: 'Login & security', icon: ShieldCheck },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="ml-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Account menu">
        <Avatar name={initialsOf(user)} src={user.avatarUrl} size="sm" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col">
          <span className="truncate">{`${user.firstName} ${user.lastName}`}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map(({ href, label, icon: Icon }) => (
          <DropdownMenuItem key={href} render={<Link href={href} />}>
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/seller" />}>
          <LayoutDashboard className="size-4" aria-hidden="true" />
          Seller hub
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/sell" />}>
          <Store className="size-4" aria-hidden="true" />
          {user.seller ? 'Seller application' : 'Become a seller'}
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/support" />}>
          <LifeBuoy className="size-4" aria-hidden="true" />
          Help & support
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            signOut()
            router.push('/')
          }}
        >
          <LogOut className="size-4" aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
