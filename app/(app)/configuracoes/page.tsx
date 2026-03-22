'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Upload, Save } from 'lucide-react'

const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

export default function ConfiguracoesPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [form, setForm] = useState({
    nome_empresa: '', nome_fantasia: '', telefone: '', instagram: '',
    cidade: '', estado: '', cep: '', raio_atendimento: '30',
    cor_primaria: '#1C5FD9', cor_secundaria: '#0DCFB4',
  })
  const [userId, setUserId] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase.from('business_settings').select('*').eq('user_id', user.id).single()
      if (data) {
        setForm({
          nome_empresa: data.nome_empresa || '',
          nome_fantasia: data.nome_fantasia || '',
          telefone: data.telefone || '',
          instagram: data.instagram || '',
          cidade: data.cidade || '',
          estado: data.estado || '',
          cep: data.cep || '',
          raio_atendimento: String(data.raio_atendimento || 30),
          cor_primaria: data.cor_primaria || '#1C5FD9',
          cor_secundaria: data.cor_secundaria || '#0DCFB4',
        })
        if (data.logo_url) setLogoPreview(data.logo_url)
      }
      setLoading(false)
    }
    load()
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    let logo_url = logoPreview.startsWith('blob:') ? undefined : logoPreview || undefined

    if (logoFile) {
      const ext = logoFile.name.split('.').pop()
      const path = `${userId}/logo.${ext}`
      await supabase.storage.from('nuvio-assets').upload(path, logoFile, { upsert: true })
      const { data } = supabase.storage.from('nuvio-assets').getPublicUrl(path)
      logo_url = data.publicUrl
    }

    await supabase.from('business_settings').update({
      ...form,
      raio_atendimento: parseInt(form.raio_atendimento),
      ...(logo_url ? { logo_url } : {}),
    }).eq('user_id', userId)

    setSaving(false)
    setSucesso(true)
    setTimeout(() => setSucesso(false), 2500)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full p-16">
      <div className="w-8 h-8 border-4 border-nuvio-blue border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-sora font-bold text-2xl text-deep-dark">Configurações</h1>
        <p className="text-muted text-sm mt-1">Gerencie os dados da sua empresa</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Dados da empresa */}
        <div className="card">
          <h2 className="font-sora font-semibold text-deep-dark mb-5">Dados da empresa</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Nome da empresa</label><input name="nome_empresa" className="input" value={form.nome_empresa} onChange={handleChange} /></div>
            <div><label className="label">Nome fantasia</label><input name="nome_fantasia" className="input" value={form.nome_fantasia} onChange={handleChange} /></div>
            <div><label className="label">WhatsApp / Telefone</label><input name="telefone" className="input" value={form.telefone} onChange={handleChange} /></div>
            <div><label className="label">Instagram</label><input name="instagram" className="input" value={form.instagram} onChange={handleChange} placeholder="@suaempresa" /></div>
            <div><label className="label">Cidade</label><input name="cidade" className="input" value={form.cidade} onChange={handleChange} /></div>
            <div>
              <label className="label">Estado</label>
              <select name="estado" className="input" value={form.estado} onChange={handleChange}>
                <option value="">Selecione</option>
                {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div><label className="label">CEP</label><input name="cep" className="input" value={form.cep} onChange={handleChange} /></div>
            <div><label className="label">Raio de atendimento (km)</label><input name="raio_atendimento" type="number" className="input" value={form.raio_atendimento} onChange={handleChange} /></div>
          </div>
        </div>

        {/* Identidade visual */}
        <div className="card">
          <h2 className="font-sora font-semibold text-deep-dark mb-5">Identidade visual</h2>

          <div className="mb-4">
            <label className="label">Logo</label>
            <label className="flex items-center gap-4 border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-nuvio-blue transition-colors">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="h-16 object-contain" />
              ) : (
                <div className="w-16 h-16 bg-ice-blue rounded-xl flex items-center justify-center">
                  <Upload size={24} className="text-muted" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-deep-dark">
                  {logoPreview ? 'Trocar logo' : 'Fazer upload do logo'}
                </p>
                <p className="text-xs text-muted">PNG, JPG ou SVG</p>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Cor primária</label>
              <div className="flex items-center gap-3">
                <input type="color" name="cor_primaria" value={form.cor_primaria} onChange={handleChange}
                  className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer p-1" />
                <input name="cor_primaria" className="input font-mono" value={form.cor_primaria} onChange={handleChange} />
              </div>
            </div>
            <div>
              <label className="label">Cor secundária</label>
              <div className="flex items-center gap-3">
                <input type="color" name="cor_secundaria" value={form.cor_secundaria} onChange={handleChange}
                  className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer p-1" />
                <input name="cor_secundaria" className="input font-mono" value={form.cor_secundaria} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        {/* Botão salvar */}
        <button type="submit" disabled={saving}
          className={`btn-primary w-full py-4 flex items-center justify-center gap-2 ${sucesso ? 'bg-success hover:bg-success' : ''}`}>
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Salvando...' : sucesso ? '✓ Salvo com sucesso!' : 'Salvar alterações'}
        </button>
      </form>
    </div>
  )
}
