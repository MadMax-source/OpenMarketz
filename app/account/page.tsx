import type { Metadata } from 'next'
import { ProfileView } from '@/components/account/profile-view'

export const metadata: Metadata = { title: 'My profile' }

export default function AccountPage() {
  return <ProfileView />
}
