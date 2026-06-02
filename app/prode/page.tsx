import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/prode/header'
import { ProdeContent } from './prode-content'
import { PagoGate } from '@/components/prode/pago-gate'

export default async function ProdePage() {
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

  // Si el usuario todavia no pago (y no es admin), mostramos la pantalla de
  // pago en lugar del prode. Los admin entran siempre, asi nunca se bloquean.
  const yaPago = profile?.pago_hecho === true
  const esAdmin = profile?.is_admin === true

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
