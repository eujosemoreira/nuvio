'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, trialDaysLeft, isSubscriptionActive } from '@/lib/utils'
import { CreditCard, CheckCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react'

export default function BillingPage() {
  const supabase = createClient()
  const [subscription, setSubscription] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)
      const [{ data: sub }, { data: pmts }] = await Promise.all([
        supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
        supabase.from('payments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ])
      setSubscription(sub)
      setPayments(pmts || [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleSubscribe(method: 'pix' | 'card') {
    setPaying(true)
    try {
      const res = await fetch('/api/billing/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, userId: user.id, email: user.email }),
      })
      const data = await res.json()
      if (data.init_point) {
        window.open(data.init_point, '_blank')
      } else if (data.error) {
        alert('Erro ao gerar pagamento: ' + data.error)
      }
    } catch (e) {
      alert('Erro ao conectar com o servidor de pagamento.')
    }
    setPaying(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full p-16">
      <div className="w-8 h-8 border-4 border-nuvio-blue border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const daysLeft = trialDaysLeft(subscription?.trial_ends_at)
  const active = isSubscriptionActive(subscription?.status, subscription?.trial_ends_at)

  const STATUS_CONFIG = {
    trial: { label: `Trial — ${daysLeft} dias restantes`, color: 'text-amber', bg: 'bg-amber/10', icon: <Clock size={18} className="text-amber" /> },
    active: { label: 'Assinatura ativa', color: 'text-success', bg: 'bg-success/10', icon: <CheckCircle size={18} className="text-success" /> },
    expired: { label: 'Assinatura expirada', color: 'text-error', bg: 'bg-error/10', icon: <AlertTriangle size={18} className="text-error" /> },
    cancelled: { label: 'Assinatura cancelada', color: 'text-error', bg: 'bg-error/10', icon: <AlertTriangle size={18} className="text-error" /> },
    blocked: { label: 'Conta bloqueada', color: 'text-error', bg: 'bg-error/10', icon: <AlertTriangle size={18} className="text-error" /> },
  }

  const statusConfig = STATUS_CONFIG[subscription?.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.expired

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-sora font-bold text-2xl text-deep-dark">Assinatura</h1>
        <p className="text-muted text-sm mt-1">Gerencie seu plano Nuvio</p>
      </div>

      {/* Status card */}
      <div className="card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusConfig.bg}`}>
            {statusConfig.icon}
          </div>
          <div>
            <p className="font-sora font-semibold text-deep-dark">Plano Profissional</p>
            <p className={`text-sm font-semibold ${statusConfig.color}`}>{statusConfig.label}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-ice-blue/40 rounded-xl">
          <div>
            <p className="text-xs text-muted uppercase font-semibold tracking-wide">Valor</p>
            <p className="font-sora font-bold text-xl text-deep-dark">R$29<span className="text-muted text-sm font-normal">/mês</span></p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase font-semibold tracking-wide">
              {subscription?.status === 'trial' ? 'Trial até' : subscription?.status === 'active' ? 'Renova em' : 'Expirou em'}
            </p>
            <p className="font-sora font-bold text-xl text-deep-dark">
              {subscription?.trial_ends_at ? formatDate(subscription.trial_ends_at) :
               subscription?.current_period_end ? formatDate(subscription.current_period_end) : '—'}
            </p>
          </div>
        </div>

        {/* Plano features */}
        <div className="space-y-2">
          {['Leads ilimitados', 'Página de captação personalizada', 'Orçamentos profissionais', 'Agendamento online', 'WhatsApp integrado', 'Suporte por WhatsApp'].map(f => (
            <div key={f} className="flex items-center gap-2 text-sm text-muted">
              <CheckCircle size={14} className="text-success flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Assinar / Renovar */}
      {(!active || subscription?.status === 'trial') && (
        <div className="card mb-6 border-nuvio-blue/30 bg-nuvio-blue/3">
          <h2 className="font-sora font-semibold text-deep-dark mb-2">
            {subscription?.status === 'trial' ? 'Assine para continuar após o trial' : 'Renovar assinatura'}
          </h2>
          <p className="text-muted text-sm mb-5">
            Pague R$29/mês via PIX ou cartão de crédito.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSubscribe('pix')}
              disabled={paying}
              className="btn-primary flex items-center justify-center gap-2 py-4"
            >
              {paying ? <Loader2 size={16} className="animate-spin" /> : null}
              Pagar via PIX
            </button>
            <button
              onClick={() => handleSubscribe('card')}
              disabled={paying}
              className="btn-secondary flex items-center justify-center gap-2 py-4"
            >
              <CreditCard size={16} />
              Cartão de crédito
            </button>
          </div>
          <p className="text-xs text-muted text-center mt-3">
            Pagamento seguro via Mercado Pago
          </p>
        </div>
      )}

      {/* Histórico de pagamentos */}
      <div className="card">
        <h2 className="font-sora font-semibold text-deep-dark mb-4">Histórico de pagamentos</h2>
        {payments.length === 0 ? (
          <p className="text-muted text-sm text-center py-6">Nenhum pagamento registrado.</p>
        ) : (
          <div className="divide-y divide-ice-blue">
            {payments.map(pmt => (
              <div key={pmt.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-deep-dark">R$ {pmt.amount?.toFixed(2)}</p>
                  <p className="text-xs text-muted capitalize">{pmt.method === 'pix' ? 'PIX' : 'Cartão'} · {formatDate(pmt.created_at)}</p>
                </div>
                <span className={`badge ${
                  pmt.status === 'approved' ? 'bg-success/10 text-success' :
                  pmt.status === 'pending' ? 'bg-amber/10 text-amber' :
                  'bg-error/10 text-error'
                }`}>
                  {pmt.status === 'approved' ? 'Pago' : pmt.status === 'pending' ? 'Pendente' : 'Falhou'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
