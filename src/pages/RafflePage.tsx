import { useState } from 'react'
import { useMyEvents } from '@/hooks/useEvents'
import {
  useRaffleProducts, useAddRaffleProduct, useRemoveRaffleProduct,
  useDrawRaffle, useRaffleWinners,
} from '@/hooks/useRaffle'
import { TopBar } from '@/components/layout/TopBar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PageSpinner, Spinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { formatEventDate, formatTime } from '@/lib/utils'
import { Gift, Plus, Trash2, Trophy, PartyPopper } from 'lucide-react'
import type { EventWithCount } from '@/types/database'

interface DrawResult {
  product_id: string
  product_name: string
  winner_user_id: string
  winner_name: string
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
    setDrawResults(results)
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
                <Gift className="w-4 h-4 text-primary" />
                <span className="text-sm flex-1">{result.product_name}</span>
                <Badge variant="success">
                  <Trophy className="w-3 h-3" />
                  {result.winner_name}
                </Badge>
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
                <Trophy className="w-4 h-4 text-success" />
                <span className="text-sm flex-1">{w.raffle_products.product_name}</span>
                <span className="text-sm text-success font-medium">{w.profiles.user_name}</span>
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
            {events.map((event) => (
              <Card
                key={event.event_id}
                className="cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => setSelected(event)}
              >
                <h3 className="font-semibold text-white">{event.event_name}</h3>
                <p className="text-sm text-white/80">
                  {formatEventDate(event.event_date)} - {formatTime(event.event_start_time)} | {event.participant_count} participante(s)
                </p>
              </Card>
            ))}
          </>
        )}
      </div>
    </>
  )
}
