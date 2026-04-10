import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMyEvents, useUpdateEvent, useUploadEventImage } from '@/hooks/useEvents'
import { TopBar } from '@/components/layout/TopBar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Spinner, PageSpinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { formatEventDate, formatTime } from '@/lib/utils'
import { Pencil, ImagePlus } from 'lucide-react'
import type { EventWithCount } from '@/types/database'

const schema = z.object({
  event_name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  event_description: z.string().optional(),
  event_address: z.string().min(5, 'Endereço é obrigatório'),
  event_date: z.string().min(1, 'Data é obrigatória'),
  event_start_time: z.string().min(1, 'Horário de início é obrigatório'),
  event_end_time: z.string().optional(),
  event_cost: z.string(),
})

type FormData = z.infer<typeof schema>

function EditForm({ event }: { event: EventWithCount }) {
  const navigate = useNavigate()
  const updateEvent = useUpdateEvent()
  const uploadImage = useUploadEventImage()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(event.event_picture)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      event_name: event.event_name,
      event_description: event.event_description || '',
      event_address: event.event_address,
      event_date: event.event_date,
      event_start_time: event.event_start_time.slice(0, 5),
      event_end_time: event.event_end_time?.slice(0, 5) || '',
      event_cost: String(event.event_cost),
    },
  })

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  async function onSubmit(data: FormData) {
    let pictureUrl = event.event_picture
    if (imageFile) {
      pictureUrl = await uploadImage.mutateAsync({ eventId: event.event_id, file: imageFile })
    }

    await updateEvent.mutateAsync({
      eventId: event.event_id,
      data: {
        event_name: data.event_name,
        event_description: data.event_description || null,
        event_address: data.event_address,
        event_date: data.event_date,
        event_start_time: data.event_start_time,
        event_end_time: data.event_end_time || null,
        event_cost: parseFloat(data.event_cost) || 0,
        event_picture: pictureUrl,
      },
    })

    navigate(`/events/${event.event_id}`)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-4 py-4 space-y-4">
      <div
        onClick={() => document.getElementById('edit-event-image')?.click()}
        className="w-full h-40 rounded-2xl bg-black border-2 border-dashed border-primary/40 flex flex-col items-center justify-center cursor-pointer hover:border-primary/70 transition-colors overflow-hidden"
      >
        {imagePreview ? (
          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <>
            <ImagePlus className="w-8 h-8 text-primary mb-2" />
            <span className="text-sm text-white/70">Alterar foto/eflyer</span>
          </>
        )}
        <input id="edit-event-image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
      </div>

      <Input id="event_name" label="Nome do Evento *" error={errors.event_name?.message} {...register('event_name')} />
      <div>
        <Textarea id="event_description" label="Descrição" rows={4} {...register('event_description')} />
        <p className="text-[10px] text-white/60 mt-1">Use **texto** para <strong>negrito</strong>, *texto* para <em>itálico</em>. Enter para nova linha.</p>
      </div>
      <Input id="event_address" label="Endereço *" error={errors.event_address?.message} {...register('event_address')} />
      <Input id="event_date" label="Data de Início *" type="date" error={errors.event_date?.message} {...register('event_date')} />
      <div className="grid grid-cols-2 gap-3">
        <Input id="event_start_time" label="Horário de Início *" type="time" error={errors.event_start_time?.message} {...register('event_start_time')} />
        <Input id="event_end_time" label="Horário de Término" type="time" {...register('event_end_time')} />
      </div>
      <Input id="event_cost" label="Valor (R$)" type="number" step="0.01" min="0" {...register('event_cost')} />

      <Button type="submit" className="w-full" size="lg" disabled={updateEvent.isPending || uploadImage.isPending}>
        {updateEvent.isPending ? <Spinner size="sm" /> : 'Salvar Alterações'}
      </Button>
    </form>
  )
}

export default function EditEventPage() {
  const { data: events, isLoading } = useMyEvents()
  const [selected, setSelected] = useState<EventWithCount | null>(null)

  if (isLoading) return <PageSpinner />

  if (selected) {
    return (
      <>
        <TopBar title="Editar Evento" showBack />
        <EditForm event={selected} />
      </>
    )
  }

  return (
    <>
      <TopBar title="Editar Evento" />
      <div className="px-4 py-3 space-y-3">
        {!events?.length ? (
          <EmptyState
            icon={<Pencil className="w-12 h-12" />}
            title="Nenhum evento ativo"
            description="Você não tem eventos ativos para editar"
          />
        ) : (
          <>
            <p className="text-sm text-white">Selecione o evento para editar:</p>
            {events.map((event) => (
              <Card
                key={event.event_id}
                className="cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => setSelected(event)}
              >
                <h3 className="font-semibold text-white">{event.event_name}</h3>
                <p className="text-sm text-white/70">
                  {formatEventDate(event.event_date)} - {formatTime(event.event_start_time)}
                </p>
              </Card>
            ))}
          </>
        )}
      </div>
    </>
  )
}
