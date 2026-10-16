'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Suspense } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Bell, HandCoins, Heart, Menu, MessageCircle, Package, ShoppingBag, Store } from 'lucide-react'
import { useNotifications } from '@/components/notifications-provider'
import { AccountMenu } from '@/components/account/account-menu'
import { categories } from '@/lib/data'
import { useShop } from '@/components/shop-provider'
import { SearchBar } from '@/components/search-bar'
import { Logo } from '@/components/logo'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export function SiteHeader() {
  const pathname = usePathname()
  const { cartCount, wishlist, offers, conversations } = useShop()
  const unread = conversations.reduce((sum, c) => sum + c.unread, 0)
  const { unreadCount: unreadNotifications } = useNotifications()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl">
      <div className="hidden bg-foreground text-background md:block">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-6 text-xs">
          <p className="text-background/80">
            {'Free delivery on orders over ₦50,000 · Pay securely with buyer protection'}
          </p>
          <div className="flex items-center gap-5 text-background/80">
            <Link href="#" className="transition-colors hover:text-background">
              Help center
            </Link>
            <Link href="/sell" className="flex items-center gap-1.5 transition-colors hover:text-background">
              <Store className="size-3.5" />
              Sell on OpenMarketz
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:gap-6 md:px-6">
        <Sheet>
          <SheetTrigger
            className="flex size-10 items-center justify-center rounded-full hover:bg-muted lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="border-b px-5 py-4">
              <SheetTitle>
                <Logo />
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col p-3" aria-label="Categories">
              <p className="px-3 pb-2 pt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Shop by category
              </p>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="rounded-lg px-3 py-2.5 text-sm hover:bg-muted"
                >
                  {c.name}
                </Link>
              ))}
              <Link href="/products" className="mt-2 rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-muted">
                Browse all products
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        <Logo />

        <Suspense fallback={<div className="hidden h-11 flex-1 rounded-full bg-muted md:block" />}>
          <SearchBar className="hidden flex-1 md:block" />
        </Suspense>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/orders"
            className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm hover:bg-muted sm:flex"
          >
            <Package className="size-5" />
            <span className="hidden lg:inline">Orders</span>
          </Link>
          <HeaderIcon href="/offers" label="My offers" count={offers.filter((o) => o.status === 'pending').length}>
            <HandCoins className="size-5" />
          </HeaderIcon>
          <HeaderIcon href="/messages" label="Messages" count={unread}>
            <MessageCircle className="size-5" />
          </HeaderIcon>
          <HeaderIcon href="/notifications" label="Notifications" count={unreadNotifications}>
            <Bell className="size-5" />
          </HeaderIcon>
          <HeaderIcon href="/wishlist" label="Wishlist" count={wishlist.size}>
            <Heart className="size-5" />
          </HeaderIcon>
          <HeaderIcon href="/cart" label="Cart" count={cartCount}>
            <ShoppingBag className="size-5" />
          </HeaderIcon>
          <AccountMenu />
        </div>
      </div>

      <div className="px-4 pb-3 md:hidden">
        <Suspense fallback={<div className="h-11 rounded-full bg-muted" />}>
          <SearchBar />
        </Suspense>
      </div>

      <nav aria-label="Categories" className="hidden border-t lg:block">
        <ul className="no-scrollbar mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 md:px-6">
          <li>
            <CategoryLink href="/products" active={pathname === '/products'}>
              All products
            </CategoryLink>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <CategoryLink href={`/category/${c.slug}`} active={pathname === `/category/${c.slug}`}>
                {c.name}
              </CategoryLink>
            </li>
          ))}
          <li className="ml-auto">
            <CategoryLink href="/#deals" active={false} className="font-medium text-deal">
              Flash deals
            </CategoryLink>
          </li>
        </ul>
      </nav>
    </header>
  )
}

function CategoryLink({
  href,
  active,
  children,
  className,
}: {
  href: string
  active: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative block whitespace-nowrap px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground',
        active && 'text-foreground',
        className,
      )}
    >
      {children}
      {active && (
        <motion.span
          layoutId="category-underline"
          className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary"
        />
      )}
    </Link>
  )
}

function HeaderIcon({
  href,
  label,
  count,
  children,
}: {
  href: string
  label: string
  count: number
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      aria-label={`${label}${count ? `, ${count} items` : ''}`}
      className="relative flex size-10 items-center justify-center rounded-full hover:bg-muted"
    >
      {children}
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="absolute right-0.5 top-0.5 flex min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4.5 text-primary-foreground"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )
}
