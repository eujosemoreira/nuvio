'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { Users, Globe, CreditCard, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

export default function SuperAdminPage() {
  const supabase = createClient()
  const [stats, setStats] = useState({ instaladores: 0, leads: 0, ativas: 0, expiradas: 0, receita: 0 })
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [
        { count: totalInstaladores },
        { count: totalLeads },
        { count: assinaturasAtivas },
        { count: assinaturasExpiradas },
        { data: pagamentos },
        { data: users },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'installer'),
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'expired'),
        supabase.from('payments').select('amount').eq('status', 'approved'),
        supabase.from('profiles').select('*, business_settings(nome_fantasia, cidade, estado), subscriptions(status, trial_ends_at)')
          .eq('role', 'installer')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      const receita = pagamentos?.reduce((acc, p) => acc + (p.amount || 0), 0) || 0

      setStats({
        instaladores: totalInstaladores || 0,
        leads: totalLeads || 0,
        ativas: assinaturasAtivas || 0,
        expiradas: assinaturasExpiradas || 0,
        receita,
      })
      setRecentUsers(users || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-full p-16">
      <div className="w-8 h-8 border-4 border-nuvio-blue border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-sora font-bold text-2xl text-deep-dark">Visão Geral da Plataforma</h1>
        <p className="text-muted text-sm mt-1">Controle total do Nuvio SaaS</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Instaladores', value: stats.instaladores, icon: <Users size={16} className="text-nuvio-blue" />, color: 'text-nuvio-blue', bg: 'bg-nuvio-blue/10' },
          { label: 'Total de Leads', value: stats.leads, icon: <Globe size={16} className="text-sky-blue" />, color: 'text-sky-blue', bg: 'bg-sky-blue/10' },
          { label: 'Assinaturas Ativas', value: stats.ativas, icon: <CheckCircle size={16} className="text-success" />, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Expiradas', value: stats.expiradas, icon: <AlertTriangle size={16} className="text-error" />, color: 'text-error', bg: 'bg-error/10' },
          { label: 'Receita Total', value: formatCurrency(stats.receita), icon: <TrendingUp size={16} className="text-amber" />, color: 'text-amber', bg: 'bg-amber/10', isText: true },
        ].map((kpi, i) => (
          <div key={i} className="kpi-card">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${kpi.bg} mb-2`}>{kpi.icon}</div>
            <p className="text-xs text-muted uppercase tracking-wide font-semibold">{kpi.label}</p>
            <p className={`font-sora font-bold ${kpi.isText ? 'text-xl' : 'text-3xl'} ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Usuários recentes */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sora font-semibold text-deep-dark">Últimos cadastros</h2>
          <a href="/superadmin/users" className="text-nuvio-blue text-xs font-semibold hover:underline">Ver todos →</a>
        </div>
        <div className="divide-y divide-ice-blue">
          {recentUsers.map(user => {
            const sub = user.subscriptions?.[0]
            const biz = user.business_settings?.[0]
            return (
              <a key={user.id} href={`/superadmin/users/${user.id}`}
                className="flex items-center gap-4 py-3 hover:bg-ice-blue/30 -mx-6 px-6 transition-colors">
                <div className="w-10 h-10 bg-nuvio-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="font-sora font-bold text-nuvio-blue">
                    {(biz?.nome_fantasia || user.email || 'U')[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-deep-dark truncate">{biz?.nome_fantasia || '—'}</p>
                  <p className="text-xs text-muted truncate">{user.email}</p>
                </div>
                <span className={`badge ${
                  sub?.status === 'active' ? 'bg-success/10 text-success' :
                  sub?.status === 'trial' ? 'bg-amber/10 text-amber' :
                  'bg-error/10 text-error'
                }`}>
                  {sub?.status || '—'}
                </span>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
