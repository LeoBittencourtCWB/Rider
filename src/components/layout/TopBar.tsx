import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Bike } from 'lucide-react'

interface TopBarProps {
  title?: string
  showBack?: boolean
  children?: React.ReactNode
}

export function TopBar({ title, showBack = true, children }: TopBarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <header className="sticky top-0 bg-background/90 backdrop-blur-xl border-b border-border z-40">
      <div className="max-w-lg mx-auto flex items-center h-14 px-4 gap-3">
        {showBack && !isHome && (
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-light transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        {isHome && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Bike className="w-4 h-4 text-primary" />
            </div>
          </div>
        )}
        {title && (
          <h1 className="text-base font-semibold truncate flex-1 text-text-primary">
            {title}
          </h1>
        )}
        {children}
      </div>
    </header>
  )
}
