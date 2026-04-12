import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryClient } from '@/lib/queryClient'
import toast from 'react-hot-toast'

export function useRaffleProducts(eventId: string) {
  return useQuery({
    queryKey: ['raffle-products', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('raffle_products')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
    enabled: !!eventId,
  })
}

export function useAddRaffleProduct() {
  return useMutation({
    mutationFn: async ({ eventId, productName, productDescription }: {
      eventId: string
      productName: string
      productDescription?: string
    }) => {
      const { error, data } = await supabase
        .from('raffle_products')
        .insert({
          event_id: eventId,
          product_name: productName,
          product_description: productDescription,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['raffle-products', data.event_id] })
      toast.success('Produto adicionado!')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useRemoveRaffleProduct() {
  return useMutation({
    mutationFn: async ({ productId, eventId }: { productId: string; eventId: string }) => {
      const { error } = await supabase
        .from('raffle_products')
        .delete()
        .eq('product_id', productId)
      if (error) throw error
      return { eventId }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['raffle-products', data.eventId] })
      toast.success('Produto removido.')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useDrawRaffle() {
  return useMutation({
    mutationFn: async (eventId: string) => {
      const { data, error } = await supabase.rpc('draw_raffle', { p_event_id: eventId })
      if (error) throw error
      return data as { product_id: string; product_name: string; winner_user_id: string; winner_name: string }[]
    },
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['raffle-products', eventId] })
      queryClient.invalidateQueries({ queryKey: ['raffle-winners', eventId] })
      toast.success('Sorteio realizado com sucesso!')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export interface RaffleWinnerRow {
  winner_id: string
  drawn_at: string
  raffle_products: { product_id: string; product_name: string }
  profiles: { user_id: string; user_name: string; user_picture: string | null; whatsapp: string }
}

export function useRaffleWinners(eventId: string) {
  return useQuery({
    queryKey: ['raffle-winners', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('raffle_winners')
        .select(`
          winner_id,
          drawn_at,
          raffle_products:product_id (
            product_id,
            product_name
          ),
          profiles:user_id (
            user_id,
            user_name,
            user_picture,
            whatsapp
          )
        `)
        .eq('event_id', eventId)
        .order('drawn_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as unknown as RaffleWinnerRow[]
    },
    enabled: !!eventId,
  })
}
