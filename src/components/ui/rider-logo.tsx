import { Bike } from 'lucide-react'

export function RiderLogo() {
  return (
    <div className="flex flex-col items-center gap-2 py-8 opacity-40">
      <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center">
        <Bike className="w-7 h-7 text-primary" />
      </div>
      <span className="text-xs text-white/40 font-medium tracking-wider uppercase">Rider</span>
    </div>
  )
}
