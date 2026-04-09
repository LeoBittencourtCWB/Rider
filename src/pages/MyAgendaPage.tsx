import { useNavigate } from 'react-router-dom'
import { useMyAgenda } from '@/hooks/useRegistrations'
import { TopBar } from '@/components/layout/TopBar'
import { Card } from '@/components/ui/card'
import { PageSpinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { formatEventDate, formatDayOfWeek, formatTime } from '@/lib/utils'
import { CalendarDays, MapPin } from 'lucide-react'

export default function MyAgendaPage() {
  const navigate = useNavigate()
  const { data: registrations, isLoading } = useMyAgenda()

  const today = new Date().toISOString().split('T')[0]
  const sorted = registrations
    ?.filter((r) => r.events && r.events.is_active && r.events.event_date >= today)
    .sort((a, b) => {
      const dateA = `${a.events.event_date}T${a.events.event_start_time}`
      const dateB = `${b.events.event_date}T${b.events.event_start_time}`
      return dateA.localeCompare(dateB)
    })

  return (
    <>
      <TopBar title="Minha Agenda" />

      <div className="px-5 py-4 space-y-0">
        {isLoading ? (
          <PageSpinner />
        ) : !sorted?.length ? (
          <EmptyState
            icon={<CalendarDays className="w-12 h-12" />}
            title="Nenhum evento na agenda"
            description="Inscreva-se em eventos na tela inicial"
          />
        ) : (
          sorted.map((reg, index) => (
            <div key={reg.registration_id}>
              {index > 0 && <div className="border-t border-border/50 my-4" />}
              <Card
                className="cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => navigate(`/events/${reg.events.event_id}`)}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-text-primary font-medium">
                      {formatEventDate(reg.events.event_date)} ({formatDayOfWeek(reg.events.event_date)}) - {formatTime(reg.events.event_start_time)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-text-primary">{reg.events.event_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <MapPin className="w-4 h-4 shrink-0 text-text-muted" />
                    <span className="truncate">{reg.events.event_address}</span>
                  </div>
                </div>
              </Card>
            </div>
          ))
        )}
      </div>
    </>
  )
}
