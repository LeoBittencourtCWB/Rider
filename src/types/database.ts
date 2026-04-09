export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string
          user_name: string
          user_picture: string | null
          email: string
          whatsapp: string
          motorcycle_plate: string | null
          backseat_name: string | null
          created_date: string
        }
        Insert: {
          user_id: string
          user_name: string
          user_picture?: string | null
          email: string
          whatsapp: string
          motorcycle_plate?: string | null
          backseat_name?: string | null
          created_date?: string
        }
        Update: {
          user_id?: string
          user_name?: string
          user_picture?: string | null
          email?: string
          whatsapp?: string
          motorcycle_plate?: string | null
          backseat_name?: string | null
        }
      }
      events: {
        Row: {
          event_id: string
          event_name: string
          event_picture: string | null
          event_description: string | null
          event_address: string
          event_date: string
          event_start_time: string
          event_end_time: string
          event_cost: number
          created_by: string
          created_date: string
          is_active: boolean
        }
        Insert: {
          event_id?: string
          event_name: string
          event_picture?: string | null
          event_description?: string | null
          event_address: string
          event_date: string
          event_start_time: string
          event_end_time: string
          event_cost?: number
          created_by: string
          created_date?: string
          is_active?: boolean
        }
        Update: {
          event_name?: string
          event_picture?: string | null
          event_description?: string | null
          event_address?: string
          event_date?: string
          event_start_time?: string
          event_end_time?: string
          event_cost?: number
          is_active?: boolean
        }
      }
      event_registrations: {
        Row: {
          registration_id: string
          event_id: string
          user_id: string
          registered_at: string
        }
        Insert: {
          registration_id?: string
          event_id: string
          user_id: string
          registered_at?: string
        }
        Update: {
          event_id?: string
          user_id?: string
        }
      }
      raffle_products: {
        Row: {
          product_id: string
          event_id: string
          product_name: string
          product_description: string | null
          created_at: string
        }
        Insert: {
          product_id?: string
          event_id: string
          product_name: string
          product_description?: string | null
          created_at?: string
        }
        Update: {
          product_name?: string
          product_description?: string | null
        }
      }
      raffle_winners: {
        Row: {
          winner_id: string
          product_id: string
          event_id: string
          user_id: string
          drawn_at: string
        }
        Insert: {
          winner_id?: string
          product_id: string
          event_id: string
          user_id: string
          drawn_at?: string
        }
        Update: Record<string, never>
      }
      contact_messages: {
        Row: {
          message_id: string
          user_id: string
          message: string
          created_at: string
        }
        Insert: {
          message_id?: string
          user_id: string
          message: string
          created_at?: string
        }
        Update: Record<string, never>
      }
    }
    Views: {
      events_with_count: {
        Row: {
          event_id: string
          event_name: string
          event_picture: string | null
          event_description: string | null
          event_address: string
          event_date: string
          event_start_time: string
          event_end_time: string
          event_cost: number
          created_by: string
          created_date: string
          is_active: boolean
          creator_name: string
          creator_picture: string | null
          participant_count: number
        }
      }
    }
    Functions: {
      draw_raffle: {
        Args: { p_event_id: string }
        Returns: {
          product_id: string
          product_name: string
          winner_user_id: string
          winner_name: string
        }[]
      }
    }
    Enums: Record<string, never>
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type EventWithCount = Database['public']['Views']['events_with_count']['Row']
export type EventRegistration = Database['public']['Tables']['event_registrations']['Row']
export type RaffleProduct = Database['public']['Tables']['raffle_products']['Row']
export type RaffleWinner = Database['public']['Tables']['raffle_winners']['Row']
export type ContactMessage = Database['public']['Tables']['contact_messages']['Row']
