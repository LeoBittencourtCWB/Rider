import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Bike, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type Mode = 'signin' | 'signup'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn, signUp, session, profileComplete } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  if (session && profileComplete) {
    navigate('/', { replace: true })
    return null
  }

  if (session && !profileComplete) {
    navigate('/setup', { replace: true })
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return

    if (mode === 'signup' && password !== confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    if (mode === 'signup' && password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)
    try {
      if (mode === 'signup') {
        await signUp(email, password)
        toast.success('Conta criada com sucesso!')
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao autenticar'
      if (msg.includes('Invalid login credentials')) {
        toast.error('Email ou senha incorretos')
      } else if (msg.includes('Email not confirmed')) {
        toast.error('Confirme seu email antes de entrar.')
      } else if (msg.includes('User already registered')) {
        toast.error('Este email já está cadastrado. Faça login.')
        setMode('signin')
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6">
      {/* Glow decorativo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-8 relative">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-1">
            <Bike className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(255,107,0,0.4)]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-primary">Rider</span>
          </h1>
          <p className="text-white/80 text-sm">
            Gerencie e participe de eventos de motociclistas
          </p>
        </div>

        {/* Toggle Entrar / Criar */}
        <div className="flex bg-black rounded-full p-1 border border-primary/30">
          <button
            onClick={() => setMode('signin')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all duration-200',
              mode === 'signin'
                ? 'bg-white text-black shadow-md'
                : 'text-white/70 hover:text-white'
            )}
          >
            <LogIn className="w-4 h-4" /> Entrar
          </button>
          <button
            onClick={() => setMode('signup')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all duration-200',
              mode === 'signup'
                ? 'bg-white text-black shadow-md'
                : 'text-white/70 hover:text-white'
            )}
          >
            <UserPlus className="w-4 h-4" /> Criar Conta
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="Email"
            autoComplete="email"
            inputMode="email"
          />

          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : 'Sua senha'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Senha"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              aria-pressed={showPassword}
              className="absolute right-1 bottom-0 w-11 h-11 flex items-center justify-center text-white/60 hover:text-primary transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>

          {mode === 'signup' && (
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirme sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                label="Confirmar Senha"
                autoComplete="new-password"
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={showPassword}
                className="absolute right-1 bottom-0 w-11 h-11 flex items-center justify-center text-white/60 hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
              </button>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading || !email || !password}
          >
            {loading ? <Spinner size="sm" /> : mode === 'signin' ? 'Entrar' : 'Criar Conta'}
          </Button>
        </form>

        {mode === 'signin' ? (
          <p className="text-center text-sm text-white/70">
            Não tem conta?{' '}
            <button onClick={() => setMode('signup')} className="text-primary font-medium hover:underline">
              Cadastre-se
            </button>
          </p>
        ) : (
          <p className="text-center text-sm text-white/70">
            Já tem conta?{' '}
            <button onClick={() => setMode('signin')} className="text-primary font-medium hover:underline">
              Faça login
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
