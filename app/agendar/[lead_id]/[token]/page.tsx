'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatDate, agendamentoMessage } from '@/lib/utils'
import { Calendar, Clock, CheckCircle, Loader2, MessageCircle } from 'lucide-react'
import { format, addDays, isBefore, startOfTomorrow } from 'date-fns'

const HORARIOS = ['08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00','18:00']

export default function AgendarPage() {
  const { lead_id, token } = useParams()
  const supabase = createClient()
  const [lead, setLead] = useState<any>(null)
  const [business, setBusiness] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [confirmado, setConfirmado] = useState(false)
  const [dataSelecionada, setDataSelecionada] = useState('')
  const [horarioSelecionado, setHorarioSelecionado] = useState('')

  useEffect(() => {
    async function load() {
      const { data: l } = await supabase
        .from('leads')
        .select('*, business_settings(*)')
        .eq('id', lead_id)
        .eq('scheduling_token', token)
        .single()
      if (!l) { setLoading(false); return }
      setLead(l)
      setBusiness(l.business_settings)
      setLoading(false)
    }
    load()
  }, [])

  // Próximos 14 dias
  const diasDisponiveis = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(startOfTomorrow(), i)
    const dayOfWeek = d.getDay()
    if (dayOfWeek === 0) return null // Domingo bloqueado
    return d
  }).filter(Boolean) as Date[]

  async function handleConfirm() {
    if (!dataSelecionada || !horarioSelecionado) return
    setSaving(true)

    const { data: existingApt } = await supabase
      .from('appointments')
      .select('id')
      .eq('lead_id', lead_id)
      .maybeSingle()

    if (existingApt) {
      await supabase.from('appointments').update({
        data_agendada: dataSelecionada,
        horario: horarioSelecionado,
      }).eq('id', existingApt.id)
    } else {
      await supabase.from('appointments').insert({
        lead_id,
        user_id: lead.user_id,
        data_agendada: dataSelecionada,
        horario: horarioSelecionado,
      })
    }

    await supabase.from('leads').update({ status: 'instalacao_agendada' }).eq('id', lead_id)
    setConfirmado(true)
    setSaving(false)
  }

  const primary = business?.cor_primaria || '#1C5FD9'

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-nuvio-blue border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!lead) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h2 className="font-sora font-bold text-xl text-deep-dark mb-2">Link inválido</h2>
        <p className="text-muted">Este link de agendamento não é válido ou expirou.</p>
      </div>
    </div>
  )

  if (confirmado) {
    const waMsg = agendamentoMessage(lead.nome, formatDate(dataSelecionada), horarioSelecionado)
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: `${primary}08` }}>
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <CheckCircle size={56} className="mx-auto mb-4" style={{ color: primary }} />
          <h2 className="font-sora font-bold text-2xl text-deep-dark mb-3">Agendado com sucesso! 🎉</h2>
          <div className="bg-ice-blue rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex gap-2 text-sm"><Calendar size={16} className="text-nuvio-blue mt-0.5" /><div><p className="font-semibold">Data</p><p className="text-muted">{formatDate(dataSelecionada)}</p></div></div>
            <div className="flex gap-2 text-sm"><Clock size={16} className="text-nuvio-blue mt-0.5" /><div><p className="font-semibold">Horário</p><p className="text-muted">{horarioSelecionado}</p></div></div>
          </div>
          <p className="text-muted text-sm mb-4">
            O instalador entrará em contato para confirmar. Você também receberá um lembrete no dia da instalação.
          </p>
          {business?.telefone && (
            <a href={`https://wa.me/55${business.telefone.replace(/\D/g,'')}`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity">
              <MessageCircle size={18} />
              Falar com o instalador
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen font-dm" style={{ backgroundColor: `${primary}08` }}>
      {/* Header */}
      <div style={{ backgroundColor: primary }} className="py-5 px-4">
        <div className="max-w-lg mx-auto text-white">
          <p className="text-white/70 text-sm">Agendamento de instalação</p>
          <h1 className="font-sora font-bold text-xl">{business?.nome_fantasia || 'Instalador'}</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="font-sora font-bold text-xl text-deep-dark mb-1">Olá, {lead.nome}!</h2>
          <p className="text-muted text-sm mb-6">Escolha a melhor data e horário para sua instalação.</p>

          {/* Selecionar data */}
          <div className="mb-6">
            <label className="label flex items-center gap-2 mb-3">
              <Calendar size={14} />
              Selecione a data
            </label>
            <div className="grid grid-cols-4 gap-2">
              {diasDisponiveis.map(dia => {
                const str = format(dia, 'yyyy-MM-dd')
                const isSelected = dataSelecionada === str
                return (
                  <button key={str} onClick={() => setDataSelecionada(str)} type="button"
                    className={`p-2 rounded-xl text-center transition-all border-2 ${
                      isSelected ? 'border-transparent text-white' : 'border-gray-100 text-muted hover:border-gray-300'
                    }`}
                    style={isSelected ? { backgroundColor: primary, borderColor: primary } : {}}>
                    <p className="text-xs font-semibold uppercase">{format(dia, 'EEE', { locale: undefined }).slice(0,3)}</p>
                    <p className="font-sora font-bold text-lg leading-none">{format(dia, 'd')}</p>
                    <p className="text-xs">{format(dia, 'MMM')}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selecionar horário */}
          {dataSelecionada && (
            <div className="mb-6">
              <label className="label flex items-center gap-2 mb-3">
                <Clock size={14} />
                Selecione o horário
              </label>
              <div className="grid grid-cols-4 gap-2">
                {HORARIOS.map(h => {
                  const isSelected = horarioSelecionado === h
                  return (
                    <button key={h} onClick={() => setHorarioSelecionado(h)} type="button"
                      className={`py-2.5 rounded-xl text-sm font-semibold transition-all border-2 ${
                        isSelected ? 'text-white border-transparent' : 'text-muted border-gray-100 hover:border-gray-300'
                      }`}
                      style={isSelected ? { backgroundColor: primary, borderColor: primary } : {}}>
                      {h}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Confirmar */}
          <button
            onClick={handleConfirm}
            disabled={!dataSelecionada || !horarioSelecionado || saving}
            className="w-full py-4 rounded-xl text-white font-sora font-semibold text-base
                       flex items-center justify-center gap-2 transition-opacity
                       disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
            style={{ backgroundColor: primary }}
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
            {saving ? 'Confirmando...' : 'Confirmar agendamento'}
          </button>
        </div>
      </div>
    </div>
  )
}
