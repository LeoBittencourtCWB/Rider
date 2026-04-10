import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  Home,
  CalendarDays,
  Settings,
  Mail,
  PlusCircle,
  Pencil,
  Gift,
} from 'lucide-react'

const mainItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/agenda', label: 'Minha Agenda', icon: CalendarDays },
  { path: '__manage__', label: 'Gerenciar', icon: Settings },
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
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setShowManage(false)}
        />
      )}

      {/* Submenu Gerenciar Evento - pílulas */}
      {showManage && (
        <div className="fixed right-4 z-50 flex flex-col items-end gap-3" style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
          {manageItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className="flex items-center gap-3 bg-black border border-primary/40 rounded-full px-5 py-3 text-white text-base font-medium shadow-xl shadow-black/50 hover:border-primary/70 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Barra de navegação */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-primary/20 z-50 pb-[env(safe-area-inset-bottom)]">
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
                type="button"
                onClick={() => handleNav(item.path)}
                aria-label={item.label}
                aria-current={!isManageBtn && isActive ? 'page' : undefined}
                aria-expanded={isManageBtn ? showManage : undefined}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 min-w-[3.5rem] min-h-11 rounded-xl transition-all duration-200',
                  isActive
                    ? 'text-primary'
                    : 'text-primary/70 hover:text-primary'
                )}
              >
                {isActive && (
                  <span className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
                <item.icon className={cn('w-6 h-6', isActive && 'drop-shadow-[0_0_6px_rgba(255,107,0,0.5)]')} aria-hidden="true" />
                <span className="text-[11px] font-medium leading-none">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
