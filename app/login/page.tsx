'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })

    if (error) {
      setErro('E-mail ou senha incorretos. Tente novamente.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-ice-blue/30 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-nuvio-blue rounded-xl flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L20 8V16L12 21L4 16V8L12 3Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M12 8L16 10.5V15.5L12 18L8 15.5V10.5L12 8Z" fill="white"/>
              </svg>
            </div>
            <span className="font-sora font-bold text-deep-dark text-xl">Nuvio</span>
          </Link>
          <h1 className="font-sora font-bold text-2xl text-deep-dark">Bem-vindo de volta</h1>
          <p className="text-muted text-sm mt-2">Entre na sua conta para continuar</p>
        </div>

        {/* Formulário */}
        <div className="card">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="label">E-mail</label>
              <input
                type="email"
                className="input"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="••••••••"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-deep-dark transition-colors"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                >
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {erro && (
              <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-xl">
                {erro}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-4">
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted">
            Ainda não tem conta?{' '}
            <Link href="/cadastro" className="text-nuvio-blue font-semibold hover:underline">
              Criar conta grátis
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
