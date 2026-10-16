import type { Metadata } from 'next'
import { BrowseRequests } from '@/components/open-market/browse-requests'

export const metadata: Metadata = { title: 'Browse requests · Open Market' }

export default async function RequestsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams
  return <BrowseRequests initialCategory={category} />
}
