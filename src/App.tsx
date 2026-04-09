import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { PageSpinner } from '@/components/ui/spinner'

import LoginPage from '@/pages/auth/LoginPage'
import ProfileSetupPage from '@/pages/auth/ProfileSetupPage'
import HomePage from '@/pages/HomePage'
import EventDetailPage from '@/pages/EventDetailPage'
import MyAgendaPage from '@/pages/MyAgendaPage'
import CreateEventPage from '@/pages/CreateEventPage'
import EditEventPage from '@/pages/EditEventPage'
import RafflePage from '@/pages/RafflePage'
import UpdateProfilePage from '@/pages/UpdateProfilePage'
import ContactPage from '@/pages/ContactPage'

export default function App() {
  const { loading } = useAuth()

  if (loading) return <PageSpinner />

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/setup" element={<ProfileSetupPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/agenda" element={<MyAgendaPage />} />
        <Route path="/events/new" element={<CreateEventPage />} />
        <Route path="/events/edit" element={<EditEventPage />} />
        <Route path="/raffle" element={<RafflePage />} />
        <Route path="/profile" element={<UpdateProfilePage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
