import { createBrowserClient } from '@supabase/ssr'

// Mantener la sesion iniciada 30 dias tambien del lado del navegador.
// La app instalada (PWA) usa este cliente: sin esto, la cookie se trata como
// "de sesion" y el celular la borra al cerrar la app, obligando a loguear de nuevo.
const SESSION_MAX_AGE = 60 * 60 * 24 * 30

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        maxAge: SESSION_MAX_AGE,
        path: '/',
        sameSite: 'lax',
      },
    },
  )
}
