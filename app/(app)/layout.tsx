'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { isSubscriptionActive, trialDaysLeft } from '@/lib/utils'
import {
  LayoutDashboard, Users, Calendar, FileText, Settings,
  CreditCard, LogOut, Link2, AlertTriangle, ChevronLeft, Menu, X
} from 'lucide-react'

interface AppLayoutProps { children: React.ReactNode }

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [business, setBusiness] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const [{ data: biz }, { data: sub }] = await Promise.all([
        supabase.from('business_settings').select('*').eq('user_id', user.id).single(),
        supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
      ])
      setBusiness(biz)
      setSubscription(sub)
    }
    load()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { href: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { href: '/leads', icon: <Users size={18} />, label: 'Leads' },
    { href: '/agenda', icon: <Calendar size={18} />, label: 'Agenda' },
    { href: '/servicos', icon: <FileText size={18} />, label: 'Serviços' },
    { href: '/minha-pagina', icon: <Link2 size={18} />, label: 'Minha Página' },
    { href: '/configuracoes', icon: <Settings size={18} />, label: 'Configurações' },
    { href: '/billing', icon: <CreditCard size={18} />, label: 'Assinatura' },
  ]

  const daysLeft = trialDaysLeft(subscription?.trial_ends_at)
  const isActive = subscription ? isSubscriptionActive(subscription.status, subscription.trial_ends_at) : false
  const showTrialBanner = subscription?.status === 'trial' && daysLeft <= 7

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-ice-blue flex items-center gap-2">
        <div className="w-8 h-8 bg-nuvio-blue rounded-xl flex items-center justify-center flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 3L20 8V16L12 21L4 16V8L12 3Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M12 8L16 10.5V15.5L12 18L8 15.5V10.5L12 8Z" fill="white"/>
          </svg>
        </div>
        <span className="font-sora font-bold text-deep-dark">Nuvio</span>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-ice-blue">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-nuvio-blue/10 rounded-xl flex items-center justify-center">
            <span className="font-sora font-bold text-nuvio-blue text-sm">
              {(business?.nome_fantasia || user?.email || 'U')[0].toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-dm font-semibold text-sm text-deep-dark truncate">
              {business?.nome_fantasia || 'Minha Empresa'}
            </p>
            <p className="text-xs text-muted truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={`nav-link ${pathname === item.href || pathname.startsWith(item.href + '/') ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Trial banner */}
      {showTrialBanner && (
        <div className="mx-3 mb-3 p-3 bg-amber/10 border border-amber/20 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-amber" />
            <span className="text-xs font-semibold text-amber">Trial expirando</span>
          </div>
          <p className="text-xs text-muted mb-2">{daysLeft} dias restantes</p>
          <Link href="/billing" className="text-xs font-semibold text-nuvio-blue hover:underline">
            Assinar agora →
          </Link>
        </div>
      )}

      {/* Logout */}
      <div className="px-3 pb-4">
        <button onClick={handleLogout} className="nav-link w-full text-error hover:bg-error/10 hover:text-error">
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-ice-blue flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-white h-full shadow-xl">
            <button className="absolute top-4 right-4 text-muted" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden bg-white border-b border-ice-blue px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-muted">
            <Menu size={22} />
          </button>
          <span className="font-sora font-bold text-deep-dark">Nuvio</span>
        </div>

        {/* Blocked banner */}
        {!isActive && subscription && (
          <div className="bg-error/10 border-b border-error/20 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-error text-sm">
              <AlertTriangle size={16} />
              <span>Sua assinatura expirou. Acesso limitado.</span>
            </div>
            <Link href="/billing" className="btn-primary text-xs py-1.5 px-4">
              Renovar agora
            </Link>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
