import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-surface rounded-2xl border border-border p-4 transition-all duration-200',
        'hover:border-border-light hover:shadow-lg hover:shadow-black/20',
        className
      )}
      {...props}
    />
  )
}
