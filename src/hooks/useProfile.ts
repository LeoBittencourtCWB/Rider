import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { Profile } from '@/types/database'
import toast from 'react-hot-toast'

export function useProfile() {
  const { session, setProfile } = useAuthStore()

  const createProfile = useMutation({
    mutationFn: async (data: { user_name: string; email: string; whatsapp: string }) => {
      if (!session?.user) throw new Error('Não autenticado')
      const { error, data: profile } = await supabase
        .from('profiles')
        .insert({ user_id: session.user.id, ...data })
        .select()
        .single()
      if (error) throw error
      return profile
    },
    onSuccess: (profile) => {
      setProfile(profile)
      toast.success('Perfil criado com sucesso!')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const updateProfile = useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      if (!session?.user) throw new Error('Não autenticado')
      const { error, data: profile } = await supabase
        .from('profiles')
        .update(data)
        .eq('user_id', session.user.id)
        .select()
        .single()
      if (error) throw error
      return profile
    },
    onSuccess: (profile) => {
      setProfile(profile)
      toast.success('Perfil atualizado!')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      if (!session?.user) throw new Error('Não autenticado')
      const ext = file.name.split('.').pop()
      const path = `${session.user.id}/avatar.${ext}`
      const { error } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)
      return publicUrl
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return { createProfile, updateProfile, uploadAvatar }
}
