import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface StatsCardProps {
  title: string
  value: number
  trend: string
  percentage: number
  icon?: React.ReactNode
  variant?: 'default' | 'warning' | 'success' | 'destructive'
}

export function StatsCard({
  title,
  value,
  trend,
  percentage,
  icon,
  variant = 'default',
}: StatsCardProps) {
  const isPositive = percentage >= 0
  const badgeVariant = isPositive ? 'secondary' : 'destructive'

  return (
    <div className='group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5'>
      <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
      <div className='relative z-10'>
        <div className='mb-3 flex items-center justify-between'>
          <p className='text-sm font-medium tracking-wide text-muted-foreground'>
            {title}
          </p>
          <Badge
            variant={icon ? 'default' : badgeVariant}
            className='flex items-center gap-1 transition-transform duration-200 group-hover:scale-105'
          >
            {icon ? (
              icon
            ) : (
              <>
                {isPositive ? '↑' : '↓'}
                {Math.abs(percentage)}%
              </>
            )}
          </Badge>
        </div>
        <p className='mb-2 text-2xl font-bold tracking-tight text-foreground tabular-nums'>
          ¥{value.toLocaleString()}
        </p>
        <p
          className={cn(
            'flex items-center gap-1.5 text-sm transition-colors duration-200',
            variant === 'warning'
              ? 'text-amber-500'
              : isPositive
                ? 'text-emerald-500'
                : 'text-destructive'
          )}
        >
          <span className='inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current' />
          {trend}
        </p>
      </div>
    </div>
  )
}
