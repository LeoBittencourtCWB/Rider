import { format, isToday, isTomorrow, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  if (isToday(date)) return 'Hoje'
  if (isTomorrow(date)) return 'Amanhã'
  return format(date, "dd/MM/yyyy", { locale: ptBR })
}

export function formatDayOfWeek(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return format(date, 'EEEE', { locale: ptBR })
}

export function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5)
}

export function formatCurrency(value: number): string {
  if (value === 0) return 'Gratuito'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function isEventPast(dateStr: string, endTimeStr: string): boolean {
  const dt = new Date(`${dateStr}T${endTimeStr}`)
  return isPast(dt)
}

export function getWhatsAppShareUrl(eventName: string, date: string, time: string, address: string, cost: number): string {
  const costStr = cost === 0 ? 'Gratuito' : `R$ ${cost.toFixed(2)}`
  const msg = `🏍️ Venha para o ${eventName}!\n📅 ${formatEventDate(date)} (${formatDayOfWeek(date)}) às ${formatTime(time)}\n📍 ${address}\n💰 ${costStr}\n\nConfirme presença no Rider!\n👉 https://rider-virid.vercel.app`
  return `https://wa.me/?text=${encodeURIComponent(msg)}`
}

export function getGoogleMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

export function getWazeUrl(address: string): string {
  return `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`
}
