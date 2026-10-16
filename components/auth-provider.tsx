'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { CountryCode } from '@/lib/geo'

export type Gender = 'female' | 'male' | 'prefer-not'

export type SellerApplication = {
  brandName: string
  handle: string
  logoUrl?: string
  description: string
  categories: string[]
  businessType: 'individual' | 'registered'
  registrationNumber?: string
  businessPhone: string
  businessEmail: string
  country: CountryCode
  region: string
  city: string
  address: string
  ownerName: string
  ownerBirthDate: string
  idType: string
  idNumber: string
  idDocumentName: string
  bank: string
  accountNumber: string
  accountName: string
  payoutExtra?: string
  status: 'under_review' | 'approved'
  submittedAt: number
}

export type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  emailVerified: boolean
  phone: string
  country: CountryCode
  region: string
  birthDate: string
  gender: Gender
  avatarUrl?: string
  marketing: boolean
  twoFactor: boolean
  createdAt: number
  seller?: SellerApplication
}

type StoredUser = User & { password: string }

export type SignUpInput = Omit<User, 'id' | 'emailVerified' | 'twoFactor' | 'createdAt' | 'seller' | 'avatarUrl'> & { password: string }

type Result = { ok: true } | { ok: false; error: string }

type AuthContextValue = {
  user: User | null
  signIn: (email: string, password: string) => Promise<Result>
  signUp: (input: SignUpInput) => Promise<Result>
  verifyEmail: (code: string) => Promise<Result>
  signOut: () => void
  requestPasswordReset: (email: string) => Promise<Result>
  resetPassword: (email: string, code: string, password: string) => Promise<Result>
  updateProfile: (patch: Partial<Omit<User, 'id' | 'email' | 'createdAt'>>) => Promise<Result>
  changePassword: (current: string, next: string) => Promise<Result>
  submitSellerApplication: (app: Omit<SellerApplication, 'status' | 'submittedAt'>) => Promise<Result>
  isEmailTaken: (email: string) => boolean
}

export const DEMO_EMAIL = 'adaeze@openmarketz.ng'
export const DEMO_PASSWORD = 'Market123!'
export const DEMO_CODE = '246810'

const demoUser: StoredUser = {
  id: 'u_demo',
  firstName: 'Adaeze',
  lastName: 'Okafor',
  email: DEMO_EMAIL,
  emailVerified: true,
  phone: '803 123 4567',
  country: 'NG',
  region: 'Lagos',
  birthDate: '1996-04-12',
  gender: 'female',
  marketing: true,
  twoFactor: false,
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 220,
  password: DEMO_PASSWORD,
}

const AuthContext = createContext<AuthContextValue | null>(null)
const wait = (ms = 700) => new Promise((r) => setTimeout(r, ms))
const strip = ({ password: _password, ...rest }: StoredUser): User => rest

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<StoredUser[]>([demoUser])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const usersRef = useRef(users)
  usersRef.current = users

  const stored = users.find((u) => u.id === sessionId) ?? null
  const user = useMemo(() => (stored ? strip(stored) : null), [stored])

  const patchUser = useCallback((id: string, patch: Partial<StoredUser>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)))
  }, [])

  const findByEmail = (email: string) => usersRef.current.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())

  const isEmailTaken = useCallback((email: string) => Boolean(findByEmail(email)), [])

  const signIn = useCallback<AuthContextValue['signIn']>(async (email, password) => {
    await wait()
    const found = findByEmail(email)
    if (!found || found.password !== password) return { ok: false, error: 'Incorrect email or password. Please try again.' }
    setSessionId(found.id)
    return { ok: true }
  }, [])

  const signUp = useCallback<AuthContextValue['signUp']>(async (input) => {
    await wait(900)
    if (findByEmail(input.email)) return { ok: false, error: 'An account with this email already exists.' }
    const created: StoredUser = {
      ...input,
      email: input.email.trim().toLowerCase(),
      id: `u_${Math.random().toString(36).slice(2, 9)}`,
      emailVerified: false,
      twoFactor: false,
      createdAt: Date.now(),
    }
    setUsers((prev) => [...prev, created])
    setSessionId(created.id)
    return { ok: true }
  }, [])

  const verifyEmail = useCallback<AuthContextValue['verifyEmail']>(
    async (code) => {
      await wait(600)
      if (!sessionId) return { ok: false, error: 'Please sign in again.' }
      if (code !== DEMO_CODE) return { ok: false, error: 'That code is incorrect or has expired.' }
      patchUser(sessionId, { emailVerified: true })
      return { ok: true }
    },
    [sessionId, patchUser],
  )

  const signOut = useCallback(() => setSessionId(null), [])

  const requestPasswordReset = useCallback<AuthContextValue['requestPasswordReset']>(async () => {
    await wait()
    return { ok: true }
  }, [])

  const resetPassword = useCallback<AuthContextValue['resetPassword']>(
    async (email, code, password) => {
      await wait()
      if (code !== DEMO_CODE) return { ok: false, error: 'That code is incorrect or has expired.' }
      const found = findByEmail(email)
      if (found) patchUser(found.id, { password })
      return { ok: true }
    },
    [patchUser],
  )

  const updateProfile = useCallback<AuthContextValue['updateProfile']>(
    async (patch) => {
      await wait(500)
      if (!sessionId) return { ok: false, error: 'You need to be signed in.' }
      patchUser(sessionId, patch)
      return { ok: true }
    },
    [sessionId, patchUser],
  )

  const changePassword = useCallback<AuthContextValue['changePassword']>(
    async (current, next) => {
      await wait()
      const me = usersRef.current.find((u) => u.id === sessionId)
      if (!me) return { ok: false, error: 'You need to be signed in.' }
      if (me.password !== current) return { ok: false, error: 'Your current password is incorrect.' }
      patchUser(me.id, { password: next })
      return { ok: true }
    },
    [sessionId, patchUser],
  )

  const submitSellerApplication = useCallback<AuthContextValue['submitSellerApplication']>(
    async (app) => {
      await wait(1200)
      if (!sessionId) return { ok: false, error: 'You need to be signed in.' }
      patchUser(sessionId, { seller: { ...app, status: 'under_review', submittedAt: Date.now() } })
      return { ok: true }
    },
    [sessionId, patchUser],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user, signIn, signUp, verifyEmail, signOut, requestPasswordReset, resetPassword,
      updateProfile, changePassword, submitSellerApplication, isEmailTaken,
    }),
    [user, signIn, signUp, verifyEmail, signOut, requestPasswordReset, resetPassword, updateProfile, changePassword, submitSellerApplication, isEmailTaken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const initialsOf = (u: Pick<User, 'firstName' | 'lastName'>) => `${u.firstName[0] ?? ''}${u.lastName[0] ?? ''}`.toUpperCase()
