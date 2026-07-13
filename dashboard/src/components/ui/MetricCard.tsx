'use client'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  className?: string
  subtitle?: string
  color?: string
}

export function MetricCard({ label, value, icon, trend, className, subtitle, color }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md hover:border-nagual-purple/30 transition-all duration-300',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className={cn('text-2xl font-bold font-mono', color || 'text-foreground')}>{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-gradient-to-br from-nagual-purple/10 to-nagual-cyan/10 text-nagual-purple">
            {icon}
          </div>
        )}
      </div>
      {/* Gradient accent line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-nagual-purple to-nagual-cyan opacity-0 hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  )
}
