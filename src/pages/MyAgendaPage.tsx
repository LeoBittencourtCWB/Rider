import { useNavigate } from 'react-router-dom'
import { useMyAgenda } from '@/hooks/useRegistrations'
import { TopBar } from '@/components/layout/TopBar'
import { Card } from '@/components/ui/card'
import { PageSpinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { formatEventDate, formatDayOfWeek, formatTime } from '@/lib/utils'
import { CalendarDays, MapPin, ImageOff } from 'lucide-react'

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
                className="cursor-pointer active:scale-[0.98] transition-transform overflow-hidden !p-0"
                onClick={() => navigate(`/events/${reg.events.event_id}`)}
              >
                <div className="flex">
                  {/* Miniatura da foto */}
                  <div className="w-20 shrink-0">
                    {reg.events.event_picture ? (
                      <img src={reg.events.event_picture} alt={reg.events.event_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-surface-light flex items-center justify-center min-h-[5rem]">
                        <ImageOff className="w-5 h-5 text-text-muted/40" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 p-3 space-y-1.5">
                    <h3 className="font-semibold text-text-primary text-sm">{reg.events.event_name}</h3>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="text-sm font-bold text-text-primary">
                        {formatEventDate(reg.events.event_date)} ({formatDayOfWeek(reg.events.event_date)}) - {formatTime(reg.events.event_start_time)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <MapPin className="w-3 h-3 shrink-0 text-text-muted" />
                      <span className="truncate">{reg.events.event_address}</span>
                    </div>
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
