'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { format, addDays, startOfWeek, parseISO, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function AgendaPage() {
  const supabase = createClient()
  const [appointments, setAppointments] = useState<any[]>([])
  const [semanaAtual, setSemanaAtual] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('appointments')
        .select('*, leads(id, nome, telefone, tipo_servico)')
        .eq('user_id', user.id)
        .order('horario')
      setAppointments(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const inicioSemana = startOfWeek(semanaAtual, { weekStartsOn: 1 })
  const diasSemana = Array.from({ length: 7 }, (_, i) => addDays(inicioSemana, i))

  const hoje = new Date()

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-sora font-bold text-2xl text-deep-dark">Agenda</h1>
          <p className="text-muted text-sm mt-1">Visualize seus agendamentos</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSemanaAtual(d => addDays(d, -7))}
            className="w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:border-nuvio-blue transition-colors">
            <ChevronLeft size={18} className="text-muted" />
          </button>
          <button onClick={() => setSemanaAtual(new Date())}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold hover:border-nuvio-blue transition-colors">
            Hoje
          </button>
          <button onClick={() => setSemanaAtual(d => addDays(d, 7))}
            className="w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:border-nuvio-blue transition-colors">
            <ChevronRight size={18} className="text-muted" />
          </button>
        </div>
      </div>

      {/* Grade semanal */}
      <div className="card p-0 overflow-hidden">
        {/* Cabeçalho dias */}
        <div className="grid grid-cols-7 border-b border-ice-blue">
          {diasSemana.map((dia, i) => {
            const isHoje = isSameDay(dia, hoje)
            const aptsNoDia = appointments.filter(a => isSameDay(parseISO(a.data_agendada), dia))
            return (
              <div key={i} className={`p-3 text-center border-r border-ice-blue last:border-r-0 ${isHoje ? 'bg-nuvio-blue/5' : ''}`}>
                <p className="text-xs text-muted uppercase font-semibold">
                  {format(dia, 'EEE', { locale: ptBR })}
                </p>
                <p className={`font-sora font-bold text-xl mt-1 ${isHoje ? 'text-nuvio-blue' : 'text-deep-dark'}`}>
                  {format(dia, 'd')}
                </p>
                {aptsNoDia.length > 0 && (
                  <div className="flex justify-center mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-nuvio-blue" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Agendamentos por dia */}
        <div className="grid grid-cols-7 min-h-[400px]">
          {diasSemana.map((dia, i) => {
            const isHoje = isSameDay(dia, hoje)
            const aptsNoDia = appointments
              .filter(a => isSameDay(parseISO(a.data_agendada), dia))
              .sort((a, b) => a.horario.localeCompare(b.horario))

            return (
              <div key={i} className={`p-2 border-r border-ice-blue last:border-r-0 space-y-2 ${isHoje ? 'bg-nuvio-blue/3' : ''}`}>
                {aptsNoDia.map(apt => (
                  <Link key={apt.id} href={`/leads/${apt.lead_id}`}
                    className="block bg-nuvio-blue text-white rounded-xl p-2 hover:bg-sky-blue transition-colors">
                    <p className="text-xs font-bold">{apt.horario?.slice(0,5)}</p>
                    <p className="text-xs opacity-90 truncate">{apt.leads?.nome}</p>
                    <p className="text-xs opacity-70 capitalize">{apt.leads?.tipo_servico}</p>
                  </Link>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* Lista detalhada */}
      <div className="mt-8">
        <h2 className="font-sora font-semibold text-deep-dark mb-4">Próximos agendamentos</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-4 border-nuvio-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : appointments.filter(a => parseISO(a.data_agendada) >= hoje).length === 0 ? (
          <div className="card text-center py-12">
            <Calendar size={40} className="mx-auto mb-3 text-muted opacity-30" />
            <p className="text-muted text-sm">Nenhum agendamento futuro.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments
              .filter(a => parseISO(a.data_agendada) >= hoje)
              .slice(0, 10)
              .map(apt => (
                <Link key={apt.id} href={`/leads/${apt.lead_id}`}
                  className="card flex items-center gap-4 hover:shadow-card-hover transition-shadow">
                  <div className="text-center min-w-[56px] bg-nuvio-blue/10 rounded-xl p-2">
                    <p className="font-sora font-bold text-nuvio-blue text-lg leading-none">
                      {format(parseISO(apt.data_agendada), 'd')}
                    </p>
                    <p className="text-xs text-muted uppercase">
                      {format(parseISO(apt.data_agendada), 'MMM', { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-deep-dark">{apt.leads?.nome}</p>
                    <p className="text-sm text-muted">{apt.horario?.slice(0,5)} · {apt.endereco || 'Endereço não informado'}</p>
                  </div>
                  <div className="text-xs text-muted capitalize bg-ice-blue px-3 py-1 rounded-full">
                    {apt.leads?.tipo_servico}
                  </div>
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
