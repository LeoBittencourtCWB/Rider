import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

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
    <header className="sticky top-0 bg-black/90 backdrop-blur-xl border-b border-primary/20 z-40">
      <div className="max-w-lg mx-auto flex items-center h-16 px-4 gap-3">
        {showBack && !isHome && (
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center w-10 h-10 rounded-full text-primary hover:bg-primary/10 transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        {title && (
          <h1 className="text-2xl font-semibold truncate flex-1 text-primary">
            {title}
          </h1>
        )}
        {children}
      </div>
    </header>
  )
}
