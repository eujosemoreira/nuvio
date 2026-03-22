'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { timeAgo } from '@/lib/utils'
import { LEAD_STATUS_LABEL, LEAD_STATUS_COLOR, LeadStatus } from '@/lib/types'
import { Plus, Search, Filter, Users } from 'lucide-react'
import Link from 'next/link'

const TODOS_STATUS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'novo_lead', label: 'Novo Lead' },
  { value: 'em_contato', label: 'Em Contato' },
  { value: 'diagnostico', label: 'Diagnóstico' },
  { value: 'orcamento_enviado', label: 'Orçamento Enviado' },
  { value: 'orcamento_aprovado', label: 'Orçamento Aprovado' },
  { value: 'instalacao_agendada', label: 'Agendado' },
  { value: 'servico_concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
]

export default function LeadsPage() {
  const supabase = createClient()
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setLeads(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtrados = leads.filter(l => {
    const matchBusca = !busca ||
      l.nome.toLowerCase().includes(busca.toLowerCase()) ||
      l.telefone.includes(busca) ||
      (l.cidade || '').toLowerCase().includes(busca.toLowerCase())
    const matchStatus = !filtroStatus || l.status === filtroStatus
    return matchBusca && matchStatus
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-sora font-bold text-2xl text-deep-dark">Leads</h1>
          <p className="text-muted text-sm mt-1">{leads.length} lead{leads.length !== 1 ? 's' : ''} no total</p>
        </div>
        <Link href="/leads/novo" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} />
          Novo Lead
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-10"
            placeholder="Buscar por nome, telefone ou cidade..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted flex-shrink-0" />
          <select
            className="input w-auto"
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value)}
          >
            {TODOS_STATUS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {TODOS_STATUS.slice(0, 5).map(s => {
          const count = leads.filter(l => !s.value || l.status === s.value).length
          return (
            <button
              key={s.value}
              onClick={() => setFiltroStatus(s.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                filtroStatus === s.value
                  ? 'bg-nuvio-blue text-white'
                  : 'bg-white text-muted border border-gray-200 hover:border-nuvio-blue hover:text-nuvio-blue'
              }`}
            >
              {s.label} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
            </button>
          )
        })}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-nuvio-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="card text-center py-16">
          <Users size={48} className="mx-auto mb-4 text-muted opacity-30" />
          <p className="font-sora font-semibold text-deep-dark mb-1">Nenhum lead encontrado</p>
          <p className="text-muted text-sm mb-4">
            {busca || filtroStatus ? 'Tente ajustar os filtros.' : 'Comece adicionando seu primeiro lead.'}
          </p>
          {!busca && !filtroStatus && (
            <Link href="/leads/novo" className="btn-primary text-sm">
              Adicionar lead
            </Link>
          )}
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          {/* Cabeçalho da tabela */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-ice-blue/40 border-b border-ice-blue">
            <div className="col-span-3"><span className="label m-0">Cliente</span></div>
            <div className="col-span-2"><span className="label m-0">Telefone</span></div>
            <div className="col-span-2"><span className="label m-0">Cidade</span></div>
            <div className="col-span-2"><span className="label m-0">Serviço</span></div>
            <div className="col-span-2"><span className="label m-0">Status</span></div>
            <div className="col-span-1"><span className="label m-0">Criado</span></div>
          </div>

          <div className="divide-y divide-ice-blue">
            {filtrados.map(lead => (
              <Link
                key={lead.id}
                href={`/leads/${lead.id}`}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 hover:bg-ice-blue/30 transition-colors cursor-pointer"
              >
                <div className="md:col-span-3 flex items-center gap-3">
                  <div className="w-9 h-9 bg-nuvio-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="font-sora font-bold text-nuvio-blue text-sm">{lead.nome[0].toUpperCase()}</span>
                  </div>
                  <span className="font-semibold text-sm text-deep-dark">{lead.nome}</span>
                </div>
                <div className="md:col-span-2 flex items-center text-sm text-muted">{lead.telefone}</div>
                <div className="md:col-span-2 flex items-center text-sm text-muted">{lead.cidade || '—'}</div>
                <div className="md:col-span-2 flex items-center text-sm text-muted capitalize">{lead.tipo_servico}</div>
                <div className="md:col-span-2 flex items-center">
                  <span className={`badge ${LEAD_STATUS_COLOR[lead.status as LeadStatus]}`}>
                    {LEAD_STATUS_LABEL[lead.status as LeadStatus]}
                  </span>
                </div>
                <div className="md:col-span-1 flex items-center text-xs text-muted">
                  {timeAgo(lead.created_at)}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
