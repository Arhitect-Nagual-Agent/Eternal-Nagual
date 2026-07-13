'use client'
import { cn } from '@/lib/utils'

interface GradientBorderProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function GradientBorder({ children, className, hover = true }: GradientBorderProps) {
  return (
    <div className={cn(
      'relative rounded-xl p-[1px] bg-gradient-to-br from-nagual-purple to-nagual-cyan opacity-60 hover:opacity-100 transition-opacity duration-500',
      hover && 'group-hover:opacity-100',
      className
    )}>
      {children}
    </div>
  )
}
