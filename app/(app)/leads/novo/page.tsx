'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function NovoLeadPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({
    nome: '', telefone: '', cidade: '', estado: '',
    tipo_servico: 'instalacao', mensagem: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase.from('leads').insert({
      ...form,
      user_id: user.id,
      origem: 'manual',
      status: 'novo_lead',
    }).select().single()

    if (error) { setErro('Erro ao salvar lead.'); setLoading(false); return }
    router.push(`/leads/${data.id}`)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/leads" className="text-muted hover:text-deep-dark transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-sora font-bold text-2xl text-deep-dark">Novo Lead</h1>
          <p className="text-muted text-sm">Adicionar cliente manualmente</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Nome completo *</label>
              <input name="nome" className="input" placeholder="João da Silva" value={form.nome} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">WhatsApp *</label>
              <input name="telefone" className="input" placeholder="(11) 99999-9999" value={form.telefone} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Tipo de serviço</label>
              <select name="tipo_servico" className="input" value={form.tipo_servico} onChange={handleChange}>
                <option value="instalacao">Instalação</option>
                <option value="manutencao">Manutenção</option>
                <option value="higienizacao">Higienização</option>
                <option value="orcamento">Orçamento</option>
                <option value="outros">Outros</option>
              </select>
            </div>
            <div>
              <label className="label">Cidade</label>
              <input name="cidade" className="input" placeholder="São Paulo" value={form.cidade} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Estado</label>
              <input name="estado" className="input" placeholder="SP" value={form.estado} onChange={handleChange} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Observações</label>
              <textarea name="mensagem" className="input min-h-[100px] resize-none" placeholder="Detalhes do pedido..." value={form.mensagem} onChange={handleChange} />
            </div>
          </div>

          {erro && <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-xl">{erro}</div>}

          <div className="flex gap-3">
            <Link href="/leads" className="btn-secondary flex-1 text-center py-3">Cancelar</Link>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Salvando...' : 'Criar Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
