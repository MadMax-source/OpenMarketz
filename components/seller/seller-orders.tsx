'use client'

import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Box, Check, MapPin, Phone, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/data'
import { dropOffHubs, fulfilmentSteps, timeUntil, type DispatchMethod, type SalesOrder } from '@/lib/seller'
import { timeAgo } from '@/components/notifications-provider'
import { useSeller } from '@/components/seller/seller-provider'
import { PageHeader, StatusPill } from '@/components/seller/seller-shell'
import { Select } from '@/components/forms'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'todo', label: 'To send' },
  { id: 'shipping', label: 'With delivery' },
  { id: 'done', label: 'Completed' },
] as const

const inTab = (o: SalesOrder, tab: (typeof tabs)[number]['id']) =>
  tab === 'todo' ? o.status === 'awaiting_dispatch' || o.status === 'packed' : tab === 'shipping' ? o.status === 'handed_over' || o.status === 'in_transit' : o.status === 'delivered'

export function SellerOrders() {
  const { orders } = useSeller()
  const focus = useSearchParams().get('focus')
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>(() => {
    const f = orders.find((o) => o.id === focus)
    return f ? (tabs.find((t) => inTab(f, t.id))?.id ?? 'todo') : 'todo'
  })
  const shown = orders.filter((o) => inTab(o, tab))

  return (
    <div>
      <PageHeader title="Orders & delivery" description="See who bought your products and send paid orders to OpenMarketz delivery." />
      <div role="tablist" aria-label="Order status" className="mb-4 flex w-fit gap-1 rounded-xl bg-muted p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn('h-8 rounded-lg px-3 text-sm font-medium text-muted-foreground', tab === t.id && 'bg-card text-foreground shadow-sm')}
          >
            {`${t.label} (${orders.filter((o) => inTab(o, t.id)).length})`}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="rounded-3xl border border-dashed p-10 text-center text-sm text-muted-foreground">No orders in this tab.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {shown.map((o) => <OrderCard key={o.id} order={o} highlighted={o.id === focus} />)}
        </ul>
      )}
    </div>
  )
}

function OrderCard({ order: o, highlighted }: { order: SalesOrder; highlighted: boolean }) {
  const { productById, advanceOrder } = useSeller()
  const [dispatchOpen, setDispatchOpen] = useState(false)
  const stepIndex = fulfilmentSteps.findIndex((s) => s.id === o.status)
  const overdue = o.dispatchBy < Date.now() && stepIndex < 2

  return (
    <li id={o.id} className={cn('scroll-mt-28 rounded-3xl border bg-card p-5', highlighted && 'ring-2 ring-primary')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 font-semibold">
            {o.id}
            <StatusPill status={o.status} />
          </p>
          <p className="text-xs text-muted-foreground">{`Paid ${timeAgo(o.placedAt)} · Payout ${o.payout === 'escrow' ? 'held in escrow' : 'released'}`}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-semibold">{formatPrice(o.total)}</p>
          {stepIndex < 2 && <p className={cn('text-xs font-medium', overdue ? 'text-deal' : 'text-amber-700')}>{`Send to delivery · ${timeUntil(o.dispatchBy)}`}</p>}
        </div>
      </div>

      <ol aria-label="Fulfilment progress" className="my-5 grid grid-cols-5 gap-1">
        {fulfilmentSteps.map((s, i) => (
          <li key={s.id} className="flex flex-col gap-1.5">
            <span className={cn('h-1.5 rounded-full', i <= stepIndex ? 'bg-primary' : 'bg-muted')} />
            <span className={cn('text-[11px] leading-tight', i <= stepIndex ? 'font-medium text-foreground' : 'text-muted-foreground')}>{s.label}</span>
          </li>
        ))}
      </ol>

      <div className="grid gap-4 md:grid-cols-[1fr_240px]">
        <ul className="flex flex-col gap-2">
          {o.items.map((it) => {
            const p = productById(it.productId)
            return (
              <li key={it.productId} className="flex items-center gap-3">
                {p && <Image src={p.image} alt="" width={48} height={48} className="size-12 rounded-xl object-cover" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p?.name}</p>
                  <p className="text-xs text-muted-foreground">{`Qty ${it.quantity} · ${formatPrice(it.unitPrice)} each`}</p>
                </div>
              </li>
            )
          })}
        </ul>
        <div className="rounded-2xl bg-muted/50 p-3 text-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bought by</p>
          <p className="mt-1 font-medium">{o.buyer.name}</p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="size-3" aria-hidden="true" />{o.buyer.city}</p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="size-3" aria-hidden="true" />{o.buyer.phone.replace(/\d{4}$/, '••••')}</p>
        </div>
      </div>

      {o.dispatch && (
        <p className="mt-4 flex items-center gap-2 rounded-xl border border-dashed p-3 text-sm">
          <Truck className="size-4 text-primary" aria-hidden="true" />
          {`${o.dispatch.method === 'pickup' ? 'Rider pickup' : 'Drop-off'} · ${o.dispatch.hub} · Waybill `}
          <span className="font-mono font-semibold">{o.dispatch.waybill}</span>
        </p>
      )}

      {stepIndex < 2 && (
        <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
          {o.status === 'awaiting_dispatch' && (
            <button
              type="button"
              onClick={() => {
                advanceOrder(o.id, 'packed')
                toast.success(`${o.id} marked as packed`)
              }}
              className="flex h-10 items-center gap-1.5 rounded-xl border px-4 text-sm font-semibold hover:bg-muted"
            >
              <Box className="size-4" aria-hidden="true" />
              Mark as packed
            </button>
          )}
          <button type="button" onClick={() => setDispatchOpen(true)} className="flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
            <Truck className="size-4" aria-hidden="true" />
            Send to delivery
          </button>
        </div>
      )}

      <DispatchDialog open={dispatchOpen} onOpenChange={setDispatchOpen} order={o} onConfirm={(method, hub) => {
        advanceOrder(o.id, 'handed_over', { method, hub })
        setDispatchOpen(false)
        toast.success(method === 'pickup' ? 'Pickup booked. A rider is on the way.' : 'Drop-off confirmed. Bring the package to the hub.')
      }} />
    </li>
  )
}

function DispatchDialog({ open, onOpenChange, order, onConfirm }: { open: boolean; onOpenChange: (v: boolean) => void; order: SalesOrder; onConfirm: (m: DispatchMethod, hub: string) => void }) {
  const [method, setMethod] = useState<DispatchMethod>('dropoff')
  const [hub, setHub] = useState(dropOffHubs[0])
  const options: { id: DispatchMethod; title: string; body: string }[] = [
    { id: 'dropoff', title: 'Drop off at a hub', body: 'Free · Bring the package to the nearest OpenMarketz hub.' },
    { id: 'pickup', title: 'Request rider pickup', body: '₦1,000 · A rider collects from your store within 4 hours.' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{`Send ${order.id} to delivery`}</DialogTitle>
          <DialogDescription>Seal the item with the buyer’s order ID written on the package. Delivery is tracked once we scan the waybill.</DialogDescription>
        </DialogHeader>
        <fieldset className="flex flex-col gap-2">
          <legend className="sr-only">Hand-over method</legend>
          {options.map((opt) => (
            <label key={opt.id} className={cn('flex cursor-pointer items-start gap-3 rounded-2xl border p-3', method === opt.id && 'border-primary bg-primary/5')}>
              <input type="radio" name="method" checked={method === opt.id} onChange={() => setMethod(opt.id)} className="mt-1 accent-[var(--primary)]" />
              <span>
                <span className="block text-sm font-medium">{opt.title}</span>
                <span className="block text-xs text-muted-foreground">{opt.body}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          {method === 'pickup' ? 'Delivery hub that will handle it' : 'Drop-off hub'}
          <Select value={hub} onChange={(e) => setHub(e.target.value)}>
            {dropOffHubs.map((h) => <option key={h}>{h}</option>)}
          </Select>
        </label>
        <button type="button" onClick={() => onConfirm(method, hub)} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
          <Check className="size-4" aria-hidden="true" />
          Confirm and generate waybill
        </button>
      </DialogContent>
    </Dialog>
  )
}
