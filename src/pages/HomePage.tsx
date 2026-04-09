import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEvents } from '@/hooks/useEvents'
import { useEventRegistration } from '@/hooks/useRegistrations'
import { useAuth } from '@/hooks/useAuth'
import { TopBar } from '@/components/layout/TopBar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageSpinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { formatEventDate, formatDayOfWeek, formatTime, formatCurrency } from '@/lib/utils'
import { Search, MapPin, Users, CalendarDays, UserPlus, Check, Clock, LogOut } from 'lucide-react'
import type { EventWithCount } from '@/types/database'

function EventCard({ event }: { event: EventWithCount }) {
  const navigate = useNavigate()
  const { isRegistered, join, leave } = useEventRegistration(event.event_id)

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation()
    if (isRegistered) {
      leave.mutate()
    } else {
      join.mutate()
    }
  }

  const cost = formatCurrency(event.event_cost)
  const isFree = event.event_cost === 0

  return (
    <div
      className="bg-surface rounded-2xl border border-border overflow-hidden cursor-pointer transition-all duration-200 hover:border-border-light hover:shadow-lg hover:shadow-black/20 active:scale-[0.98]"
      onClick={() => navigate(`/events/${event.event_id}`)}
    >
      {/* Barra de destaque no topo */}
      <div className="h-1 bg-gradient-to-r from-primary/80 to-secondary/60" />

      <div className="p-4 space-y-3">
        {/* Linha 1: Nome + Participantes */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-primary leading-snug">
              {event.event_name}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              por {event.creator_name}
            </p>
          </div>
          <Badge>
            <Users className="w-3 h-3 mr-1" />
            {event.participant_count}
          </Badge>
        </div>

        {/* Linha 2: Data + Hora + Valor */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-text-secondary">
            <CalendarDays className="w-3.5 h-3.5 text-primary" />
            <span>{formatEventDate(event.event_date)}</span>
            <span className="text-text-muted">({formatDayOfWeek(event.event_date)})</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>{formatTime(event.event_start_time)}</span>
          </div>
          <span className={`ml-auto text-sm font-bold ${isFree ? 'text-success' : 'text-primary'}`}>
            {cost}
          </span>
        </div>

        {/* Linha 3: Endereço + Botão */}
        <div className="flex items-center gap-3 pt-1 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-sm text-text-muted flex-1 min-w-0">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{event.event_address}</span>
          </div>
          <Button
            size="sm"
            variant={isRegistered ? 'secondary' : 'primary'}
            onClick={handleToggle}
            disabled={join.isPending || leave.isPending}
            className="shrink-0"
          >
            {isRegistered ? (
              <><Check className="w-3.5 h-3.5" /> Inscrito</>
            ) : (
              <><UserPlus className="w-3.5 h-3.5" /> Participar</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [search, setSearch] = useState('')
  const { data: events, isLoading } = useEvents(search || undefined)
  const { signOut } = useAuth()

  return (
    <>
      <TopBar title="Rider">
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-error hover:bg-error/10 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sair
        </button>
      </TopBar>

      {/* Barra de busca com lupa fora do campo */}
      <div className="px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Search className="w-4.5 h-4.5 text-primary" />
          </div>
          <input
            type="text"
            placeholder="Buscar eventos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 hover:border-border-light"
          />
        </div>
      </div>

      {/* Lista de eventos */}
      <div className="px-5 pb-5 space-y-5">
        {isLoading ? (
          <PageSpinner />
        ) : !events?.length ? (
          <EmptyState
            icon={<CalendarDays className="w-12 h-12" />}
            title="Nenhum evento encontrado"
            description={search ? 'Tente outra busca' : 'Nenhum evento ativo no momento'}
          />
        ) : (
          events.map((event) => (
            <EventCard key={event.event_id} event={event} />
          ))
        )}
      </div>
    </>
  )
}
