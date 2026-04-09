import { useState } from 'react'
import { useContact } from '@/hooks/useContact'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { Send, MessageCircle } from 'lucide-react'

export default function ContactPage() {
  const [message, setMessage] = useState('')
  const contact = useContact()

  async function handleSend() {
    if (!message.trim()) return
    await contact.mutateAsync(message.trim())
    setMessage('')
  }

  return (
    <>
      <TopBar title="Entrar em Contato" />

      <div className="px-4 py-5 space-y-5">
        <div className="flex items-start gap-4 bg-surface rounded-2xl border border-border p-5">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Fale Conosco</h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Descreva o assunto que deseja relatar. Sua mensagem será enviada para nossa equipe.
            </p>
          </div>
        </div>

        <Textarea
          id="message"
          label="Sua Mensagem"
          placeholder="Descreva o assunto aqui..."
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <Button
          className="w-full"
          size="lg"
          onClick={handleSend}
          disabled={contact.isPending || !message.trim()}
        >
          {contact.isPending ? (
            <Spinner size="sm" />
          ) : (
            <><Send className="w-4 h-4" /> Enviar Mensagem</>
          )}
        </Button>
      </div>
    </>
  )
}
