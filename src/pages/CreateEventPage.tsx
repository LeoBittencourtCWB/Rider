import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateEvent, useUploadEventImage } from '@/hooks/useEvents'
import { supabase } from '@/lib/supabase'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { ImagePlus } from 'lucide-react'

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

export default function CreateEventPage() {
  const navigate = useNavigate()
  const createEvent = useCreateEvent()
  const uploadImage = useUploadEventImage()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: { event_cost: '0' },
  })

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  async function onSubmit(data: FormData) {
    const event = await createEvent.mutateAsync({
      event_name: data.event_name,
      event_description: data.event_description || null,
      event_address: data.event_address,
      event_date: data.event_date,
      event_start_time: data.event_start_time,
      event_end_time: data.event_end_time || null,
      event_cost: parseFloat(data.event_cost) || 0,
    })

    if (imageFile && event) {
      const url = await uploadImage.mutateAsync({ eventId: event.event_id, file: imageFile })
      await supabase.from('events').update({ event_picture: url }).eq('event_id', event.event_id)
    }

    navigate('/')
  }

  return (
    <>
      <TopBar title="Criar Evento" showBack />

      <form onSubmit={handleSubmit(onSubmit)} className="px-4 py-4 space-y-4">
        <div
          onClick={() => document.getElementById('event-image')?.click()}
          className="w-full h-40 rounded-2xl bg-black border-2 border-dashed border-primary/40 flex flex-col items-center justify-center cursor-pointer hover:border-primary/70 transition-colors overflow-hidden"
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <>
              <ImagePlus className="w-8 h-8 text-primary mb-2" />
              <span className="text-sm text-white/70">Adicionar foto/eflyer</span>
            </>
          )}
          <input
            id="event-image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        <Input id="event_name" label="Nome do Evento *" placeholder="Ex: Encontro de Motociclistas SP" error={errors.event_name?.message} {...register('event_name')} />
        <div>
          <Textarea id="event_description" label="Descrição" placeholder="Descreva o evento..." rows={4} {...register('event_description')} />
          <p className="text-xs text-white/60 mt-1">Use **texto** para <strong>negrito</strong>, *texto* para <em>itálico</em>. Enter para nova linha.</p>
        </div>
        <Input id="event_address" label="Endereço *" placeholder="Rua, número, bairro, cidade" error={errors.event_address?.message} {...register('event_address')} />
        <div>
          <Input id="event_date" label="Data de Início *" type="date" error={errors.event_date?.message} {...register('event_date')} />
          <p className="text-xs text-white/60 mt-1">Formato: dd/mm/aaaa</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input id="event_start_time" label="Horário de Início *" type="time" error={errors.event_start_time?.message} {...register('event_start_time')} />
          <Input id="event_end_time" label="Horário de Término" type="time" {...register('event_end_time')} />
        </div>
        <Input id="event_cost" label="Valor (R$)" type="number" step="0.01" min="0" placeholder="0.00" {...register('event_cost')} />

        <Button type="submit" className="w-full" size="lg" disabled={createEvent.isPending || uploadImage.isPending}>
          {createEvent.isPending ? <Spinner size="sm" /> : 'Criar Evento'}
        </Button>
      </form>
    </>
  )
}
