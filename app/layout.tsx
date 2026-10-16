import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Bricolage_Grotesque } from 'next/font/google'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ShopProvider } from '@/components/shop-provider'
import { AuthProvider } from '@/components/auth-provider'
import { NotificationsProvider } from '@/components/notifications-provider'
import { WishlistProvider } from '@/components/wishlist-provider'
import { Toaster } from '@/components/ui/sonner'
import { OpenMarketProvider } from '@/components/open-market/open-market-provider'
import { SellerProvider } from '@/components/seller/seller-provider'
import { SupportWidget } from '@/components/support/support-widget'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display-face' })

export const metadata: Metadata = {
  title: {
    default: 'OpenMarketz — Shop from verified sellers across Nigeria',
    template: '%s · OpenMarketz',
  },
  description:
    'Discover phones, fashion, home essentials and more from verified Nigerian sellers. Secure payments, buyer protection and fast delivery.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#fdfdfb',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <NotificationsProvider>
          <AuthProvider>
            <ShopProvider>
              <WishlistProvider>
                <OpenMarketProvider>
                  <SellerProvider>
                    <SiteHeader />
                    <main className="flex-1">{children}</main>
                    <SiteFooter />
                    <SupportWidget />
                    <Toaster position="top-center" />
                  </SellerProvider>
                </OpenMarketProvider>
              </WishlistProvider>
            </ShopProvider>
          </AuthProvider>
        </NotificationsProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
