import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from './button'

type ConfirmOptions = {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolverRef = useRef<((value: boolean) => void) | null>(null)
  const confirmBtnRef = useRef<HTMLButtonElement>(null)

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts)
    setOpen(true)
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  const handleClose = useCallback((result: boolean) => {
    setOpen(false)
    resolverRef.current?.(result)
    resolverRef.current = null
  }, [])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose(false)
    }
    window.addEventListener('keydown', onKey)
    // focus primary action for fast confirm
    const t = setTimeout(() => confirmBtnRef.current?.focus(), 50)
    return () => {
      window.removeEventListener('keydown', onKey)
      clearTimeout(t)
    }
  }, [open, handleClose])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {open && options && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby={options.description ? 'confirm-desc' : undefined}
          className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center px-4 pb-[env(safe-area-inset-bottom)]"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={() => handleClose(false)}
          />
          <div className="relative w-full max-w-sm bg-black border border-primary/30 rounded-3xl p-6 shadow-2xl animate-scale-in">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${options.variant === 'danger' ? 'bg-error/15 border border-error/30' : 'bg-primary/15 border border-primary/30'}`}>
                <AlertTriangle className={`w-7 h-7 ${options.variant === 'danger' ? 'text-error' : 'text-primary'}`} aria-hidden="true" />
              </div>
              <h2 id="confirm-title" className="text-lg font-bold text-white">
                {options.title}
              </h2>
              {options.description && (
                <p id="confirm-desc" className="text-sm text-white/70 leading-relaxed">
                  {options.description}
                </p>
              )}
            </div>
            <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={() => handleClose(false)}
              >
                {options.cancelText ?? 'Cancelar'}
              </Button>
              <Button
                ref={confirmBtnRef}
                type="button"
                variant={options.variant === 'danger' ? 'danger' : 'primary'}
                size="lg"
                className="flex-1"
                onClick={() => handleClose(true)}
              >
                {options.confirmText ?? 'Confirmar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
  return ctx
}
