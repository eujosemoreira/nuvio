import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Rotas públicas que não precisam de login
  const publicRoutes = ['/', '/login', '/cadastro', '/captura', '/agendar']
  const isPublic = publicRoutes.some(r => path === r || path.startsWith(r + '/'))

  // Se não está logado e tenta acessar rota protegida
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se está logado e tenta acessar login/cadastro
  if (user && (path === '/login' || path === '/cadastro')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Protege /superadmin — só o email autorizado
  if (path.startsWith('/superadmin')) {
    if (!user || user.email !== process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
