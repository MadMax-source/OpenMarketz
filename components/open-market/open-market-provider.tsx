'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { ME, seedRequests, seedResponses, type MarketRequest, type SellerResponse } from '@/lib/open-market'

type NewRequest = Omit<MarketRequest, 'id' | 'buyerId' | 'buyerName' | 'postedHoursAgo' | 'status' | 'views'>
type NewResponse = Omit<SellerResponse, 'id' | 'postedHoursAgo' | 'status'>

type OpenMarketValue = {
  requests: MarketRequest[]
  responses: SellerResponse[]
  postRequest: (input: NewRequest) => MarketRequest
  submitResponse: (input: NewResponse) => void
  acceptResponse: (responseId: string) => void
  declineResponse: (responseId: string) => void
  responsesFor: (requestId: string) => SellerResponse[]
}

const OpenMarketContext = createContext<OpenMarketValue | null>(null)

export function OpenMarketProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<MarketRequest[]>(seedRequests)
  const [responses, setResponses] = useState<SellerResponse[]>(seedResponses)

  const postRequest = useCallback((input: NewRequest) => {
    const req: MarketRequest = { ...input, id: `r${Math.floor(2000 + Math.random() * 7999)}`, buyerId: ME, buyerName: 'You', postedHoursAgo: 0, status: 'open', views: 0 }
    setRequests((prev) => [req, ...prev])
    return req
  }, [])

  const submitResponse = useCallback((input: NewResponse) => {
    setResponses((prev) => [...prev, { ...input, id: `o${Math.random().toString(36).slice(2, 8)}`, postedHoursAgo: 0, status: 'pending' }])
  }, [])

  const acceptResponse = useCallback(
    (responseId: string) => {
      const target = responses.find((r) => r.id === responseId)
      if (!target) return
      setResponses((prev) =>
        prev.map((r) => (r.requestId !== target.requestId ? r : { ...r, status: r.id === responseId ? 'accepted' : 'declined' })),
      )
      setRequests((prev) => prev.map((q) => (q.id === target.requestId ? { ...q, status: 'accepted' } : q)))
    },
    [responses],
  )

  const declineResponse = useCallback((responseId: string) => {
    setResponses((prev) => prev.map((r) => (r.id === responseId ? { ...r, status: 'declined' } : r)))
  }, [])

  const responsesFor = useCallback(
    (requestId: string) => responses.filter((r) => r.requestId === requestId).sort((a, b) => a.price - b.price),
    [responses],
  )

  const value = useMemo(
    () => ({ requests, responses, postRequest, submitResponse, acceptResponse, declineResponse, responsesFor }),
    [requests, responses, postRequest, submitResponse, acceptResponse, declineResponse, responsesFor],
  )
  return <OpenMarketContext.Provider value={value}>{children}</OpenMarketContext.Provider>
}

export function useOpenMarket() {
  const ctx = useContext(OpenMarketContext)
  if (!ctx) throw new Error('useOpenMarket must be used within OpenMarketProvider')
  return ctx
}
