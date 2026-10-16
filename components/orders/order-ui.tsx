import { Check, Home, Package, PackageCheck, Truck } from 'lucide-react'
import type { OrderStatus } from '@/components/shop-provider'
import { cn } from '@/lib/utils'

export const statusFlow: { status: OrderStatus; label: string; icon: typeof Package }[] = [
  { status: 'placed', label: 'Order placed', icon: Check },
  { status: 'confirmed', label: 'Seller confirmed', icon: PackageCheck },
  { status: 'shipped', label: 'Shipped', icon: Package },
  { status: 'out_for_delivery', label: 'Out for delivery', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: Home },
]

export const statusLabel = (s: OrderStatus) => statusFlow.find((f) => f.status === s)?.label ?? s

export function StatusBadge({ status }: { status: OrderStatus }) {
  const delivered = status === 'delivered'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        delivered ? 'bg-primary/10 text-primary' : 'bg-accent text-accent-foreground',
      )}
    >
      <span className={cn('size-1.5 rounded-full', delivered ? 'bg-primary' : 'bg-current')} aria-hidden="true" />
      {statusLabel(status)}
    </span>
  )
}

export function OrderTimeline({ status, placedAt }: { status: OrderStatus; placedAt: number }) {
  const currentIndex = statusFlow.findIndex((s) => s.status === status)
  return (
    <ol className="flex flex-col">
      {statusFlow.map((step, i) => {
        const done = i <= currentIndex
        const current = i === currentIndex
        const at = new Date(placedAt + i * 1000 * 60 * 60 * 20)
        return (
          <li key={step.status} className="relative flex gap-4 pb-8 last:pb-0">
            {i < statusFlow.length - 1 && (
              <span className={cn('absolute left-[17px] top-9 h-[calc(100%-36px)] w-0.5', i < currentIndex ? 'bg-primary' : 'bg-border')} aria-hidden="true" />
            )}
            <span
              className={cn(
                'relative flex size-9 shrink-0 items-center justify-center rounded-full border-2',
                done ? 'border-primary bg-primary text-primary-foreground' : 'bg-background text-muted-foreground',
                current && 'ring-4 ring-primary/20',
              )}
            >
              <step.icon className="size-4" aria-hidden="true" />
            </span>
            <div className="pt-1.5">
              <p className={cn('text-sm font-medium', !done && 'text-muted-foreground')}>
                {step.label}
                {current && <span className="sr-only"> (current status)</span>}
              </p>
              <p className="text-xs text-muted-foreground">
                {done ? at.toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : 'Pending'}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
