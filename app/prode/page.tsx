import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/prode/header'
import { ProdeContent } from './prode-content'
import { PagoGate } from '@/components/prode/pago-gate'

// Cliente admin (service role) para escribir sin sesion, igual que el webhook.
function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll() { return [] }, setAll() {} } }
  )
}

// Verifica un pago contra Mercado Pago y, si esta aprobado y es de este
// usuario, lo habilita. Sirve como respaldo del webhook: cuando la persona
// vuelve del checkout, confirmamos el pago al instante sin depender del aviso.
async function verificarYHabilitarPago(paymentId: string, userId: string): Promise<boolean> {
  const accessToken = process.env.MP_ACCESS_TOKEN
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!accessToken || !serviceKey) return false

  try {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    })
    if (!res.ok) return false
    const pago = await res.json()

    if (pago.status === 'approved' && pago.external_reference === userId) {
      const admin = getAdminClient()
      await admin.from('profiles').update({ pago_hecho: true }).eq('id', userId)

      const { data: existente } = await admin
        .from('pagos')
        .select('id')
        .eq('mp_payment_id', String(paymentId))
        .maybeSingle()
      if (!existente) {
        await admin.from('pagos').insert({
          user_id: userId,
          mp_payment_id: String(paymentId),
          estado: pago.status,
          monto: pago.transaction_amount,
        })
      }
      return true
    }
    return false
  } catch {
    return false
  }
}

export default async function ProdePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch matches with teams
  const { data: matches } = await supabase
    .from('matches')
    .select(
      `
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*)
    `
    )
    .order('match_date', { ascending: true })

  // Fetch user predictions
  const { data: predictions } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', user.id)

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  let yaPago = profile?.pago_hecho === true
  const esAdmin = profile?.is_admin === true

  // Respaldo del webhook: si la persona vuelve de Mercado Pago con un pago,
  // lo verificamos en el momento y la habilitamos sin esperar el aviso.
  if (!yaPago && !esAdmin) {
    const sp = await searchParams
    const rawId = sp?.payment_id ?? sp?.collection_id
    const paymentId = Array.isArray(rawId) ? rawId[0] : rawId
    if (paymentId) {
      const habilitado = await verificarYHabilitarPago(paymentId, user.id)
      if (habilitado) yaPago = true
    }
  }

  // Si todavia no pago (y no es admin), mostramos la pantalla de pago.
  // Los admin entran siempre, asi nunca se bloquean.
  if (!yaPago && !esAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-12">
          <PagoGate nombre={profile?.full_name} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-4xl tracking-wide text-foreground">Mis Predicciones</h1>
          <p className="mt-2 text-muted-foreground">
            Hola {profile?.full_name || 'Participante'}! Ingresa tus predicciones para cada
            partido.
          </p>
          {profile && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
              <span className="text-sm text-muted-foreground">Puntos totales:</span>
              <span className="text-lg font-bold text-primary">{profile.points}</span>
            </div>
          )}
        </div>

        <ProdeContent
          initialMatches={matches || []}
          initialPredictions={predictions || []}
          userId={user.id}
        />
      </main>
    </div>
  )
}
