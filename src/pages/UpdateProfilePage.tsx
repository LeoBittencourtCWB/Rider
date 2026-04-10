import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { Camera, LogOut } from 'lucide-react'

const schema = z.object({
  user_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  whatsapp: z.string().min(10, 'Informe um número válido com DDD'),
  motorcycle_plate: z.string().optional(),
  backseat_name: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function UpdateProfilePage() {
  const { profile, signOut } = useAuth()
  const { updateProfile, uploadAvatar } = useProfile()
  const confirm = useConfirm()
  const fileRef = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.user_picture || null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      user_name: profile?.user_name || '',
      email: profile?.email || '',
      whatsapp: profile?.whatsapp || '',
      motorcycle_plate: profile?.motorcycle_plate || '',
      backseat_name: profile?.backseat_name || '',
    },
  })

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    const url = await uploadAvatar.mutateAsync(file)
    await updateProfile.mutateAsync({ user_picture: url })
  }

  async function onSubmit(data: FormData) {
    await updateProfile.mutateAsync({
      user_name: data.user_name,
      email: data.email,
      whatsapp: data.whatsapp,
      motorcycle_plate: data.motorcycle_plate || null,
      backseat_name: data.backseat_name || null,
    })
  }

  return (
    <>
      <TopBar title="Meu Perfil" />

      <div className="px-5 py-5 space-y-7">
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar src={avatarPreview} name={profile?.user_name} size="lg" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="Alterar foto do perfil"
              className="absolute -bottom-1 -right-1 w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-lg border-2 border-black"
            >
              <Camera className="w-5 h-5 text-white" aria-hidden="true" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <p className="text-sm text-white/80 mt-2">{profile?.email}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-20">
          <Input id="user_name" label="Nome *" autoComplete="name" error={errors.user_name?.message} {...register('user_name')} />
          <Input id="email" label="Email *" type="email" autoComplete="email" inputMode="email" error={errors.email?.message} {...register('email')} />
          <Input id="whatsapp" label="WhatsApp *" type="tel" autoComplete="tel" inputMode="tel" error={errors.whatsapp?.message} {...register('whatsapp')} />
          <Input id="motorcycle_plate" label="Placa da Moto" placeholder="ABC-1234" autoComplete="off" {...register('motorcycle_plate')} />
          <Input id="backseat_name" label="Nome do(a) Garupa" placeholder="Nome do(a) acompanhante" autoComplete="off" {...register('backseat_name')} />

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? <Spinner size="sm" /> : 'Salvar Alterações'}
            </Button>
          </div>
        </form>

        <div className="mt-16 pt-8 border-t border-white/10">
          <button
            type="button"
            onClick={async () => {
              const ok = await confirm({
                title: 'Sair da conta?',
                description: 'Você precisará fazer login novamente para acessar o app.',
                confirmText: 'Sair',
                variant: 'danger',
              })
              if (ok) signOut()
            }}
            className="w-full flex items-center justify-center gap-2 min-h-11 px-6 py-3 rounded-full border border-error/40 text-error hover:bg-error/10 font-semibold transition-colors"
          >
            <LogOut className="w-5 h-5" aria-hidden="true" /> Sair da Conta
          </button>
        </div>

      </div>
    </>
  )
}
