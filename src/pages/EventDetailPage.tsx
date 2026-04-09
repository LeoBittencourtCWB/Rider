import { useParams } from 'react-router-dom'
import { useEventDetail } from '@/hooks/useEvents'
import { useEventRegistration, useEventParticipants } from '@/hooks/useRegistrations'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { PageSpinner } from '@/components/ui/spinner'
import { formatEventDate, formatDayOfWeek, formatTime, formatCurrency, getWhatsAppShareUrl, getGoogleMapsUrl, getWazeUrl } from '@/lib/utils'
import {
  CalendarDays, Clock, MapPin, DollarSign, Users,
  Share2, Navigation, UserPlus, Check, Map
} from 'lucide-react'

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: event, isLoading } = useEventDetail(id!)
  const { isRegistered, join, leave } = useEventRegistration(id!)
  const { data: participants } = useEventParticipants(id!)

  if (isLoading || !event) return <PageSpinner />

  const isFree = event.event_cost === 0

  function handleShare() {
    const url = getWhatsAppShareUrl(
      event!.event_name, event!.event_date,
      event!.event_start_time, event!.event_address, event!.event_cost
    )
    window.open(url, '_blank')
  }

  return (
    <>
      <TopBar title={event.event_name} showBack />

      {event.event_picture && (
        <div className="relative">
          <img
            src={event.event_picture}
            alt={event.event_name}
            className="w-full h-52 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        </div>
      )}

      <div className="px-4 py-5 space-y-5">
        {/* Cabeçalho */}
        <div>
          <h2 className="text-xl font-bold leading-tight">{event.event_name}</h2>
          <p className="text-sm text-text-muted mt-1">
            Criado por <span className="text-primary font-medium">{event.creator_name}</span>
          </p>
        </div>

        {event.event_description && (
          <p className="text-text-secondary text-sm leading-relaxed">
            {event.event_description}
          </p>
        )}

        {/* Informações */}
        <div className="bg-surface rounded-2xl border border-border divide-y divide-border/50">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <CalendarDays className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm font-medium">
              {formatEventDate(event.event_date)} <span className="text-text-muted font-normal">({formatDayOfWeek(event.event_date)})</span>
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm">{formatTime(event.event_start_time)} - {formatTime(event.event_end_time)}</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm flex-1">{event.event_address}</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <p className={`text-sm font-semibold ${isFree ? 'text-success' : 'text-text-primary'}`}>
              {formatCurrency(event.event_cost)}
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm">{event.participant_count} participante(s) confirmado(s)</p>
          </div>
        </div>

        {/* Botão Participar */}
        <Button
          className="w-full"
          size="lg"
          variant={isRegistered ? 'secondary' : 'primary'}
          onClick={() => isRegistered ? leave.mutate() : join.mutate()}
          disabled={join.isPending || leave.isPending}
        >
          {isRegistered ? (
            <><Check className="w-5 h-5" /> Inscrito</>
          ) : (
            <><UserPlus className="w-5 h-5" /> Participar</>
          )}
        </Button>

        {/* Ações */}
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
            <span className="text-xs">WhatsApp</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(getGoogleMapsUrl(event.event_address), '_blank')}
          >
            <Map className="w-4 h-4" />
            <span className="text-xs">Maps</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(getWazeUrl(event.event_address), '_blank')}
          >
            <Navigation className="w-4 h-4" />
            <span className="text-xs">Waze</span>
          </Button>
        </div>

        {/* Participantes */}
        {participants && participants.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-text-secondary mb-3">
              Participantes ({participants.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {participants.map((p) => (
                <div key={p.registration_id} className="flex items-center gap-2 bg-surface rounded-full border border-border pl-1 pr-3 py-1">
                  <Avatar src={p.profiles?.user_picture} name={p.profiles?.user_name} size="sm" />
                  <span className="text-xs text-text-secondary">{p.profiles?.user_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
