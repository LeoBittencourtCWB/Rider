import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner, PageSpinner } from '@/components/ui/spinner'
import { UserCheck } from 'lucide-react'

const schema = z.object({
  user_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  whatsapp: z.string().min(10, 'Informe um número válido com DDD'),
})

type FormData = z.infer<typeof schema>

export default function ProfileSetupPage() {
  const { session, loading, profileComplete } = useAuth()
  const { createProfile } = useProfile()
  const { session: storeSession } = useAuthStore()
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      email: storeSession?.user?.email || '',
    },
  })

  if (loading) return <PageSpinner />
  if (!session) return <Navigate to="/login" replace />
  if (profileComplete) return <Navigate to="/" replace />

  async function onSubmit(data: FormData) {
    setSubmitting(true)
    try {
      await createProfile.mutateAsync(data)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-8 relative">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-1">
            <UserCheck className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">Complete seu Perfil</h1>
          <p className="text-white/70 text-sm">
            Precisamos de algumas informações para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="user_name"
            label="Nome *"
            placeholder="Seu nome"
            autoComplete="name"
            error={errors.user_name?.message}
            {...register('user_name')}
          />
          <Input
            id="email"
            label="Email *"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            inputMode="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            id="whatsapp"
            label="WhatsApp *"
            type="tel"
            placeholder="11999999999"
            autoComplete="tel"
            inputMode="tel"
            error={errors.whatsapp?.message}
            {...register('whatsapp')}
          />

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? <Spinner size="sm" /> : 'Continuar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
