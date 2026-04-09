import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { PageSpinner } from '@/components/ui/spinner'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading, profileComplete } = useAuthStore()

  if (loading) return <PageSpinner />
  if (!session) return <Navigate to="/login" replace />
  if (!profileComplete) return <Navigate to="/setup" replace />

  return <>{children}</>
}
