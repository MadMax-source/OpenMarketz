import { OpenMarketProvider } from '@/components/open-market/open-market-provider'

export default function OpenMarketLayout({ children }: { children: React.ReactNode }) {
  return <OpenMarketProvider>{children}</OpenMarketProvider>
}
