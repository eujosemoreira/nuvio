'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatCurrency } from '@/lib/utils'
import { ArrowLeft, CheckCircle, XCircle, Plus, Ban, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function SuperAdminUserDetailPage() {
  const { id } = useParams()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [business, setBusiness] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [leadCount, setLeadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { load() }, [id])

  async function load() {
    const [{ data: p }, { data: biz }, { data: sub }, { data: pmts }, { count: leads }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('business_settings').select('*').eq('user_id', id).single(),
      supabase.from('subscriptions').select('*').eq('user_id', id).single(),
      supabase.from('payments').select('*').eq('user_id', id).order('created_at', { ascending: false }),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('user_id', id),
    ])
    setUser(p)
    setBusiness(biz)
    setSubscription(sub)
    setPayments(pmts || [])
    setLeadCount(leads || 0)
    setLoading(false)
  }

  async function action(tipo: string) {
    setSaving(true)
    setMsg('')
    const now = new Date()

    if (tipo === 'ativar') {
      const end = new Date(now); end.setDate(end.getDate() + 30)
      await supabase.from('subscriptions').update({ status: 'active', current_period_start: now.toISOString(), current_period_end: end.toISOString() }).eq('user_id', id)
      setMsg('✓ Assinatura ativada por 30 dias.')
    } else if (tipo === 'desativar') {
      await supabase.from('subscriptions').update({ status: 'expired' }).eq('user_id', id)
      setMsg('✓ Assinatura desativada.')
    } else if (tipo === 'bloquear') {
      await supabase.from('subscriptions').update({ status: 'blocked' }).eq('user_id', id)
      setMsg('✓ Conta bloqueada.')
    } else if (tipo === 'extender30') {
      const base = subscription?.current_period_end ? new Date(subscription.current_period_end) : now
      const newEnd = new Date(base); newEnd.setDate(newEnd.getDate() + 30)
      await supabase.from('subscriptions').update({ current_period_end: newEnd.toISOString(), status: 'active' }).eq('user_id', id)
      setMsg('✓ Plano estendido por 30 dias.')
    }

    setSaving(false)
    load()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full p-16">
      <div className="w-8 h-8 border-4 border-nuvio-blue border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/superadmin/users" className="text-muted hover:text-deep-dark transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-sora font-bold text-2xl text-deep-dark">
            {business?.nome_fantasia || user?.email}
          </h1>
          <p className="text-muted text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Dados */}
        <div className="card">
          <h2 className="font-sora font-semibold text-deep-dark mb-4">Dados da empresa</h2>
          <dl className="space-y-2 text-sm">
            {[
              ['Nome empresa', business?.nome_empresa || '—'],
              ['Nome fantasia', business?.nome_fantasia || '—'],
              ['Telefone', business?.telefone || '—'],
              ['Cidade', `${business?.cidade || '—'}, ${business?.estado || '—'}`],
              ['Total de leads', leadCount],
              ['Cadastro em', formatDate(user?.created_at)],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3">
                <dt className="text-muted w-32 flex-shrink-0">{k}</dt>
                <dd className="font-semibold text-deep-dark">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Assinatura */}
        <div className="card">
          <h2 className="font-sora font-semibold text-deep-dark mb-4">Assinatura</h2>
          <dl className="space-y-2 text-sm mb-4">
            <div className="flex gap-3">
              <dt className="text-muted w-32">Status</dt>
              <dd>
                <span className={`badge ${
                  subscription?.status === 'active' ? 'bg-success/10 text-success' :
                  subscription?.status === 'trial' ? 'bg-amber/10 text-amber' :
                  'bg-error/10 text-error'
                }`}>{subscription?.status}</span>
              </dd>
            </div>
            {subscription?.trial_ends_at && (
              <div className="flex gap-3"><dt className="text-muted w-32">Trial até</dt><dd>{formatDate(subscription.trial_ends_at)}</dd></div>
            )}
            {subscription?.current_period_end && (
              <div className="flex gap-3"><dt className="text-muted w-32">Expira em</dt><dd>{formatDate(subscription.current_period_end)}</dd></div>
            )}
          </dl>

          {msg && <p className="text-success text-xs font-semibold mb-3">{msg}</p>}

          {/* Ações */}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => action('ativar')} disabled={saving}
              className="flex items-center justify-center gap-1.5 bg-success/10 text-success text-xs font-semibold py-2.5 rounded-xl hover:bg-success/20 transition-colors">
              <CheckCircle size={14} />
              Ativar 30 dias
            </button>
            <button onClick={() => action('extender30')} disabled={saving}
              className="flex items-center justify-center gap-1.5 bg-nuvio-blue/10 text-nuvio-blue text-xs font-semibold py-2.5 rounded-xl hover:bg-nuvio-blue/20 transition-colors">
              <Plus size={14} />
              +30 dias
            </button>
            <button onClick={() => action('desativar')} disabled={saving}
              className="flex items-center justify-center gap-1.5 bg-amber/10 text-amber text-xs font-semibold py-2.5 rounded-xl hover:bg-amber/20 transition-colors">
              <XCircle size={14} />
              Desativar
            </button>
            <button onClick={() => action('bloquear')} disabled={saving}
              className="flex items-center justify-center gap-1.5 bg-error/10 text-error text-xs font-semibold py-2.5 rounded-xl hover:bg-error/20 transition-colors">
              <Ban size={14} />
              Bloquear
            </button>
          </div>
        </div>
      </div>

      {/* Pagamentos */}
      <div className="card">
        <h2 className="font-sora font-semibold text-deep-dark mb-4">Histórico de pagamentos</h2>
        {payments.length === 0 ? (
          <p className="text-muted text-sm text-center py-4">Nenhum pagamento.</p>
        ) : (
          <div className="divide-y divide-ice-blue">
            {payments.map(pmt => (
              <div key={pmt.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold">{formatCurrency(pmt.amount)}</p>
                  <p className="text-xs text-muted">{pmt.method === 'pix' ? 'PIX' : 'Cartão'} · {formatDate(pmt.created_at)}</p>
                </div>
                <span className={`badge ${pmt.status === 'approved' ? 'bg-success/10 text-success' : pmt.status === 'pending' ? 'bg-amber/10 text-amber' : 'bg-error/10 text-error'}`}>
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
