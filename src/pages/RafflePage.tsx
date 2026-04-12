import { useState } from 'react'
import { useMyEvents } from '@/hooks/useEvents'
import {
  useRaffleProducts, useAddRaffleProduct, useRemoveRaffleProduct,
  useDrawRaffle, useRaffleWinners,
} from '@/hooks/useRaffle'
import { supabase } from '@/lib/supabase'
import { TopBar } from '@/components/layout/TopBar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageSpinner, Spinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { RiderLogo } from '@/components/ui/rider-logo'
import { formatEventDate, formatTime, isEventPast } from '@/lib/utils'
import { Gift, Plus, Trash2, Trophy, PartyPopper, MessageCircle } from 'lucide-react'
import type { EventWithCount } from '@/types/database'

interface DrawResult {
  product_id: string
  product_name: string
  winner_user_id: string
  winner_name: string
  winner_whatsapp?: string
}

function RaffleManager({ event }: { event: EventWithCount }) {
  const { data: products, isLoading: loadingProducts } = useRaffleProducts(event.event_id)
  const { data: winners } = useRaffleWinners(event.event_id)
  const addProduct = useAddRaffleProduct()
  const removeProduct = useRemoveRaffleProduct()
  const drawRaffle = useDrawRaffle()
  const [newProduct, setNewProduct] = useState('')
  const [drawResults, setDrawResults] = useState<DrawResult[] | null>(null)

  function handleAddProduct() {
    if (!newProduct.trim()) return
    addProduct.mutate({ eventId: event.event_id, productName: newProduct.trim() })
    setNewProduct('')
  }

  async function handleDraw() {
    const results = await drawRaffle.mutateAsync(event.event_id)
    // Buscar WhatsApp dos ganhadores
    const userIds = results.map((r) => r.winner_user_id)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, whatsapp')
      .in('user_id', userIds)
    const enriched = results.map((r) => ({
      ...r,
      winner_whatsapp: profiles?.find((p) => p.user_id === r.winner_user_id)?.whatsapp,
    }))
    setDrawResults(enriched)
  }

  function openWhatsApp(phone: string, productName: string) {
    const digits = phone.replace(/\D/g, '')
    const num = digits.startsWith('55') ? digits : `55${digits}`
    const msg = `🎉 Parabéns! Você ganhou *${productName}* no sorteio do evento *${event.event_name}*!\n\nAcesse o app Rider para mais detalhes:\n👉 https://rider-virid.vercel.app`
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const hasWinners = winners && winners.length > 0
  const hasUndrawnProducts = products?.some(
    (p) => !winners?.find((w) => w.raffle_products.product_id === p.product_id)
  )

  if (loadingProducts) return <PageSpinner />

  return (
    <div className="px-4 py-4 space-y-4">
      <Card>
        <h3 className="font-semibold mb-3 text-white">Produtos para Sorteio</h3>

        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Nome do produto"
            value={newProduct}
            onChange={(e) => setNewProduct(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddProduct()}
            className="flex-1"
          />
          <Button size="sm" onClick={handleAddProduct} disabled={addProduct.isPending || !newProduct.trim()}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {products?.length === 0 ? (
          <p className="text-sm text-white/60 text-center py-4">Nenhum produto cadastrado</p>
        ) : (
          <div className="space-y-2">
            {products?.map((product) => {
              const winner = winners?.find((w) => w.raffle_products.product_id === product.product_id)

              return (
                <div key={product.product_id} className="flex items-center gap-2 bg-black/50 border border-primary/20 rounded-xl px-3 py-2">
                  <Gift className="w-4 h-4 text-primary shrink-0" />
                  <span className="flex-1 text-sm">{product.product_name}</span>
                  {winner ? (
                    <Badge variant="success">
                      <Trophy className="w-3 h-3" />
                      {winner.profiles.user_name}
                    </Badge>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeProduct.mutate({ productId: product.product_id, eventId: event.event_id })}
                      aria-label={`Remover produto ${product.product_name}`}
                      className="w-11 h-11 flex items-center justify-center text-white/60 hover:text-error transition-colors"
                    >
                      <Trash2 className="w-5 h-5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {products && products.length > 0 && hasUndrawnProducts && (
        <Button className="w-full" size="lg" onClick={handleDraw} disabled={drawRaffle.isPending}>
          {drawRaffle.isPending ? <Spinner size="sm" /> : (
            <><PartyPopper className="w-5 h-5 mr-2" /> Realizar Sorteio</>
          )}
        </Button>
      )}

      {drawResults && drawResults.length > 0 && (
        <Card className="border-primary/30">
          <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
            <PartyPopper className="w-5 h-5" /> Resultado do Sorteio
          </h3>
          <div className="space-y-2">
            {drawResults.map((result) => (
              <div key={result.product_id} className="flex items-center gap-2 bg-black/50 border border-primary/20 rounded-xl px-3 py-2">
                <Gift className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm flex-1 min-w-0 truncate">{result.product_name}</span>
                <Badge variant="success">
                  <Trophy className="w-3 h-3" />
                  {result.winner_name}
                </Badge>
                {result.winner_whatsapp && (
                  <button
                    type="button"
                    onClick={() => openWhatsApp(result.winner_whatsapp!, result.product_name)}
                    aria-label={`Avisar ${result.winner_name} pelo WhatsApp`}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-success/15 text-success hover:bg-success/25 transition-colors shrink-0"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {hasWinners && !drawResults && (
        <Card>
          <h3 className="font-semibold mb-3 text-white">Sorteios Anteriores</h3>
          <div className="space-y-2">
            {winners?.map((w) => (
              <div key={w.winner_id} className="flex items-center gap-2 bg-black/50 border border-primary/20 rounded-xl px-3 py-2">
                <Trophy className="w-4 h-4 text-success shrink-0" />
                <span className="text-sm flex-1 min-w-0 truncate">{w.raffle_products.product_name}</span>
                <span className="text-sm text-success font-medium shrink-0">{w.profiles.user_name}</span>
                {w.profiles.whatsapp && (
                  <button
                    type="button"
                    onClick={() => openWhatsApp(w.profiles.whatsapp, w.raffle_products.product_name)}
                    aria-label={`Avisar ${w.profiles.user_name} pelo WhatsApp`}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-success/15 text-success hover:bg-success/25 transition-colors shrink-0"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default function RafflePage() {
  const { data: events, isLoading } = useMyEvents()
  const [selected, setSelected] = useState<EventWithCount | null>(null)

  if (isLoading) return <PageSpinner />

  if (selected) {
    return (
      <>
        <TopBar title={`Sorteio - ${selected.event_name}`} showBack />
        <RaffleManager event={selected} />
      </>
    )
  }

  return (
    <>
      <TopBar title="Fazer Sorteio" />
      <div className="px-4 py-3 space-y-3">
        {!events?.length ? (
          <EmptyState
            icon={<Gift className="w-12 h-12" />}
            title="Nenhum evento ativo"
            description="Você precisa ter eventos ativos para fazer sorteios"
          />
        ) : (
          <>
            <p className="text-sm text-white/80">Selecione o evento para o sorteio:</p>
            {events.map((event) => {
              const past = isEventPast(event.event_date!, event.event_end_time || event.event_start_time!)
              return (
                <button
                  key={event.event_id}
                  type="button"
                  onClick={() => setSelected(event)}
                  className="w-full text-left bg-black rounded-2xl border border-primary/30 p-4 transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-black/40 active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white flex-1 truncate">{event.event_name}</h3>
                    {past && <Badge variant="secondary">Evento Realizado</Badge>}
                  </div>
                  <p className="text-sm text-white/80">
                    {formatEventDate(event.event_date)} - {formatTime(event.event_start_time)} | {event.participant_count} participante(s)
                  </p>
                </button>
              )
            })}
          </>
        )}
        <RiderLogo />
      </div>
    </>
  )
}
