import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/prode/header'
import { AdminContent } from './admin-content'

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/prode')
  }

  // Fetch all teams
  const { data: teams } = await supabase
    .from('teams')
    .select('*')
    .order('group_letter', { ascending: true })
    .order('name', { ascending: true })

  // Fetch all matches with teams
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

  // Fetch all profiles for leaderboard management
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('points', { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-4xl tracking-wide text-foreground">Panel de Administración</h1>
          <p className="mt-2 text-muted-foreground">
            Gestiona partidos, resultados y puntajes del prode.
          </p>
        </div>

        <AdminContent
          teams={teams || []}
          matches={matches || []}
          profiles={profiles || []}
        />
      </main>
    </div>
  )
}
