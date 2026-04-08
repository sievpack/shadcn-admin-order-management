import { Badge } from '@/components/ui/badge'
import { Send } from 'lucide-react'

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
  variant = 'default'
}: StatsCardProps) {
  const isPositive = percentage >= 0
  const badgeVariant = isPositive ? 'secondary' : 'destructive'
  const trendColor = isPositive ? 'text-success' : 'text-destructive'

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <Badge variant={icon ? 'default' : badgeVariant} className="flex items-center gap-1">
          {icon ? icon : (
            <>
              {isPositive ? '↑' : '↓'}{Math.abs(percentage)}%
            </>
          )}
        </Badge>
      </div>
      <p className="text-2xl font-bold text-foreground mb-2">¥{value.toLocaleString()}</p>
      <p className={`text-sm flex items-center ${variant === 'warning' ? 'text-warning' : trendColor}`}>
        {trend}
      </p>
    </div>
  )
}
