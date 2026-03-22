'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Loader2, MessageCircle, MapPin, Phone } from 'lucide-react'

interface BusinessSettings {
  id: string
  user_id: string
  nome_empresa: string | null
  nome_fantasia: string | null
  telefone: string | null
  cidade: string | null
  estado: string | null
  logo_url: string | null
  cor_primaria: string
  cor_secundaria: string
  slug: string | null
}

export default function CapturaForm({ business }: { business: BusinessSettings }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [form, setForm] = useState({
    nome: '', telefone: '', cidade: '',
    tipo_servico: 'instalacao', mensagem: '',
  })

  const primary = business.cor_primaria || '#1C5FD9'
  const secondary = business.cor_secundaria || '#0DCFB4'
  const nomeExibicao = business.nome_fantasia || business.nome_empresa || 'Instalador'

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.from('leads').insert({
      ...form,
      user_id: business.user_id,
      origem: 'landing_page',
      status: 'novo_lead',
    })
    setEnviado(true)
    setLoading(false)
  }

  if (enviado) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: `${primary}10` }}>
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${secondary}20` }}>
            <CheckCircle size={40} style={{ color: secondary }} />
          </div>
          <h2 className="font-sora font-bold text-2xl text-deep-dark mb-3">
            Solicitação enviada! 🎉
          </h2>
          <p className="text-muted text-base leading-relaxed mb-6">
            Recebemos seu pedido de orçamento. Em breve o <strong style={{ color: primary }}>{nomeExibicao}</strong> entrará em contato com você pelo WhatsApp.
          </p>
          {business.telefone && (
            <a
              href={`https://wa.me/55${business.telefone.replace(/\D/g, '')}?text=Oi, acabei de solicitar um orçamento pelo site!`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#25D366' }}
            >
              <MessageCircle size={18} />
              Falar no WhatsApp
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen font-dm" style={{ backgroundColor: `${primary}08` }}>
      {/* Header colorido */}
      <div style={{ backgroundColor: primary }} className="py-6 px-4">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          {business.logo_url ? (
            <img src={business.logo_url} alt="Logo" className="h-14 object-contain rounded-xl bg-white/10 p-1" />
          ) : (
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="font-sora font-bold text-white text-xl">
                {nomeExibicao[0]}
              </span>
            </div>
          )}
          <div>
            <h1 className="font-sora font-bold text-white text-xl leading-tight">{nomeExibicao}</h1>
            {(business.cidade || business.estado) && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin size={12} className="text-white/70" />
                <span className="text-white/80 text-sm">
                  {business.cidade}{business.estado ? `, ${business.estado}` : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Chamada */}
        <div className="text-center mb-8">
          <h2 className="font-sora font-bold text-3xl text-deep-dark mb-3">
            Solicite um orçamento de ar-condicionado
          </h2>
          <p className="text-muted text-base">
            Preencha o formulário e entraremos em contato pelo WhatsApp em breve.
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nome completo *</label>
              <input name="nome" className="input" placeholder="Seu nome" value={form.nome} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">WhatsApp *</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input name="telefone" className="input pl-9" placeholder="(11) 99999-9999" value={form.telefone} onChange={handleChange} required />
              </div>
            </div>
            <div>
              <label className="label">Sua cidade *</label>
              <input name="cidade" className="input" placeholder="São Paulo" value={form.cidade} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Tipo de serviço *</label>
              <select name="tipo_servico" className="input" value={form.tipo_servico} onChange={handleChange}>
                <option value="instalacao">Instalação de ar-condicionado</option>
                <option value="manutencao">Manutenção</option>
                <option value="higienizacao">Higienização</option>
                <option value="orcamento">Apenas orçamento</option>
                <option value="outros">Outros</option>
              </select>
            </div>
            <div>
              <label className="label">Mensagem (opcional)</label>
              <textarea
                name="mensagem"
                className="input resize-none min-h-[90px]"
                placeholder="Descreva sua necessidade, modelo do aparelho, etc."
                value={form.mensagem}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-white font-sora font-semibold text-base
                         flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
              style={{ backgroundColor: primary }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'Enviando...' : 'Solicitar orçamento gratuito'}
            </button>
          </form>
        </div>

        {/* Contato direto */}
        {business.telefone && (
          <div className="text-center mt-6">
            <p className="text-muted text-sm mb-3">Prefere falar direto?</p>
            <a
              href={`https://wa.me/55${business.telefone.replace(/\D/g, '')}`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              <MessageCircle size={18} />
              Chamar no WhatsApp
            </a>
          </div>
        )}

        <p className="text-center text-xs text-muted mt-8">
          Powered by <span style={{ color: primary }} className="font-semibold">Nuvio</span>
        </p>
      </div>
    </div>
  )
}
