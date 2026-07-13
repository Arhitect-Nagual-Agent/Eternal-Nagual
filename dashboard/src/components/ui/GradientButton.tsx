'use client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'default' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export function GradientButton({ children, variant = 'default', size = 'md', className, ...props }: GradientButtonProps) {
  if (variant === 'outline') {
    return (
      <Button
        variant="outline"
        size={size}
        className={cn(
          'border-transparent bg-gradient-to-r from-nagual-purple/10 to-nagual-cyan/10 hover:from-nagual-purple/20 hover:to-nagual-cyan/20 text-foreground hover:text-nagual-purple transition-all duration-300',
          className
        )}
        {...props}
      >
        {children}
      </Button>
    )
  }
  return (
    <Button
      size={size}
      className={cn(
        'bg-gradient-to-r from-nagual-purple to-nagual-cyan hover:from-nagual-purple/90 hover:to-nagual-cyan/90 text-white border-0 shadow-lg shadow-nagual-purple/20 hover:shadow-nagual-purple/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}
