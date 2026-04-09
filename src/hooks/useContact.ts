import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

export function useContact() {
  const { session, profile } = useAuthStore()

  return useMutation({
    mutationFn: async (message: string) => {
      if (!session?.user) throw new Error('Não autenticado')

      // Salvar no banco
      const { error } = await supabase
        .from('contact_messages')
        .insert({ user_id: session.user.id, message })
      if (error) throw error

      // Enviar email via Web3Forms (gratuito, sem backend)
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: import.meta.env.VITE_WEB3FORMS_KEY || '',
          subject: `[Rider] Nova mensagem de ${profile?.user_name || 'Usuário'}`,
          from_name: 'Rider',
          to: 'kawabit@gmail.com',
          message: `De: ${profile?.user_name || 'N/A'} (${profile?.email || 'N/A'})\nWhatsApp: ${profile?.whatsapp || 'N/A'}\n\nMensagem:\n${message}`,
        }),
      })

      if (!response.ok) {
        console.warn('Email não enviado via Web3Forms, mas mensagem salva no banco.')
      }
    },
    onSuccess: () => {
      toast.success('Mensagem enviada com sucesso!')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
