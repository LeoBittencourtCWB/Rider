import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEventDetail, useDeleteEvent } from '@/hooks/useEvents'
import { useAuthStore } from '@/stores/authStore'
import { useEventRegistration, useEventParticipants } from '@/hooks/useRegistrations'
import { TopBar } from '@/components/layout/TopBar'
import { Avatar } from '@/components/ui/avatar'
import { PageSpinner } from '@/components/ui/spinner'
import { formatEventDate, formatDayOfWeek, formatTime, formatCurrency, getWhatsAppShareUrl, getGoogleMapsUrl, getWazeUrl } from '@/lib/utils'
import {
  CalendarDays, Clock, MapPin, DollarSign, Users,
  Share2, Navigation, ThumbsUp, Check, Map, X, Trash2
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

      {/* Ícones de ação inline */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1.5 text-white hover:text-primary transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-black border border-primary/40 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-primary" />
            </div>
            <span className="text-[11px] font-medium">WhatsApp</span>
          </button>
          <button
            onClick={() => window.open(getGoogleMapsUrl(event.event_address), '_blank')}
            className="flex flex-col items-center gap-1.5 text-white hover:text-primary transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-black border border-primary/40 flex items-center justify-center">
              <Map className="w-5 h-5 text-primary" />
            </div>
            <span className="text-[11px] font-medium">Google Maps</span>
          </button>
          <button
            onClick={() => window.open(getWazeUrl(event.event_address), '_blank')}
            className="flex flex-col items-center gap-1.5 text-white hover:text-primary transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-black border border-primary/40 flex items-center justify-center">
              <Navigation className="w-5 h-5 text-primary" />
            </div>
            <span className="text-[11px] font-medium">Waze</span>
          </button>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Cabeçalho */}
        <div>
          <h2 className="text-xl font-bold text-white leading-tight">{event.event_name}</h2>
          <p className="text-sm text-white/70 mt-1">
            Criado por <span className="text-primary font-medium">{event.creator_name}</span>
          </p>
        </div>

        {/* Descrição em caixa preta */}
        {event.event_description && (
          <div className="bg-black rounded-2xl border border-primary/30 p-4">
            <div
              className="text-white/90 text-sm leading-relaxed whitespace-pre-line"
              dangerouslySetInnerHTML={{
                __html: event.event_description
                  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                  .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                  .replace(/\*(.+?)\*/g, '<em>$1</em>')
              }}
            />
          </div>
        )}

        {/* Informações */}
        <div className="bg-black rounded-2xl border border-primary/30 divide-y divide-primary/20">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <CalendarDays className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm font-medium text-white">
              {formatEventDate(event.event_date)} <span className="text-white/60 font-normal">({formatDayOfWeek(event.event_date)})</span>
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm text-white">{formatTime(event.event_start_time)}{event.event_end_time ? ` - ${formatTime(event.event_end_time)}` : ''}</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm text-white flex-1">{event.event_address}</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <p className={`text-sm font-semibold ${isFree ? 'text-success' : 'text-white'}`}>
              {formatCurrency(event.event_cost)}
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm text-white">{event.participant_count} participante(s) confirmado(s)</p>
          </div>
        </div>

        {/* Participantes */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">
            Participantes ({participants?.length || 0})
          </h3>
          {participants && participants.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {participants.map((p) => (
                <div key={p.registration_id} className="flex items-center gap-2 bg-black rounded-full border border-primary/30 pl-1 pr-3 py-1">
                  <Avatar src={p.profiles?.user_picture} name={p.profiles?.user_name} size="sm" />
                  <span className="text-xs text-white">{p.profiles?.user_name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/60">Nenhum participante inscrito ainda.</p>
          )}
        </div>

        {/* Botão Participar/Inscrito no canto inferior direito */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => isRegistered ? leave.mutate() : join.mutate()}
            disabled={join.isPending || leave.isPending}
            className={`flex items-center gap-2 bg-black border rounded-full px-6 py-3 font-semibold text-base transition-all shadow-lg shadow-black/50 disabled:opacity-50 ${
              isRegistered
                ? 'border-white/40 text-white/90 hover:border-white/70'
                : 'border-primary/40 text-primary hover:border-primary/70'
            }`}
          >
            {isRegistered ? (
              <><Check className="w-5 h-5" /> Inscrito</>
            ) : (
              <><ThumbsUp className="w-5 h-5" /> Participar</>
            )}
          </button>
        </div>

        {/* Deletar evento (apenas dono) */}
        {session?.user?.id === event.created_by && (
          <button
            onClick={() => {
              if (confirm('Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.')) {
                deleteEvent.mutate(id!, { onSuccess: () => navigate('/') })
              }
            }}
            disabled={deleteEvent.isPending}
            className="w-full flex items-center justify-center gap-2 bg-error/90 hover:bg-error text-white font-semibold rounded-full px-6 py-3 transition-all disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" /> Excluir Evento
          </button>
        )}
      </div>
    </>
  )
}
