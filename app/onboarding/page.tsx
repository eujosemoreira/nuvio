'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Upload, CheckCircle } from 'lucide-react'

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState('')

  const [form, setForm] = useState({
    nome_empresa: '', nome_fantasia: '', telefone: '',
    instagram: '', cidade: '', estado: '', cep: '',
    raio_atendimento: '30', cor_primaria: '#1C5FD9', cor_secundaria: '#0DCFB4',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    let logo_url = null

    // Upload do logo se fornecido
    if (logoFile) {
      const ext = logoFile.name.split('.').pop()
      const path = `${user.id}/logo.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('nuvio-assets')
        .upload(path, logoFile, { upsert: true })

      if (!uploadError) {
        const { data } = supabase.storage.from('nuvio-assets').getPublicUrl(path)
        logo_url = data.publicUrl
      }
    }

    const { error } = await supabase
      .from('business_settings')
      .update({
        ...form,
        raio_atendimento: parseInt(form.raio_atendimento),
        logo_url,
      })
      .eq('user_id', user.id)

    if (error) {
      setErro('Erro ao salvar. Tente novamente.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-ice-blue/30 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-nuvio-blue rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L20 8V16L12 21L4 16V8L12 3Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M12 8L16 10.5V15.5L12 18L8 15.5V10.5L12 8Z" fill="white"/>
            </svg>
          </div>
          <h1 className="font-sora font-bold text-2xl text-deep-dark">Configure seu perfil</h1>
          <p className="text-muted text-sm mt-2">Essas informações aparecerão na sua página de captação</p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                step >= s ? 'bg-nuvio-blue text-white' : 'bg-gray-200 text-muted'
              }`}>
                {step > s ? <CheckCircle size={16} /> : s}
              </div>
              {s < 2 && <div className={`w-12 h-0.5 ${step > s ? 'bg-nuvio-blue' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="card">
          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2) } : handleSubmit} className="space-y-5">

            {step === 1 && (
              <>
                <h2 className="font-sora font-semibold text-lg text-deep-dark mb-4">Dados da empresa</h2>

                <div>
                  <label className="label">Nome da empresa</label>
                  <input name="nome_empresa" className="input" placeholder="Clima Frio Instalações" value={form.nome_empresa} onChange={handleChange} required />
                </div>
                <div>
                  <label className="label">Nome fantasia</label>
                  <input name="nome_fantasia" className="input" placeholder="Como seu cliente te conhece" value={form.nome_fantasia} onChange={handleChange} />
                </div>
                <div>
                  <label className="label">WhatsApp / Telefone</label>
                  <input name="telefone" className="input" placeholder="(11) 99999-9999" value={form.telefone} onChange={handleChange} required />
                </div>
                <div>
                  <label className="label">Instagram (opcional)</label>
                  <input name="instagram" className="input" placeholder="@suaempresa" value={form.instagram} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Cidade</label>
                    <input name="cidade" className="input" placeholder="São Paulo" value={form.cidade} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="label">Estado</label>
                    <select name="estado" className="input" value={form.estado} onChange={handleChange} required>
                      <option value="">Selecione</option>
                      {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">CEP</label>
                    <input name="cep" className="input" placeholder="00000-000" value={form.cep} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="label">Raio de atendimento (km)</label>
                    <input name="raio_atendimento" type="number" className="input" placeholder="30" value={form.raio_atendimento} onChange={handleChange} />
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full py-4">
                  Próximo →
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="font-sora font-semibold text-lg text-deep-dark mb-4">Identidade visual</h2>

                {/* Upload logo */}
                <div>
                  <label className="label">Logo da empresa</label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-nuvio-blue transition-colors">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="h-20 object-contain" />
                    ) : (
                      <>
                        <Upload size={32} className="text-muted mb-2" />
                        <span className="text-sm text-muted">Clique para fazer upload do logo</span>
                        <span className="text-xs text-muted mt-1">PNG, JPG ou SVG</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
                  </label>
                </div>

                {/* Cores */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Cor primária</label>
                    <div className="flex items-center gap-3">
                      <input type="color" name="cor_primaria" value={form.cor_primaria} onChange={handleChange}
                        className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer p-1" />
                      <span className="text-sm text-muted font-mono">{form.cor_primaria}</span>
                    </div>
                  </div>
                  <div>
                    <label className="label">Cor secundária</label>
                    <div className="flex items-center gap-3">
                      <input type="color" name="cor_secundaria" value={form.cor_secundaria} onChange={handleChange}
                        className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer p-1" />
                      <span className="text-sm text-muted font-mono">{form.cor_secundaria}</span>
                    </div>
                  </div>
                </div>

                {erro && (
                  <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-xl">{erro}</div>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 py-4">
                    ← Voltar
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1 py-4 flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                    {loading ? 'Salvando...' : 'Concluir ✓'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
