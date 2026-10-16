import type { Metadata } from 'next'
import { PostRequestForm } from '@/components/open-market/post-request-form'

export const metadata: Metadata = { title: 'Post a request · Open Market' }

export default function NewRequestPage() {
  return <PostRequestForm />
}
