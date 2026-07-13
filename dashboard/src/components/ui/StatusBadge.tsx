'use client'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'healthy' | 'warning' | 'critical' | 'active' | 'inactive' | 'online' | 'offline'
  label?: string
  pulse?: boolean
  className?: string
}

export function StatusBadge({ status, label, pulse = true, className }: StatusBadgeProps) {
  const colorMap = {
    healthy: 'bg-nagual-green',
    warning: 'bg-nagual-orange',
    critical: 'bg-nagual-red',
    active: 'bg-nagual-green',
    inactive: 'bg-nagual-red',
    online: 'bg-nagual-green',
    offline: 'bg-nagual-red',
  }
  
  const textMap = {
    healthy: 'Healthy',
    warning: 'Warning',
    critical: 'Critical',
    active: 'Active',
    inactive: 'Inactive',
    online: 'Online',
    offline: 'Offline',
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <div className={cn('w-2 h-2 rounded-full', colorMap[status])} />
        {pulse && (
          <div className={cn('absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-50', colorMap[status])} />
        )}
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label || textMap[status]}</span>
    </div>
  )
}
