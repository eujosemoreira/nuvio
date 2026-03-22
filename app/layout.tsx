import type { Metadata } from 'next'
import { Sora, DM_Sans } from 'next/font/google'
import './globals.css'

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  weight: ['400', '600', '700', '800'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Nuvio — Gestão para Instaladores de Ar-Condicionado',
  description: 'SaaS profissional para instaladores de ar-condicionado. Gerencie leads, orçamentos, agendamentos e muito mais.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sora.variable} ${dmSans.variable}`}>
      <body className="font-dm bg-white text-deep-dark antialiased">
        {children}
      </body>
    </html>
  )
}
