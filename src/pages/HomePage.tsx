import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEvents } from '@/hooks/useEvents'
import { useEventRegistration } from '@/hooks/useRegistrations'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/avatar'
import { PageSpinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { formatEventDate, formatTime, formatCurrency } from '@/lib/utils'
import { Search, MapPin, Users, CalendarDays, ThumbsUp, Check, Clock, ImageOff, Bike } from 'lucide-react'
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
      className="bg-black rounded-2xl border border-primary/30 overflow-hidden cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-black/40 active:scale-[0.98]"
      onClick={() => navigate(`/events/${event.event_id}`)}
    >
      <div className="flex">
        {/* Miniatura */}
        <div className="w-24 h-32 shrink-0">
          {event.event_picture ? (
            <img src={event.event_picture} alt={event.event_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-black flex items-center justify-center border-r border-primary/20">
              <ImageOff className="w-6 h-6 text-primary/40" />
            </div>
          )}
        </div>

        {/* Info central */}
        <div className="flex-1 min-w-0 p-3 space-y-1">
          <h3 className="font-semibold text-white leading-snug text-sm truncate">
            {event.event_name}
          </h3>
          <p className="text-[11px] text-white/60">
            por {event.creator_name}
          </p>
          <div className="flex items-center gap-1 pt-1">
            <CalendarDays className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-sm font-bold text-white">{formatEventDate(event.event_date)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-white/80">
            <Clock className="w-3 h-3 text-primary shrink-0" />
            <span>{formatTime(event.event_start_time)}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-white/70">
            <MapPin className="w-3 h-3 text-primary shrink-0" />
            <span className="truncate">{event.event_address}</span>
          </div>
        </div>

        {/* Coluna direita */}
        <div className="flex flex-col items-end justify-between p-3 shrink-0 gap-2">
          <div className="flex items-center gap-1 bg-primary/15 border border-primary/30 rounded-full px-2.5 py-1">
            <Users className="w-3 h-3 text-primary" />
            <span className="text-xs font-semibold text-primary">{event.participant_count}</span>
          </div>
          <span className={`text-xs font-bold ${isFree ? 'text-success' : 'text-white'}`}>
            {cost}
          </span>
          <button
            onClick={handleToggle}
            disabled={join.isPending || leave.isPending}
            className="flex items-center gap-1 text-primary font-semibold text-xs hover:text-primary-hover transition-colors disabled:opacity-50"
          >
            {isRegistered ? (
              <><Check className="w-4 h-4" /> Inscrito</>
            ) : (
              <><ThumbsUp className="w-4 h-4" /> Participar</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [search, setSearch] = useState('')
  const { data: events, isLoading } = useEvents(search || undefined)
  const { profile } = useAuth()
  const navigate = useNavigate()

  return (
    <>
      {/* TopBar personalizado */}
      <header className="sticky top-0 bg-black/90 backdrop-blur-xl border-b border-primary/20 z-40">
        <div className="max-w-lg mx-auto flex items-center h-16 px-4 gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <Bike className="w-5 h-5 text-primary" />
          </div>
          <Search className="w-5 h-5 text-primary shrink-0" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-0 px-4 py-2 rounded-full bg-black border border-primary/30 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
          />
          <button
            onClick={() => navigate('/profile')}
            className="shrink-0 rounded-full border-2 border-primary/40 hover:border-primary/70 transition-all"
          >
            <Avatar src={profile?.user_picture} name={profile?.user_name} size="md" />
          </button>
        </div>
      </header>

      {/* Lista de eventos */}
      <div className="px-4 py-4 space-y-4">
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
