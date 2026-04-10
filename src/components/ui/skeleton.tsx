import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('bg-white/5 animate-pulse rounded-md', className)}
    />
  )
}

export function EventCardSkeleton() {
  return (
    <div className="bg-black rounded-2xl border border-primary/20 overflow-hidden">
      <div className="flex">
        <Skeleton className="w-24 h-32 shrink-0 rounded-none border-r-[6px] border-black" />
        <div className="flex-1 min-w-0 p-3 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-4 w-2/3 mt-1" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <div className="flex flex-col items-end justify-between p-3 shrink-0 gap-2">
          <Skeleton className="h-6 w-10 rounded-full" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  )
}
