import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Rating({
  value,
  count,
  size = 'sm',
  className,
}: {
  value: number
  count?: number
  size?: 'sm' | 'md'
  className?: string
}) {
  const iconSize = size === 'sm' ? 'size-3.5' : 'size-4'
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              iconSize,
              i < Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-border',
            )}
          />
        ))}
      </div>
      <span className="sr-only">{`Rated ${value} out of 5`}</span>
      <span className={cn('font-medium text-foreground', size === 'sm' ? 'text-xs' : 'text-sm')}>
        {value.toFixed(1)}
      </span>
      {count !== undefined && (
        <span className={cn('text-muted-foreground', size === 'sm' ? 'text-xs' : 'text-sm')}>
          {`(${count.toLocaleString()})`}
        </span>
      )}
    </div>
  )
}
