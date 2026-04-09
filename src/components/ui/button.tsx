import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-hover active:scale-[0.97] shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30',
      secondary: 'bg-surface-light text-text-primary hover:bg-surface-hover active:scale-[0.97] border border-border',
      outline: 'border border-border text-text-primary hover:bg-surface-light hover:border-border-light active:scale-[0.97]',
      ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-light active:scale-[0.97]',
      danger: 'bg-error text-white hover:bg-error/80 active:scale-[0.97] shadow-md shadow-error/20',
    }
    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2.5 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
export { Button }
