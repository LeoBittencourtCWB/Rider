import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

interface AuthState {
  session: Session | null
  profile: Profile | null
  loading: boolean
  profileComplete: boolean
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  loading: true,
  profileComplete: false,
  setSession: (session) => set({ session }),
  setProfile: (profile) =>
    set({
      profile,
      profileComplete: profile !== null && !!profile.user_name && !!profile.whatsapp,
    }),
  setLoading: (loading) => set({ loading }),
  clear: () => set({ session: null, profile: null, loading: false, profileComplete: false }),
}))
