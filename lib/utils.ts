import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Combina classes Tailwind com segurança
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formata data para exibição
export function formatDate(date: string | Date, pattern = 'dd/MM/yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, pattern, { locale: ptBR })
}

// Formata tempo relativo (ex: "há 2 horas")
export function timeAgo(date: string | Date) {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { locale: ptBR, addSuffix: true })
}

// Formata moeda brasileira
export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// Formata telefone para WhatsApp link
export function whatsappLink(phone: string, message: string) {
  const cleaned = phone.replace(/\D/g, '')
  const encoded = encodeURIComponent(message)
  return `https://wa.me/55${cleaned}?text=${encoded}`
}

// Gera mensagem de confirmação de agendamento
export function agendamentoMessage(nome: string, data: string, horario: string) {
  return `Olá ${nome} 👋

Recebi seu agendamento para instalação do ar-condicionado.

📅 Data: ${data}
🕐 Horário: ${horario}

Está tudo confirmado! ✅

No dia da instalação entrarei em contato antes de chegar.`
}

// Gera mensagem de lembrete no dia
export function lembreteMessage(nome: string) {
  return `Olá ${nome} 👋

Confirmando que sua instalação será realizada hoje! 🔧

Em breve estarei a caminho. Qualquer dúvida é só chamar aqui.`
}

// Gera mensagem de manutenção preventiva
export function manutencaoMessage(nome: string) {
  return `Olá ${nome} 👋

Passando para lembrar que já faz 6 meses desde a instalação do seu ar-condicionado! 🌡️

É hora de fazer a limpeza preventiva para garantir o melhor desempenho e economizar energia.

Podemos agendar uma visita? 😊`
}

// Dias restantes do trial
export function trialDaysLeft(trialEndsAt: string | null): number {
  if (!trialEndsAt) return 0
  return Math.max(0, differenceInDays(parseISO(trialEndsAt), new Date()))
}

// Verifica se assinatura está ativa
export function isSubscriptionActive(status: string, trialEndsAt: string | null): boolean {
  if (status === 'active') return true
  if (status === 'trial' && trialEndsAt) {
    return differenceInDays(parseISO(trialEndsAt), new Date()) >= 0
  }
  return false
}
