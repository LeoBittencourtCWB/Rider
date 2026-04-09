import { cn } from '@/lib/utils'

interface SpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Spinner({ className, size = 'md' }: SpinnerProps) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div
      className={cn('animate-spin rounded-full border-2 border-text-muted border-t-primary', sizes[size], className)}
    />
  )
}

export function PageSpinner() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <Spinner size="lg" />
    </div>
  )
}
