'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatCurrency } from '@/lib/utils'
import { FileText, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function ServicosPage() {
  const supabase = createClient()
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('services')
        .select('*, leads(nome, telefone, cidade)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setServices(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const totalFaturado = services.reduce((acc, s) => acc + (s.valor_cobrado || 0), 0)
  const totalServicos = services.length

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-sora font-bold text-2xl text-deep-dark">Serviços</h1>
        <p className="text-muted text-sm mt-1">Histórico de serviços concluídos</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="kpi-card">
          <div className="w-9 h-9 bg-nuvio-blue/10 rounded-xl flex items-center justify-center mb-2">
            <FileText size={16} className="text-nuvio-blue" />
          </div>
          <p className="text-xs text-muted uppercase tracking-wide font-semibold">Total de serviços</p>
          <p className="font-sora font-bold text-3xl text-nuvio-blue">{totalServicos}</p>
        </div>
        <div className="kpi-card">
          <div className="w-9 h-9 bg-success/10 rounded-xl flex items-center justify-center mb-2">
            <TrendingUp size={16} className="text-success" />
          </div>
          <p className="text-xs text-muted uppercase tracking-wide font-semibold">Total faturado</p>
          <p className="font-sora font-bold text-3xl text-success">{formatCurrency(totalFaturado)}</p>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-nuvio-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : services.length === 0 ? (
        <div className="card text-center py-16">
          <FileText size={48} className="mx-auto mb-4 text-muted opacity-30" />
          <p className="font-sora font-semibold text-deep-dark mb-1">Nenhum serviço concluído ainda</p>
          <p className="text-muted text-sm">Os serviços aparecerão aqui após serem concluídos.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="divide-y divide-ice-blue">
            {services.map(svc => (
              <Link key={svc.id} href={`/leads/${svc.lead_id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-ice-blue/30 transition-colors">
                <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-deep-dark">{svc.leads?.nome}</p>
                  <p className="text-xs text-muted capitalize">{svc.tipo_servico} · {svc.leads?.cidade}</p>
                </div>
                <div className="text-right">
                  {svc.valor_cobrado && (
                    <p className="font-sora font-semibold text-success text-sm">{formatCurrency(svc.valor_cobrado)}</p>
                  )}
                  <p className="text-xs text-muted">
                    {svc.data_execucao ? formatDate(svc.data_execucao) : '—'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
