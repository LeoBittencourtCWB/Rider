import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryClient } from '@/lib/queryClient'
import { useAuthStore } from '@/stores/authStore'
import type { Database, EventWithCount } from '@/types/database'
import toast from 'react-hot-toast'

type EventInsert = Database['public']['Tables']['events']['Insert']
type EventUpdate = Database['public']['Tables']['events']['Update']

export function useEvents(search?: string) {
  return useQuery({
    queryKey: ['events', search],
    queryFn: async () => {
      let query = supabase
        .from('events_with_count')
        .select('*')
        .eq('is_active', true as never)
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .order('event_start_time', { ascending: true })

      if (search) {
        query = query.ilike('event_name', `%${search}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as unknown as EventWithCount[]
    },
  })
}

export function useEventDetail(eventId: string) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events_with_count')
        .select('*')
        .eq('event_id', eventId)
        .single()
      if (error) throw error
      return data as unknown as EventWithCount
    },
    enabled: !!eventId,
  })
}

export function useMyEvents() {
  const { session } = useAuthStore()
  return useQuery({
    queryKey: ['my-events', session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return [] as EventWithCount[]
      const { data, error } = await supabase
        .from('events_with_count')
        .select('*')
        .eq('created_by', session.user.id)
        .eq('is_active', true as never)
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })
      if (error) throw error
      return (data ?? []) as unknown as EventWithCount[]
    },
    enabled: !!session?.user,
  })
}

export function useCreateEvent() {
  const { session } = useAuthStore()
  return useMutation({
    mutationFn: async (data: Omit<EventInsert, 'created_by'>) => {
      if (!session?.user) throw new Error('Não autenticado')
      const { error, data: event } = await supabase
        .from('events')
        .insert({ ...data, created_by: session.user.id })
        .select()
        .single()
      if (error) {
        if (error.code === '23505') {
          throw new Error('Já existe um evento nesta data, horário e endereço.')
        }
        throw error
      }
      return event
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['my-events'] })
      toast.success('Evento criado com sucesso!')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdateEvent() {
  return useMutation({
    mutationFn: async ({ eventId, data }: { eventId: string; data: EventUpdate }) => {
      const { error, data: event } = await supabase
        .from('events')
        .update(data)
        .eq('event_id', eventId)
        .select()
        .single()
      if (error) {
        if (error.code === '23505') {
          throw new Error('Já existe um evento nesta data, horário e endereço.')
        }
        throw error
      }
      return event
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['event', eventId] })
      queryClient.invalidateQueries({ queryKey: ['my-events'] })
      toast.success('Evento atualizado!')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUploadEventImage() {
  return useMutation({
    mutationFn: async ({ eventId, file }: { eventId: string; file: File }) => {
      const ext = file.name.split('.').pop()
      const path = `${eventId}/cover.${ext}`
      const { error } = await supabase.storage
        .from('event-images')
        .upload(path, file, { upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(path)
      return publicUrl
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
