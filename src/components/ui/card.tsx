import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-black rounded-2xl border border-primary/30 p-4 transition-all duration-200',
        'hover:border-primary/50 hover:shadow-lg hover:shadow-black/40',
        className
      )}
      {...props}
    />
  )
}
