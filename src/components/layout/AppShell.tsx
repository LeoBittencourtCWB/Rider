import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function AppShell() {
  return (
    <div className="flex flex-col min-h-dvh max-w-lg mx-auto">
      <main className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
