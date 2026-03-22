'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, Globe, CheckCircle, Calendar } from 'lucide-react'

export default function SuperAdminSystemPage() {
  const supabase = createClient()
  const [stats, setStats] = useState({ users: 0, leads: 0, concluidos: 0, agendados: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [
        { count: users },
        { count: leads },
        { count: concluidos },
        { count: agendados },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'installer'),
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('services').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('concluido', false),
      ])
      setStats({ users: users || 0, leads: leads || 0, concluidos: concluidos || 0, agendados: agendados || 0 })
      setLoading(false)
    }
    load()
  }, [])

  const items = [
    { label: 'Total de usuários', value: stats.users, icon: <Users size={20} className="text-nuvio-blue" />, bg: 'bg-nuvio-blue/10' },
    { label: 'Total de leads', value: stats.leads, icon: <Globe size={20} className="text-sky-blue" />, bg: 'bg-sky-blue/10' },
    { label: 'Instalações concluídas', value: stats.concluidos, icon: <CheckCircle size={20} className="text-success" />, bg: 'bg-success/10' },
    { label: 'Instalações agendadas', value: stats.agendados, icon: <Calendar size={20} className="text-amber" />, bg: 'bg-amber/10' },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-sora font-bold text-2xl text-deep-dark">Visão Global do Sistema</h1>
        <p className="text-muted text-sm mt-1">Métricas gerais da plataforma Nuvio</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-nuvio-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {items.map((item, i) => (
            <div key={i} className="card flex items-center gap-5">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${item.bg}`}>
                {item.icon}
              </div>
              <div>
                <p className="text-sm text-muted font-semibold">{item.label}</p>
                <p className="font-sora font-bold text-4xl text-deep-dark">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
