'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { Search, Users } from 'lucide-react'
import Link from 'next/link'

export default function SuperAdminUsersPage() {
  const supabase = createClient()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('profiles')
        .select('*, business_settings(nome_empresa, nome_fantasia, cidade, estado), subscriptions(status, trial_ends_at, current_period_end)')
        .eq('role', 'installer')
        .order('created_at', { ascending: false })
      setUsers(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtrados = users.filter(u => {
    const q = busca.toLowerCase()
    const biz = u.business_settings?.[0]
    return !q ||
      u.email.toLowerCase().includes(q) ||
      (biz?.nome_fantasia || '').toLowerCase().includes(q) ||
      (biz?.cidade || '').toLowerCase().includes(q)
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="font-sora font-bold text-2xl text-deep-dark">Instaladores</h1>
        <p className="text-muted text-sm mt-1">{users.length} instaladores cadastrados</p>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input className="input pl-10" placeholder="Buscar por nome, email ou cidade..." value={busca} onChange={e => setBusca(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-nuvio-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-ice-blue/40 border-b border-ice-blue">
            <div className="col-span-3"><span className="label m-0">Empresa</span></div>
            <div className="col-span-3"><span className="label m-0">Email</span></div>
            <div className="col-span-2"><span className="label m-0">Cidade</span></div>
            <div className="col-span-2"><span className="label m-0">Cadastro</span></div>
            <div className="col-span-2"><span className="label m-0">Assinatura</span></div>
          </div>
          <div className="divide-y divide-ice-blue">
            {filtrados.map(user => {
              const biz = user.business_settings?.[0]
              const sub = user.subscriptions?.[0]
              return (
                <Link key={user.id} href={`/superadmin/users/${user.id}`}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 hover:bg-ice-blue/30 transition-colors">
                  <div className="md:col-span-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-nuvio-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="font-sora font-bold text-nuvio-blue text-xs">
                        {(biz?.nome_fantasia || user.email)[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="font-semibold text-sm text-deep-dark truncate">{biz?.nome_fantasia || '—'}</span>
                  </div>
                  <div className="md:col-span-3 flex items-center text-sm text-muted truncate">{user.email}</div>
                  <div className="md:col-span-2 flex items-center text-sm text-muted">{biz?.cidade || '—'}</div>
                  <div className="md:col-span-2 flex items-center text-xs text-muted">{formatDate(user.created_at)}</div>
                  <div className="md:col-span-2 flex items-center">
                    <span className={`badge ${
                      sub?.status === 'active' ? 'bg-success/10 text-success' :
                      sub?.status === 'trial' ? 'bg-amber/10 text-amber' :
                      'bg-error/10 text-error'
                    }`}>{sub?.status || '—'}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
