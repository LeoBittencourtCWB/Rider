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
import { Camera } from 'lucide-react'

const schema = z.object({
  user_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  whatsapp: z.string().min(10, 'Informe um número válido com DDD'),
  motorcycle_plate: z.string().optional(),
  backseat_name: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function UpdateProfilePage() {
  const { profile } = useAuth()
  const { updateProfile, uploadAvatar } = useProfile()
  const fileRef = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.user_picture || null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
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

      <div className="px-4 py-4 space-y-6">
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar src={avatarPreview} name={profile?.user_name} size="lg" />
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center"
            >
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <p className="text-sm text-text-secondary mt-2">{profile?.email}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input id="user_name" label="Nome *" error={errors.user_name?.message} {...register('user_name')} />
          <Input id="email" label="Email *" type="email" error={errors.email?.message} {...register('email')} />
          <Input id="whatsapp" label="WhatsApp *" type="tel" error={errors.whatsapp?.message} {...register('whatsapp')} />
          <Input id="motorcycle_plate" label="Placa da Moto" placeholder="ABC-1234" {...register('motorcycle_plate')} />
          <Input id="backseat_name" label="Nome do(a) Garupa" placeholder="Nome do(a) acompanhante" {...register('backseat_name')} />

          <Button type="submit" className="w-full" size="lg" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? <Spinner size="sm" /> : 'Salvar'}
          </Button>
        </form>

      </div>
    </>
  )
}
