import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@/lib/supabase/server'

// Cliente admin (service role) para poder contar los plenos de TODOS.
// La tabla predictions tiene RLS que deja ver solo los propios; este cliente
// la saltea. Solo devolvemos el CONTEO de plenos (aciertos exactos ya puntuados),
// nunca el detalle de los pronosticos, asi nadie puede espiar nada.
function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll() { return [] }, setAll() {} } }
  )
}

export async function GET() {
  // Tiene que estar logueado.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const admin = getAdminClient()

  // 1) Participantes que pagaron.
  const { data: profiles, error: profilesError } = await admin
    .from('profiles')
    .select('id, email, full_name, points')
    .eq('pago_hecho', true)

  if (profilesError || !profiles) {
    return NextResponse.json({ error: 'No se pudo leer el ranking' }, { status: 500 })
  }

  // 2) Plenos = pronosticos con 10 puntos (resultado exacto).
  // Paginamos porque la API corta en 1000 filas por pedido.
  const plenosPorUsuario = new Map<string, number>()
  const PAGE = 1000
  let desde = 0

  for (;;) {
    const { data: plenos, error: plenosError } = await admin
      .from('predictions')
      .select('user_id')
      .eq('points_earned', 10)
      .range(desde, desde + PAGE - 1)

    if (plenosError) {
      return NextResponse.json({ error: 'No se pudieron contar los plenos' }, { status: 500 })
    }
    if (!plenos || plenos.length === 0) break

    for (const p of plenos) {
      const uid = p.user_id as string
      plenosPorUsuario.set(uid, (plenosPorUsuario.get(uid) ?? 0) + 1)
    }

    if (plenos.length < PAGE) break
    desde += PAGE
  }

  // 3) Armamos el ranking y ordenamos: primero puntos, y si empatan, mas plenos arriba.
  const entries = profiles
    .map((p) => ({
      id: p.id as string,
      email: (p.email as string) ?? '',
      full_name: (p.full_name as string | null) ?? null,
      points: (p.points as number) ?? 0,
      plenos: plenosPorUsuario.get(p.id as string) ?? 0,
    }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.plenos !== a.plenos) return b.plenos - a.plenos
      // Ultimo criterio, solo para que el orden sea estable entre recargas.
      return (a.full_name || a.email).localeCompare(b.full_name || b.email)
    })

  return NextResponse.json({ entries })
}
