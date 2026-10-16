import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthShell } from '@/components/auth/auth-shell'
import { SignupForm } from '@/components/auth/signup-form'

export const metadata: Metadata = { title: 'Create an account' }

export default function SignupPage() {
  return (
    <AuthShell title="Create your account" description="Join millions of shoppers buying from verified sellers across Nigeria.">
      <Suspense>
        <SignupForm />
      </Suspense>
    </AuthShell>
  )
}
