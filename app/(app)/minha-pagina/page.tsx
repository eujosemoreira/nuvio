'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Link2, Copy, ExternalLink, Check } from 'lucide-react'

export default function MinhaPaginaPage() {
  const supabase = createClient()
  const [business, setBusiness] = useState<any>(null)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('business_settings').select('*').eq('user_id', user.id).single()
      setBusiness(data)
    }
    load()
  }, [])

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const slug = business?.slug || ''
  const capturaUrl = `${appUrl}/captura/${slug}`

  function copiar() {
    navigator.clipboard.writeText(capturaUrl)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-sora font-bold text-2xl text-deep-dark">Minha Página</h1>
        <p className="text-muted text-sm mt-1">Compartilhe esse link para receber leads</p>
      </div>

      {/* Link */}
      <div className="card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-nuvio-blue/10 rounded-xl flex items-center justify-center">
            <Link2 size={20} className="text-nuvio-blue" />
          </div>
          <div>
            <p className="font-sora font-semibold text-deep-dark">Sua página de captação</p>
            <p className="text-muted text-sm">Compartilhe no WhatsApp, Instagram e Google</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-ice-blue rounded-xl p-3">
          <span className="text-sm text-deep-dark flex-1 truncate font-mono">{capturaUrl}</span>
          <button onClick={copiar}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              copiado ? 'bg-success text-white' : 'bg-nuvio-blue text-white hover:bg-sky-blue'
            }`}>
            {copiado ? <Check size={12} /> : <Copy size={12} />}
            {copiado ? 'Copiado!' : 'Copiar'}
          </button>
          <a href={capturaUrl} target="_blank" rel="noreferrer"
            className="p-1.5 text-muted hover:text-nuvio-blue transition-colors">
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {/* Preview */}
      <div className="card">
        <p className="font-sora font-semibold text-deep-dark mb-4">Preview da página</p>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="h-2" style={{ backgroundColor: business?.cor_primaria || '#1C5FD9' }} />
          <div className="p-6 bg-gray-50">
            <div className="flex items-center gap-3 mb-4">
              {business?.logo_url ? (
                <img src={business.logo_url} alt="Logo" className="h-12 object-contain" />
              ) : (
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: business?.cor_primaria || '#1C5FD9' }}>
                  {(business?.nome_fantasia || 'N')[0]}
                </div>
              )}
              <div>
                <p className="font-sora font-bold text-deep-dark">{business?.nome_fantasia || 'Sua Empresa'}</p>
                <p className="text-xs text-muted">{business?.cidade}, {business?.estado}</p>
              </div>
            </div>
            <h3 className="font-sora font-bold text-lg text-deep-dark mb-1">
              Solicite um orçamento de ar-condicionado
            </h3>
            <p className="text-muted text-sm mb-4">Atendimento em {business?.cidade || 'sua cidade'} e região</p>
            <div className="bg-white rounded-xl p-4 space-y-3 border border-gray-200">
              {['Nome completo', 'WhatsApp', 'Cidade', 'Tipo de serviço'].map(field => (
                <div key={field} className="h-9 bg-gray-100 rounded-lg flex items-center px-3">
                  <span className="text-xs text-muted">{field}</span>
                </div>
              ))}
              <div className="h-9 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                style={{ backgroundColor: business?.cor_primaria || '#1C5FD9' }}>
                Solicitar orçamento
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dicas */}
      <div className="card mt-6 bg-nuvio-blue/5 border-nuvio-blue/20">
        <h3 className="font-sora font-semibold text-deep-dark mb-3">💡 Como divulgar sua página</h3>
        <ul className="space-y-2 text-sm text-muted">
          <li>📱 <strong className="text-deep-dark">WhatsApp:</strong> Cole o link na bio ou envie para grupos</li>
          <li>📸 <strong className="text-deep-dark">Instagram:</strong> Adicione na bio do seu perfil</li>
          <li>🔍 <strong className="text-deep-dark">Google Meu Negócio:</strong> Adicione como site</li>
          <li>💬 <strong className="text-deep-dark">Status:</strong> Compartilhe o link no status do WhatsApp</li>
        </ul>
      </div>
    </div>
  )
}
