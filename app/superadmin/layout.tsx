'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Shield, Users, BarChart3, Globe, LogOut, LayoutDashboard } from 'lucide-react'

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL) {
        router.push('/dashboard')
        return
      }
      setChecking(false)
    }
    check()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-nuvio-blue border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const navItems = [
    { href: '/superadmin', icon: <LayoutDashboard size={18} />, label: 'Visão Geral' },
    { href: '/superadmin/users', icon: <Users size={18} />, label: 'Instaladores' },
    { href: '/superadmin/leads', icon: <Globe size={18} />, label: 'Todos os Leads' },
    { href: '/superadmin/system', icon: <BarChart3 size={18} />, label: 'Sistema' },
  ]

  return (
    <div className="flex h-screen bg-deep-dark overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-slate flex flex-col flex-shrink-0 border-r border-white/10">
        <div className="px-4 py-5 border-b border-white/10 flex items-center gap-2">
          <div className="w-8 h-8 bg-amber rounded-xl flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <p className="font-sora font-bold text-white text-sm">Super Admin</p>
            <p className="text-white/40 text-xs">Nuvio</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-dm transition-all ${
                pathname === item.href || (item.href !== '/superadmin' && pathname.startsWith(item.href))
                  ? 'bg-amber/20 text-amber font-semibold'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}>
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 pb-4">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:bg-white/10 hover:text-white transition-all w-full">
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gray-50">
        {children}
      </main>
    </div>
  )
}
