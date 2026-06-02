import { updateSession } from '@/lib/supabase/proxy'
import { type NextRequest } from 'next/server'

// En Next.js 16 el antiguo "middleware" se renombra a "proxy" y corre en el
// runtime de Node.js (el Edge no soporta los modulos de Supabase). La logica
// es la misma: refresca la sesion y protege /prode y /admin.
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
