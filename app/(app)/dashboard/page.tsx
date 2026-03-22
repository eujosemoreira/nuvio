'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, whatsappLink, lembreteMessage, manutencaoMessage, timeAgo } from '@/lib/utils'
import { LEAD_STATUS_LABEL, LEAD_STATUS_COLOR } from '@/lib/types'
import { Users, Calendar, FileText, CheckCircle, AlertTriangle, Bell, ArrowRight, Plus } from 'lucide-react'
import Link from 'next/link'
import { format, parseISO, differenceInMinutes, differenceInDays } from 'date-fns'

export default function DashboardPage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [business, setBusiness] = useState<any>(null)
  const [stats, setStats] = useState({ novos: 0, contato: 0, orcamentos: 0, agendados: 0, concluidos: 0 })
  const [recentLeads, setRecentLeads] = useState<any[]>([])
  const [todayAppointments, setTodayAppointments] = useState<any[]>([])
  const [manutencaoAlerts, setManutencaoAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)

      const [{ data: biz }, { data: leads }, { data: appointments }, { data: services }] = await Promise.all([
        supabase.from('business_settings').select('*').eq('user_id', user.id).single(),
        supabase.from('leads').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('appointments').select('*, leads(nome, telefone)').eq('user_id', user.id).eq('concluido', false),
        supabase.from('services').select('*, leads(nome, telefone)').eq('user_id', user.id).eq('manutencao_alert_sent', false),
      ])

      setBusiness(biz)

      // Stats
      const s = { novos: 0, contato: 0, orcamentos: 0, agendados: 0, concluidos: 0 }
      leads?.forEach(l => {
        if (l.status === 'novo_lead') s.novos++
        if (l.status === 'em_contato') s.contato++
        if (l.status === 'orcamento_enviado' || l.status === 'orcamento_aprovado') s.orcamentos++
        if (l.status === 'instalacao_agendada') s.agendados++
        if (l.status === 'servico_concluido') s.concluidos++
      })
      setStats(s)
      setRecentLeads(leads?.slice(0, 5) || [])

      // Agendamentos de hoje
      const today = format(new Date(), 'yyyy-MM-dd')
      const todayApts = appointments?.filter(a => a.data_agendada === today) || []
      setTodayAppointments(todayApts)

      // Alertas de manutenção (180+ dias)
      const alertas = services?.filter(s => {
        if (!s.data_execucao) return false
        return differenceInDays(new Date(), parseISO(s.data_execucao)) >= 180
      }) || []
      setManutencaoAlerts(alertas)

      setLoading(false)
    }
    load()
  }, [])

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-nuvio-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-sora font-bold text-2xl text-deep-dark">
            {saudacao}, {business?.nome_fantasia || 'Instalador'} 👋
          </h1>
          <p className="text-muted text-sm mt-1">Aqui está o resumo do seu negócio</p>
        </div>
        <Link href="/leads/novo" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} />
          Novo Lead
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Novos Leads', value: stats.novos, color: 'text-sky-blue', bg: 'bg-sky-blue/10' },
          { label: 'Em Contato', value: stats.contato, color: 'text-amber', bg: 'bg-amber/10' },
          { label: 'Orçamentos', value: stats.orcamentos, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Agendados', value: stats.agendados, color: 'text-nuvio-blue', bg: 'bg-nuvio-blue/10' },
          { label: 'Concluídos', value: stats.concluidos, color: 'text-success', bg: 'bg-success/10' },
        ].map((kpi, i) => (
          <div key={i} className="kpi-card">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${kpi.bg} mb-2`}>
              <Users size={16} className={kpi.color} />
            </div>
            <p className="text-xs text-muted uppercase tracking-wide font-semibold">{kpi.label}</p>
            <p className={`font-sora font-bold text-3xl ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Alertas */}
      {(todayAppointments.length > 0 || manutencaoAlerts.length > 0) && (
        <div className="space-y-3 mb-8">
          {/* Instalações hoje */}
          {todayAppointments.map(apt => {
            const [h, m] = apt.horario.split(':').map(Number)
            const aptDate = new Date()
            aptDate.setHours(h, m, 0, 0)
            const diffMin = differenceInMinutes(aptDate, new Date())
            const isUrgent = diffMin >= 0 && diffMin <= 120

            return (
              <div key={apt.id} className={`flex items-center justify-between p-4 rounded-xl border ${
                isUrgent ? 'bg-amber/5 border-amber/30' : 'bg-nuvio-blue/5 border-nuvio-blue/20'
              }`}>
                <div className="flex items-center gap-3">
                  <Bell size={18} className={isUrgent ? 'text-amber' : 'text-nuvio-blue'} />
                  <div>
                    <p className="text-sm font-semibold text-deep-dark">
                      {isUrgent ? '⚡ Instalação em breve!' : '📅 Instalação hoje'}
                    </p>
                    <p className="text-xs text-muted">
                      {apt.leads?.nome} — {apt.horario.slice(0, 5)}
                    </p>
                  </div>
                </div>
                <a
                  href={whatsappLink(apt.leads?.telefone || '', lembreteMessage(apt.leads?.nome || ''))}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-teal text-xs py-2 px-4"
                >
                  Enviar lembrete
                </a>
              </div>
            )
          })}

          {/* Manutenção preventiva */}
          {manutencaoAlerts.map(svc => (
            <div key={svc.id} className="flex items-center justify-between p-4 rounded-xl border bg-teal/5 border-teal/30">
              <div className="flex items-center gap-3">
                <AlertTriangle size={18} className="text-teal" />
                <div>
                  <p className="text-sm font-semibold text-deep-dark">Manutenção preventiva</p>
                  <p className="text-xs text-muted">{svc.leads?.nome} — 180 dias desde a instalação</p>
                </div>
              </div>
              <a
                href={whatsappLink(svc.leads?.telefone || '', manutencaoMessage(svc.leads?.nome || ''))}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary text-xs py-2 px-4"
              >
                Enviar mensagem
              </a>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Leads recentes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sora font-semibold text-deep-dark">Leads recentes</h2>
            <Link href="/leads" className="text-nuvio-blue text-xs font-semibold flex items-center gap-1 hover:underline">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <div className="text-center py-8 text-muted text-sm">
              <Users size={32} className="mx-auto mb-2 opacity-30" />
              <p>Nenhum lead ainda.</p>
              <Link href="/leads/novo" className="text-nuvio-blue font-semibold hover:underline">
                Adicionar primeiro lead →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLeads.map(lead => (
                <Link key={lead.id} href={`/leads/${lead.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-ice-blue/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-nuvio-blue/10 rounded-xl flex items-center justify-center">
                      <span className="font-sora font-bold text-nuvio-blue text-sm">
                        {lead.nome[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-deep-dark">{lead.nome}</p>
                      <p className="text-xs text-muted">{timeAgo(lead.created_at)}</p>
                    </div>
                  </div>
                  <span className={`badge ${LEAD_STATUS_COLOR[lead.status as keyof typeof LEAD_STATUS_COLOR]}`}>
                    {LEAD_STATUS_LABEL[lead.status as keyof typeof LEAD_STATUS_LABEL]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Agenda hoje */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sora font-semibold text-deep-dark">
              Agenda hoje — {format(new Date(), 'dd/MM')}
            </h2>
            <Link href="/agenda" className="text-nuvio-blue text-xs font-semibold flex items-center gap-1 hover:underline">
              Ver agenda <ArrowRight size={12} />
            </Link>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted text-sm">
              <Calendar size={32} className="mx-auto mb-2 opacity-30" />
              <p>Nenhuma instalação agendada para hoje.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map(apt => (
                <div key={apt.id} className="flex items-start gap-3 p-3 rounded-xl bg-ice-blue/40">
                  <div className="text-right min-w-[48px]">
                    <p className="font-sora font-bold text-nuvio-blue text-sm">{apt.horario.slice(0, 5)}</p>
                  </div>
                  <div className="flex-1 border-l-2 border-nuvio-blue pl-3">
                    <p className="text-sm font-semibold text-deep-dark">{apt.leads?.nome}</p>
                    <p className="text-xs text-muted">{apt.endereco || 'Endereço não informado'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
