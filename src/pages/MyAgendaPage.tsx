import { useNavigate } from 'react-router-dom'
import { useMyAgenda } from '@/hooks/useRegistrations'
import { TopBar } from '@/components/layout/TopBar'
import { PageSpinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { formatEventDate, formatDayOfWeek, formatTime } from '@/lib/utils'
import { CalendarDays, MapPin, ImageOff, Clock } from 'lucide-react'

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

      <div className="px-4 py-4 space-y-4">
        {isLoading ? (
          <PageSpinner />
        ) : !sorted?.length ? (
          <EmptyState
            icon={<CalendarDays className="w-12 h-12" />}
            title="Nenhum evento na agenda"
            description="Inscreva-se em eventos na tela inicial"
          />
        ) : (
          sorted.map((reg) => (
            <div
              key={reg.registration_id}
              onClick={() => navigate(`/events/${reg.events.event_id}`)}
              className="bg-black rounded-2xl border border-primary/30 overflow-hidden cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-black/40 active:scale-[0.98]"
            >
              <div className="flex">
                {/* Miniatura */}
                <div className="w-24 h-32 shrink-0 border-r-[6px] border-black">
                  {reg.events.event_picture ? (
                    <img src={reg.events.event_picture} alt={reg.events.event_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                      <ImageOff className="w-6 h-6 text-primary/40" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 p-3 space-y-1">
                  <h3 className="font-semibold text-white text-sm truncate">{reg.events.event_name}</h3>
                  <div className="flex items-center gap-1 pt-1">
                    <CalendarDays className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-sm font-bold text-white">
                      {formatEventDate(reg.events.event_date)}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/60 pl-5">
                    ({formatDayOfWeek(reg.events.event_date)})
                  </p>
                  <div className="flex items-center gap-1 text-xs text-white/80">
                    <Clock className="w-3 h-3 text-primary shrink-0" />
                    <span>{formatTime(reg.events.event_start_time)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-white/70">
                    <MapPin className="w-3 h-3 text-primary shrink-0" />
                    <span className="truncate">{reg.events.event_address}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
