import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@/lib/supabase/server'

// Mismo margen de cierre que la tarjeta (2 minutos antes del partido).
const CIERRE_ANTES_MS = 2 * 60 * 1000

// Cliente admin (service role) para poder leer los pronosticos de TODOS.
// La tabla predictions tiene RLS que deja ver solo los propios; este cliente
// la saltea. PERO antes de devolver nada verificamos que el partido ya cerro,
// asi nadie puede espiar pronosticos de partidos abiertos para copiarse.
function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll() { return [] }, setAll() {} } }
  )
}

export async function GET(request: Request) {
  // 1) Tiene que estar logueado.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // 2) Validamos el match_id que viene por query (?match_id=108).
  const { searchParams } = new URL(request.url)
  const matchIdRaw = searchParams.get('match_id')
  const matchId = matchIdRaw ? parseInt(matchIdRaw, 10) : NaN
  if (!Number.isInteger(matchId)) {
    return NextResponse.json({ error: 'Falta match_id' }, { status: 400 })
  }

  const admin = getAdminClient()

  // 3) Traemos el partido para saber si ya cerro.
  const { data: match } = await admin
    .from('matches')
    .select('match_date, is_finished')
    .eq('id', matchId)
    .single()

  if (!match) {
    return NextResponse.json({ error: 'Partido inexistente' }, { status: 404 })
  }

  // 4) Regla de oro: los pronosticos solo se ven si el partido CERRO.
  // Cerrado = ya esta finalizado, o ya pasamos el horario de cierre.
  const matchTime = match.match_date ? new Date(match.match_date).getTime() : null
  const closeTime = matchTime !== null ? matchTime - CIERRE_ANTES_MS : null
  const cerrado =
    match.is_finished === true || (closeTime !== null && Date.now() >= closeTime)

  if (!cerrado) {
    return NextResponse.json(
      { error: 'El partido todavia no cerro' },
      { status: 403 }
    )
  }

  // 5) Ya cerro: traemos los pronosticos de todos para este partido.
  const { data: preds } = await admin
    .from('predictions')
    .select('user_id, home_score, away_score, points_earned')
    .eq('match_id', matchId)

  if (!preds || preds.length === 0) {
    return NextResponse.json({
      predicciones: [],
      finalizado: match.is_finished === true,
    })
  }

  // 6) Buscamos el nombre de cada uno (en profiles).
  const userIds = [...new Set(preds.map((p) => p.user_id))]
  const { data: profs } = await admin
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds)

  const nombrePorId = new Map<string, string>()
  for (const pr of profs ?? []) {
    nombrePorId.set(pr.id, pr.full_name ?? 'Participante')
  }

  // 7) Armamos la lista y ordenamos: por puntos (si hay resultado) y por nombre.
  const lista = preds.map((p) => ({
    nombre: nombrePorId.get(p.user_id) ?? 'Participante',
    home_score: p.home_score,
    away_score: p.away_score,
    points_earned: p.points_earned,
  }))

  lista.sort((a, b) => {
    const pa = a.points_earned ?? 0
    const pb = b.points_earned ?? 0
    if (pb !== pa) return pb - pa
    return a.nombre.localeCompare(b.nombre, 'es')
  })

  return NextResponse.json({
    predicciones: lista,
    finalizado: match.is_finished === true,
  })
}
