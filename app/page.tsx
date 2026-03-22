'use client'
import Link from 'next/link'
import {
  CheckCircle, Zap, Users, Calendar, FileText,
  ArrowRight, Star, BarChart3, MessageCircle, Shield
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-dm">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-ice-blue">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-nuvio-blue rounded-xl flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L20 8V16L12 21L4 16V8L12 3Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M12 8L16 10.5V15.5L12 18L8 15.5V10.5L12 8Z" fill="white"/>
              </svg>
            </div>
            <span className="font-sora font-bold text-deep-dark text-lg">Nuvio</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-muted hover:text-deep-dark text-sm font-dm transition-colors">
              Entrar
            </Link>
            <Link href="/cadastro" className="btn-primary text-sm py-2 px-5">
              Criar conta grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-32 pb-24 px-6 bg-gradient-to-b from-ice-blue/40 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-nuvio-blue/10 text-nuvio-blue text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full mb-8">
            <Star size={12} />
            <span>15 dias grátis — sem cartão de crédito</span>
          </div>

          <h1 className="font-sora font-extrabold text-5xl md:text-6xl text-deep-dark leading-tight mb-6">
            Gestão inteligente para{' '}
            <span className="text-nuvio-blue">instaladores</span>{' '}
            de ar-condicionado
          </h1>

          <p className="text-muted text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            Capture leads, envie orçamentos, agende instalações e controle
            todos os seus serviços em um único lugar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/cadastro" className="btn-primary flex items-center gap-2 text-base px-8 py-4">
              Começar gratuitamente
              <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="btn-secondary text-base px-8 py-4">
              Já tenho conta
            </Link>
          </div>

          <p className="text-muted text-sm mt-6">
            R$29/mês após o período gratuito. Cancele quando quiser.
          </p>
        </div>
      </section>

      {/* ── BENEFÍCIOS ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-nuvio-blue text-sm font-semibold uppercase tracking-wider mb-3">Benefícios</p>
            <h2 className="font-sora font-bold text-4xl text-deep-dark">
              Tudo que você precisa para crescer
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="text-nuvio-blue" size={24} />,
                title: 'Capture mais leads',
                desc: 'Sua página de captação profissional pronta em minutos. Receba leads 24h pelo WhatsApp e formulário.',
              },
              {
                icon: <FileText className="text-nuvio-blue" size={24} />,
                title: 'Orçamentos profissionais',
                desc: 'Crie e envie orçamentos detalhados rapidamente. Acompanhe aprovações em tempo real.',
              },
              {
                icon: <Calendar className="text-nuvio-blue" size={24} />,
                title: 'Agenda organizada',
                desc: 'Seus clientes agendam online. Você recebe lembretes automáticos para nunca esquecer uma visita.',
              },
              {
                icon: <MessageCircle className="text-nuvio-blue" size={24} />,
                title: 'WhatsApp integrado',
                desc: 'Mensagens prontas de confirmação, lembrete e manutenção preventiva com um clique.',
              },
              {
                icon: <BarChart3 className="text-nuvio-blue" size={24} />,
                title: 'Dashboard completo',
                desc: 'Acompanhe leads, serviços e faturamento em tempo real no seu painel de controle.',
              },
              {
                icon: <Shield className="text-nuvio-blue" size={24} />,
                title: 'Seus dados seguros',
                desc: 'Cada instalador acessa apenas seus próprios dados. Total privacidade e segurança.',
              },
            ].map((item, i) => (
              <div key={i} className="card hover:shadow-card-hover transition-shadow">
                <div className="w-12 h-12 bg-ice-blue rounded-xl flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-sora font-semibold text-lg text-deep-dark mb-2">{item.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section className="py-24 px-6 bg-ice-blue/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-nuvio-blue text-sm font-semibold uppercase tracking-wider mb-3">Fluxo</p>
            <h2 className="font-sora font-bold text-4xl text-deep-dark">
              Como funciona
            </h2>
          </div>

          <div className="space-y-6">
            {[
              { n: '01', title: 'Crie sua conta', desc: '15 dias grátis, sem precisar de cartão.' },
              { n: '02', title: 'Configure seu perfil', desc: 'Adicione logo, cores e dados da sua empresa.' },
              { n: '03', title: 'Compartilhe sua página', desc: 'Divulgue no WhatsApp, Instagram e Google.' },
              { n: '04', title: 'Receba e gerencie leads', desc: 'Acompanhe cada cliente do primeiro contato à conclusão.' },
              { n: '05', title: 'Cresça com dados', desc: 'Veja seus números e expanda seu negócio.' },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-6 card">
                <div className="w-12 h-12 bg-nuvio-blue rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="font-sora font-bold text-white text-sm">{step.n}</span>
                </div>
                <div>
                  <h3 className="font-sora font-semibold text-deep-dark mb-1">{step.title}</h3>
                  <p className="text-muted text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PREÇO ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-md mx-auto text-center">
          <p className="text-nuvio-blue text-sm font-semibold uppercase tracking-wider mb-3">Plano único</p>
          <h2 className="font-sora font-bold text-4xl text-deep-dark mb-12">Simples e transparente</h2>

          <div className="card border-2 border-nuvio-blue shadow-card-hover">
            <div className="text-center mb-8">
              <p className="text-muted text-sm mb-2">Plano Profissional</p>
              <div className="flex items-end justify-center gap-1">
                <span className="font-sora font-extrabold text-6xl text-deep-dark">R$29</span>
                <span className="text-muted text-lg mb-3">/mês</span>
              </div>
              <p className="text-teal text-sm font-semibold mt-2">✓ 15 dias grátis para começar</p>
            </div>

            <ul className="space-y-3 mb-8 text-left">
              {[
                'Leads ilimitados',
                'Página de captação personalizada',
                'Orçamentos profissionais',
                'Agendamento online pelo cliente',
                'Mensagens automáticas de WhatsApp',
                'Dashboard completo',
                'Histórico de serviços',
                'Alertas de manutenção preventiva',
                'Suporte por WhatsApp',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-deep-dark">
                  <CheckCircle size={16} className="text-success flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <Link href="/cadastro" className="btn-primary w-full text-center block py-4 text-base">
              Começar 15 dias grátis
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 px-6 bg-deep-dark text-white text-center">
        <div className="max-w-2xl mx-auto">
          <Zap size={48} className="text-teal mx-auto mb-6" />
          <h2 className="font-sora font-bold text-4xl mb-4">
            Pronto para organizar seus serviços?
          </h2>
          <p className="text-muted text-lg mb-10">
            Junte-se a instaladores que já usam o Nuvio para crescer.
          </p>
          <Link href="/cadastro" className="btn-teal inline-flex items-center gap-2 text-base px-10 py-4">
            Criar conta grátis
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate text-muted py-8 px-6 text-center text-sm">
        <p>© 2025 Nuvio · Gestão para instaladores de ar-condicionado</p>
      </footer>
    </div>
  )
}
