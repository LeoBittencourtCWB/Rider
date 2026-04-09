import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryClient } from '@/lib/queryClient'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

export interface AgendaEvent {
  event_id: string
  event_name: string
  event_date: string
  event_start_time: string
  event_end_time: string
  event_address: string
  event_cost: number
  created_by: string
  is_active: boolean
}

export interface AgendaItem {
  registration_id: string
  registered_at: string
  events: AgendaEvent
}

export function useMyAgenda() {
  const { session } = useAuthStore()
  return useQuery({
    queryKey: ['my-agenda', session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return [] as AgendaItem[]
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          registration_id,
          registered_at,
          events:event_id (
            event_id,
            event_name,
            event_date,
            event_start_time,
            event_end_time,
            event_address,
            event_cost,
            created_by,
            is_active
          )
        `)
        .eq('user_id', session.user.id)
        .order('registered_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as unknown as AgendaItem[]
    },
    enabled: !!session?.user,
  })
}

export function useEventRegistration(eventId: string) {
  const { session } = useAuthStore()

  const isRegistered = useQuery({
    queryKey: ['registration', eventId, session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return false
      const { data } = await supabase
        .from('event_registrations')
        .select('registration_id')
        .eq('event_id', eventId)
        .eq('user_id', session.user.id)
        .single()
      return !!data
    },
    enabled: !!session?.user && !!eventId,
  })

  const join = useMutation({
    mutationFn: async () => {
      if (!session?.user) throw new Error('Não autenticado')
      const { error } = await supabase
        .from('event_registrations')
        .insert({ event_id: eventId, user_id: session.user.id })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registration', eventId] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['event', eventId] })
      queryClient.invalidateQueries({ queryKey: ['my-agenda'] })
      queryClient.invalidateQueries({ queryKey: ['participants', eventId] })
      toast.success('Inscrição confirmada!')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const leave = useMutation({
    mutationFn: async () => {
      if (!session?.user) throw new Error('Não autenticado')
      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', session.user.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registration', eventId] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['event', eventId] })
      queryClient.invalidateQueries({ queryKey: ['my-agenda'] })
      queryClient.invalidateQueries({ queryKey: ['participants', eventId] })
      toast.success('Inscrição cancelada.')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return { isRegistered: isRegistered.data ?? false, join, leave }
}

export interface Participant {
  registration_id: string
  registered_at: string
  profiles: {
    user_id: string
    user_name: string
    user_picture: string | null
  }
}

export function useEventParticipants(eventId: string) {
  return useQuery({
    queryKey: ['participants', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          registration_id,
          registered_at,
          profiles:user_id (
            user_id,
            user_name,
            user_picture
          )
        `)
        .eq('event_id', eventId)
        .order('registered_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as unknown as Participant[]
    },
    enabled: !!eventId,
  })
}
