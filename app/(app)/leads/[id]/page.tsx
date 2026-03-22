'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatDate, whatsappLink, agendamentoMessage, timeAgo } from '@/lib/utils'
import { LEAD_STATUS_LABEL, LEAD_STATUS_COLOR, LeadStatus } from '@/lib/types'
import {
  ArrowLeft, MessageCircle, Calendar, FileText,
  CheckCircle, ChevronRight, Loader2, Plus, Edit2
} from 'lucide-react'
import Link from 'next/link'

const STATUS_FLOW: LeadStatus[] = [
  'novo_lead','em_contato','diagnostico','orcamento_enviado',
  'orcamento_aprovado','instalacao_agendada','servico_concluido'
]

export default function LeadDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [lead, setLead] = useState<any>(null)
  const [diagnostic, setDiagnostic] = useState<any>(null)
  const [quote, setQuote] = useState<any>(null)
  const [appointment, setAppointment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Modais
  const [showDiagModal, setShowDiagModal] = useState(false)
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [showAptModal, setShowAptModal] = useState(false)

  // Forms
  const [diagForm, setDiagForm] = useState({ tipo_aparelho: '', capacidade_btu: '', marca: '', ambiente: '', problema_relatado: '', observacoes: '' })
  const [quoteForm, setQuoteForm] = useState({ descricao: '', valor_mao_obra: '', valor_materiais: '', observacoes: '' })
  const [aptForm, setAptForm] = useState({ data_agendada: '', horario: '', endereco: '' })
  const [savingModal, setSavingModal] = useState(false)

  useEffect(() => { loadData() }, [id])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [{ data: l }, { data: d }, { data: q }, { data: a }] = await Promise.all([
      supabase.from('leads').select('*').eq('id', id).eq('user_id', user.id).single(),
      supabase.from('diagnostics').select('*').eq('lead_id', id).maybeSingle(),
      supabase.from('quotes').select('*').eq('lead_id', id).order('created_at', { ascending: false }).maybeSingle(),
      supabase.from('appointments').select('*').eq('lead_id', id).maybeSingle(),
    ])
    if (!l) { router.push('/leads'); return }
    setLead(l)
    setDiagnostic(d)
    setQuote(q)
    setAppointment(a)
    setLoading(false)
  }

  async function updateStatus(newStatus: LeadStatus) {
    setUpdatingStatus(true)
    await supabase.from('leads').update({ status: newStatus }).eq('id', id)
    setLead((prev: any) => ({ ...prev, status: newStatus }))
    setUpdatingStatus(false)
  }

  async function saveDiagnostic() {
    setSavingModal(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (diagnostic) {
      await supabase.from('diagnostics').update(diagForm).eq('id', diagnostic.id)
    } else {
      await supabase.from('diagnostics').insert({ ...diagForm, lead_id: id, user_id: user!.id })
    }
    await updateStatus('diagnostico')
    setShowDiagModal(false)
    setSavingModal(false)
    loadData()
  }

  async function saveQuote() {
    setSavingModal(true)
    const { data: { user } } = await supabase.auth.getUser()
    const total = (parseFloat(quoteForm.valor_mao_obra) || 0) + (parseFloat(quoteForm.valor_materiais) || 0)
    if (quote) {
      await supabase.from('quotes').update({ ...quoteForm, valor_total: total }).eq('id', quote.id)
    } else {
      await supabase.from('quotes').insert({
        ...quoteForm,
        valor_mao_obra: parseFloat(quoteForm.valor_mao_obra) || 0,
        valor_materiais: parseFloat(quoteForm.valor_materiais) || 0,
        valor_total: total,
        lead_id: id, user_id: user!.id
      })
    }
    await updateStatus('orcamento_enviado')
    setShowQuoteModal(false)
    setSavingModal(false)
    loadData()
  }

  async function saveAppointment() {
    setSavingModal(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (appointment) {
      await supabase.from('appointments').update(aptForm).eq('id', appointment.id)
    } else {
      await supabase.from('appointments').insert({ ...aptForm, lead_id: id, user_id: user!.id })
    }
    await updateStatus('instalacao_agendada')
    setShowAptModal(false)
    setSavingModal(false)
    loadData()
  }

  async function concluirServico() {
    if (!confirm('Confirmar conclusão do serviço?')) return
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('services').insert({
      lead_id: id, user_id: user!.id,
      tipo_servico: lead.tipo_servico,
      appointment_id: appointment?.id,
      quote_id: quote?.id,
      valor_cobrado: quote?.valor_total,
      data_execucao: appointment?.data_agendada || new Date().toISOString().split('T')[0],
    })
    await updateStatus('servico_concluido')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full p-16">
      <div className="w-8 h-8 border-4 border-nuvio-blue border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const currentStatusIndex = STATUS_FLOW.indexOf(lead.status)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const scheduleUrl = `${appUrl}/agendar/${lead.id}/${lead.scheduling_token}`

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/leads" className="text-muted hover:text-deep-dark transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-sora font-bold text-2xl text-deep-dark">{lead.nome}</h1>
            <span className={`badge ${LEAD_STATUS_COLOR[lead.status as LeadStatus]}`}>
              {LEAD_STATUS_LABEL[lead.status as LeadStatus]}
            </span>
          </div>
          <p className="text-muted text-sm">{lead.telefone} · {lead.cidade} · criado {timeAgo(lead.created_at)}</p>
        </div>
        <a
          href={whatsappLink(lead.telefone, `Olá ${lead.nome}! 👋`)}
          target="_blank" rel="noreferrer"
          className="btn-teal flex items-center gap-2 text-sm"
        >
          <MessageCircle size={16} />
          WhatsApp
        </a>
      </div>

      {/* Pipeline de status */}
      <div className="card mb-6">
        <h2 className="font-sora font-semibold text-sm text-muted uppercase tracking-wide mb-4">Pipeline</h2>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {STATUS_FLOW.map((s, i) => {
            const isActive = s === lead.status
            const isDone = i < currentStatusIndex
            const isNext = i === currentStatusIndex + 1
            return (
              <div key={s} className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => !isActive && updateStatus(s)}
                  disabled={updatingStatus}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive ? 'bg-nuvio-blue text-white' :
                    isDone ? 'bg-success/10 text-success' :
                    isNext ? 'bg-ice-blue text-nuvio-blue hover:bg-nuvio-blue/10 cursor-pointer' :
                    'bg-gray-100 text-muted cursor-pointer hover:bg-gray-200'
                  }`}
                >
                  {isDone && '✓ '}{LEAD_STATUS_LABEL[s]}
                </button>
                {i < STATUS_FLOW.length - 1 && (
                  <ChevronRight size={14} className="text-muted flex-shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dados do lead */}
        <div className="card">
          <h2 className="font-sora font-semibold text-deep-dark mb-4">Informações</h2>
          <dl className="space-y-3">
            {[
              ['Nome', lead.nome],
              ['Telefone', lead.telefone],
              ['Cidade', lead.cidade || '—'],
              ['Tipo de serviço', lead.tipo_servico],
              ['Origem', lead.origem],
              ['Mensagem', lead.mensagem || '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3">
                <dt className="text-xs font-semibold text-muted uppercase tracking-wide w-28 flex-shrink-0 pt-0.5">{k}</dt>
                <dd className="text-sm text-deep-dark">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Ações */}
        <div className="space-y-4">
          {/* Diagnóstico */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-sora font-semibold text-deep-dark">Diagnóstico</h2>
              <button onClick={() => {
                if (diagnostic) setDiagForm(diagnostic)
                setShowDiagModal(true)
              }} className="text-nuvio-blue text-xs font-semibold flex items-center gap-1 hover:underline">
                <Edit2 size={12} />
                {diagnostic ? 'Editar' : 'Adicionar'}
              </button>
            </div>
            {diagnostic ? (
              <dl className="space-y-2 text-sm">
                {diagnostic.tipo_aparelho && <div className="flex gap-2"><dt className="text-muted w-28">Aparelho</dt><dd>{diagnostic.tipo_aparelho}</dd></div>}
                {diagnostic.capacidade_btu && <div className="flex gap-2"><dt className="text-muted w-28">BTU</dt><dd>{diagnostic.capacidade_btu}</dd></div>}
                {diagnostic.marca && <div className="flex gap-2"><dt className="text-muted w-28">Marca</dt><dd>{diagnostic.marca}</dd></div>}
                {diagnostic.problema_relatado && <div className="flex gap-2"><dt className="text-muted w-28">Problema</dt><dd>{diagnostic.problema_relatado}</dd></div>}
              </dl>
            ) : (
              <p className="text-muted text-sm">Nenhum diagnóstico registrado.</p>
            )}
          </div>

          {/* Orçamento */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-sora font-semibold text-deep-dark">Orçamento</h2>
              <button onClick={() => {
                if (quote) setQuoteForm({ descricao: quote.descricao || '', valor_mao_obra: quote.valor_mao_obra, valor_materiais: quote.valor_materiais, observacoes: quote.observacoes || '' })
                setShowQuoteModal(true)
              }} className="text-nuvio-blue text-xs font-semibold flex items-center gap-1 hover:underline">
                <Edit2 size={12} />
                {quote ? 'Editar' : 'Criar'}
              </button>
            </div>
            {quote ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted">Mão de obra</span><span>R$ {quote.valor_mao_obra?.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted">Materiais</span><span>R$ {quote.valor_materiais?.toFixed(2)}</span></div>
                <div className="flex justify-between font-semibold border-t border-ice-blue pt-2"><span>Total</span><span className="text-nuvio-blue">R$ {quote.valor_total?.toFixed(2)}</span></div>
                {!quote.aprovado && (
                  <button onClick={async () => {
                    await supabase.from('quotes').update({ aprovado: true, aprovado_em: new Date().toISOString() }).eq('id', quote.id)
                    await updateStatus('orcamento_aprovado')
                    loadData()
                  }} className="btn-secondary w-full text-xs py-2 mt-2">
                    ✓ Marcar como aprovado
                  </button>
                )}
                {quote.aprovado && <p className="text-success text-xs font-semibold">✓ Orçamento aprovado</p>}
              </div>
            ) : (
              <p className="text-muted text-sm">Nenhum orçamento criado.</p>
            )}
          </div>

          {/* Agendamento */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-sora font-semibold text-deep-dark">Agendamento</h2>
              <button onClick={() => {
                if (appointment) setAptForm({ data_agendada: appointment.data_agendada, horario: appointment.horario, endereco: appointment.endereco || '' })
                setShowAptModal(true)
              }} className="text-nuvio-blue text-xs font-semibold flex items-center gap-1 hover:underline">
                <Edit2 size={12} />
                {appointment ? 'Editar' : 'Agendar'}
              </button>
            </div>
            {appointment ? (
              <div className="space-y-2 text-sm">
                <div className="flex gap-2"><span className="text-muted w-16">Data</span><span>{formatDate(appointment.data_agendada)}</span></div>
                <div className="flex gap-2"><span className="text-muted w-16">Horário</span><span>{appointment.horario?.slice(0,5)}</span></div>
                <div className="flex gap-2"><span className="text-muted w-16">Local</span><span>{appointment.endereco || '—'}</span></div>
                <a
                  href={whatsappLink(lead.telefone, agendamentoMessage(lead.nome, formatDate(appointment.data_agendada), appointment.horario?.slice(0,5)))}
                  target="_blank" rel="noreferrer"
                  className="btn-secondary w-full text-xs py-2 mt-2 flex items-center justify-center gap-1"
                >
                  <MessageCircle size={12} />
                  Enviar confirmação
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-muted text-sm">Nenhum agendamento.</p>
                <div className="text-xs text-muted">
                  Link para cliente agendar:{' '}
                  <button onClick={() => { navigator.clipboard.writeText(scheduleUrl); alert('Link copiado!') }}
                    className="text-nuvio-blue font-semibold hover:underline">
                    Copiar link
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Concluir */}
          {lead.status === 'instalacao_agendada' && (
            <button onClick={concluirServico} className="btn-primary w-full flex items-center justify-center gap-2 py-4">
              <CheckCircle size={18} />
              Concluir Serviço
            </button>
          )}
        </div>
      </div>

      {/* ─── MODAIS ─── */}
      {/* Modal Diagnóstico */}
      {showDiagModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl2 shadow-xl w-full max-w-lg p-6">
            <h3 className="font-sora font-bold text-lg text-deep-dark mb-4">Diagnóstico</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Tipo de aparelho</label><input className="input" value={diagForm.tipo_aparelho} onChange={e => setDiagForm(p => ({...p, tipo_aparelho: e.target.value}))} placeholder="Split, Janela..." /></div>
                <div><label className="label">BTU</label><input className="input" value={diagForm.capacidade_btu} onChange={e => setDiagForm(p => ({...p, capacidade_btu: e.target.value}))} placeholder="9000, 12000..." /></div>
                <div><label className="label">Marca</label><input className="input" value={diagForm.marca} onChange={e => setDiagForm(p => ({...p, marca: e.target.value}))} placeholder="LG, Samsung..." /></div>
                <div><label className="label">Ambiente</label><input className="input" value={diagForm.ambiente} onChange={e => setDiagForm(p => ({...p, ambiente: e.target.value}))} placeholder="Quarto, Sala..." /></div>
              </div>
              <div><label className="label">Problema relatado</label><textarea className="input resize-none" rows={2} value={diagForm.problema_relatado} onChange={e => setDiagForm(p => ({...p, problema_relatado: e.target.value}))} /></div>
              <div><label className="label">Observações</label><textarea className="input resize-none" rows={2} value={diagForm.observacoes} onChange={e => setDiagForm(p => ({...p, observacoes: e.target.value}))} /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowDiagModal(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={saveDiagnostic} disabled={savingModal} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {savingModal ? <Loader2 size={16} className="animate-spin" /> : null}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Orçamento */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl2 shadow-xl w-full max-w-lg p-6">
            <h3 className="font-sora font-bold text-lg text-deep-dark mb-4">Orçamento</h3>
            <div className="space-y-4">
              <div><label className="label">Descrição</label><textarea className="input resize-none" rows={2} value={quoteForm.descricao} onChange={e => setQuoteForm(p => ({...p, descricao: e.target.value}))} placeholder="Instalação de split 12000 BTU..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Mão de obra (R$)</label><input type="number" className="input" value={quoteForm.valor_mao_obra} onChange={e => setQuoteForm(p => ({...p, valor_mao_obra: e.target.value}))} placeholder="0.00" /></div>
                <div><label className="label">Materiais (R$)</label><input type="number" className="input" value={quoteForm.valor_materiais} onChange={e => setQuoteForm(p => ({...p, valor_materiais: e.target.value}))} placeholder="0.00" /></div>
              </div>
              <div className="bg-ice-blue/60 rounded-xl p-3 text-center">
                <p className="text-xs text-muted">Total</p>
                <p className="font-sora font-bold text-xl text-nuvio-blue">
                  R$ {((parseFloat(quoteForm.valor_mao_obra) || 0) + (parseFloat(quoteForm.valor_materiais) || 0)).toFixed(2)}
                </p>
              </div>
              <div><label className="label">Observações</label><textarea className="input resize-none" rows={2} value={quoteForm.observacoes} onChange={e => setQuoteForm(p => ({...p, observacoes: e.target.value}))} /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowQuoteModal(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={saveQuote} disabled={savingModal} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {savingModal ? <Loader2 size={16} className="animate-spin" /> : null}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Agendamento */}
      {showAptModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl2 shadow-xl w-full max-w-md p-6">
            <h3 className="font-sora font-bold text-lg text-deep-dark mb-4">Agendar Instalação</h3>
            <div className="space-y-4">
              <div><label className="label">Data</label><input type="date" className="input" value={aptForm.data_agendada} onChange={e => setAptForm(p => ({...p, data_agendada: e.target.value}))} /></div>
              <div><label className="label">Horário</label><input type="time" className="input" value={aptForm.horario} onChange={e => setAptForm(p => ({...p, horario: e.target.value}))} /></div>
              <div><label className="label">Endereço</label><input className="input" value={aptForm.endereco} onChange={e => setAptForm(p => ({...p, endereco: e.target.value}))} placeholder="Rua das Flores, 123 - Centro" /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAptModal(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={saveAppointment} disabled={savingModal} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {savingModal ? <Loader2 size={16} className="animate-spin" /> : null}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
