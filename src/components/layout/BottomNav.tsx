import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  Home,
  CalendarDays,
  Settings,
  UserCog,
  Mail,
  PlusCircle,
  Pencil,
  Gift,
  X,
} from 'lucide-react'

const mainItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/agenda', label: 'Minha Agenda', icon: CalendarDays },
  { path: '__manage__', label: 'Gerenciar', icon: Settings },
  { path: '/profile', label: 'Perfil', icon: UserCog },
  { path: '/contact', label: 'Contato', icon: Mail },
]

const manageItems = [
  { path: '/events/new', label: 'Criar Evento', icon: PlusCircle },
  { path: '/events/edit', label: 'Editar Evento', icon: Pencil },
  { path: '/raffle', label: 'Fazer Sorteio', icon: Gift },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showManage, setShowManage] = useState(false)

  const isManagePage = ['/events/new', '/events/edit', '/raffle'].some(
    (p) => location.pathname.startsWith(p)
  )

  function handleNav(path: string) {
    if (path === '__manage__') {
      setShowManage((prev) => !prev)
      return
    }
    setShowManage(false)
    navigate(path)
  }

  return (
    <>
      {/* Overlay do submenu Gerenciar */}
      {showManage && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setShowManage(false)}
        />
      )}

      {/* Submenu Gerenciar Evento */}
      {showManage && (
        <div className="fixed bottom-18 left-0 right-0 z-50 px-4 pb-2">
          <div className="max-w-lg mx-auto bg-surface border border-border rounded-2xl p-2 shadow-xl shadow-black/30">
            <div className="flex items-center justify-between px-3 py-2 mb-1">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Gerenciar Evento</span>
              <button
                onClick={() => setShowManage(false)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-light transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {manageItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  location.pathname.startsWith(item.path)
                    ? 'bg-primary/15 text-primary'
                    : 'text-text-secondary hover:bg-surface-light hover:text-text-primary'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                  location.pathname.startsWith(item.path)
                    ? 'bg-primary/20'
                    : 'bg-surface-light'
                )}>
                  <item.icon className="w-4 h-4" />
                </div>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Barra de navegação */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-xl border-t border-border z-50">
        <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-1">
          {mainItems.map((item) => {
            const isManageBtn = item.path === '__manage__'
            const isActive = isManageBtn
              ? showManage || isManagePage
              : item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path)

            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 min-w-[3rem] rounded-xl transition-all duration-200',
                  isActive
                    ? 'text-primary'
                    : 'text-text-muted hover:text-text-secondary'
                )}
              >
                {isActive && (
                  <span className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
                )}
                <item.icon className={cn('w-5 h-5', isActive && 'drop-shadow-[0_0_6px_rgba(255,107,0,0.5)]')} />
                <span className="text-[9px] font-medium leading-none">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
