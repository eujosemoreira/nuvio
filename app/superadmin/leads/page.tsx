'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { timeAgo } from '@/lib/utils'
import { LEAD_STATUS_LABEL, LEAD_STATUS_COLOR, LeadStatus } from '@/lib/types'
import { Search } from 'lucide-react'

export default function SuperAdminLeadsPage() {
  const supabase = createClient()
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('leads')
        .select('*, profiles(email), business_settings(nome_fantasia)')
        .order('created_at', { ascending: false })
        .limit(200)
      setLeads(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtrados = leads.filter(l => {
    const q = busca.toLowerCase()
    return !q ||
      l.nome.toLowerCase().includes(q) ||
      (l.cidade || '').toLowerCase().includes(q) ||
      l.status.toLowerCase().includes(q)
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="font-sora font-bold text-2xl text-deep-dark">Todos os Leads</h1>
        <p className="text-muted text-sm mt-1">{leads.length} leads na plataforma</p>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input className="input pl-10" placeholder="Buscar por nome, cidade ou status..."
          value={busca} onChange={e => setBusca(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-nuvio-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-ice-blue/40 border-b border-ice-blue">
            <div className="col-span-3"><span className="label m-0">Cliente</span></div>
            <div className="col-span-3"><span className="label m-0">Instalador</span></div>
            <div className="col-span-2"><span className="label m-0">Cidade</span></div>
            <div className="col-span-2"><span className="label m-0">Status</span></div>
            <div className="col-span-2"><span className="label m-0">Criado</span></div>
          </div>
          <div className="divide-y divide-ice-blue">
            {filtrados.map(lead => (
              <div key={lead.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-3">
                <div className="md:col-span-3 text-sm font-semibold text-deep-dark">{lead.nome}</div>
                <div className="md:col-span-3 text-sm text-muted">{lead.business_settings?.nome_fantasia || lead.profiles?.email || '—'}</div>
                <div className="md:col-span-2 text-sm text-muted">{lead.cidade || '—'}</div>
                <div className="md:col-span-2">
                  <span className={`badge ${LEAD_STATUS_COLOR[lead.status as LeadStatus]}`}>
                    {LEAD_STATUS_LABEL[lead.status as LeadStatus]}
                  </span>
                </div>
                <div className="md:col-span-2 text-xs text-muted">{timeAgo(lead.created_at)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
