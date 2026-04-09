import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEventDetail, useDeleteEvent } from '@/hooks/useEvents'
import { useAuthStore } from '@/stores/authStore'
import { useEventRegistration, useEventParticipants } from '@/hooks/useRegistrations'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { PageSpinner } from '@/components/ui/spinner'
import { formatEventDate, formatDayOfWeek, formatTime, formatCurrency, getWhatsAppShareUrl, getGoogleMapsUrl, getWazeUrl } from '@/lib/utils'
import {
  CalendarDays, Clock, MapPin, DollarSign, Users,
  Share2, Navigation, UserPlus, Check, Map, X, Trash2
} from 'lucide-react'

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: event, isLoading } = useEventDetail(id!)
  const { isRegistered, join, leave } = useEventRegistration(id!)
  const { data: participants } = useEventParticipants(id!)
  const deleteEvent = useDeleteEvent()
  const navigate = useNavigate()
  const { session } = useAuthStore()
  const [showFullImage, setShowFullImage] = useState(false)

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
        <>
          <div className="relative cursor-pointer" onClick={() => setShowFullImage(true)}>
            <img
              src={event.event_picture}
              alt={event.event_name}
              className="w-full h-52 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
          </div>

          {showFullImage && (
            <div
              className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
              onClick={() => setShowFullImage(false)}
            >
              <button
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                onClick={() => setShowFullImage(false)}
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={event.event_picture}
                alt={event.event_name}
                className="max-w-full max-h-full object-contain p-4"
              />
            </div>
          )}
        </>
      )}

      {/* Ações */}
      <div className="px-4 pt-3 pb-0">
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
            <span className="text-xs">Google Maps</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(getWazeUrl(event.event_address), '_blank')}
          >
            <Navigation className="w-4 h-4" />
            <span className="text-xs">Waze</span>
          </Button>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Cabeçalho */}
        <div>
          <h2 className="text-xl font-bold leading-tight">{event.event_name}</h2>
          <p className="text-sm text-text-muted mt-1">
            Criado por <span className="text-primary font-medium">{event.creator_name}</span>
          </p>
        </div>

        {event.event_description && (
          <div
            className="text-text-secondary text-sm leading-relaxed whitespace-pre-line"
            dangerouslySetInnerHTML={{
              __html: event.event_description
                .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/\*\*(.+?)\*\*/g, '<strong class="text-text-primary font-semibold">$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>')
            }}
          />
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
            <p className="text-sm">{formatTime(event.event_start_time)}{event.event_end_time ? ` - ${formatTime(event.event_end_time)}` : ''}</p>
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
          className="w-full py-5 text-lg"
          size="lg"
          variant={isRegistered ? 'secondary' : 'primary'}
          onClick={() => isRegistered ? leave.mutate() : join.mutate()}
          disabled={join.isPending || leave.isPending}
        >
          {isRegistered ? (
            <><Check className="w-6 h-6" /> Inscrito</>
          ) : (
            <><UserPlus className="w-6 h-6" /> Participar</>
          )}
        </Button>

        {/* Participantes */}
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">
            Participantes ({participants?.length || 0})
          </h3>
          {participants && participants.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {participants.map((p) => (
                <div key={p.registration_id} className="flex items-center gap-2 bg-surface rounded-full border border-border pl-1 pr-3 py-1">
                  <Avatar src={p.profiles?.user_picture} name={p.profiles?.user_name} size="sm" />
                  <span className="text-xs text-text-secondary">{p.profiles?.user_name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">Nenhum participante inscrito ainda.</p>
          )}
        </div>

        {/* Deletar evento (apenas dono) */}
        {session?.user?.id === event.created_by && (
          <Button
            variant="danger"
            className="w-full"
            onClick={() => {
              if (confirm('Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.')) {
                deleteEvent.mutate(id!, { onSuccess: () => navigate('/') })
              }
            }}
            disabled={deleteEvent.isPending}
          >
            <Trash2 className="w-4 h-4" /> Excluir Evento
          </Button>
        )}
      </div>
    </>
  )
}
