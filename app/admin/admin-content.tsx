'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import type { Team, MatchWithTeams, Profile } from '@/lib/types'
import { Loader2, Plus, Save, Trophy, Users, Calendar, Shield } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface AdminContentProps {
  teams: Team[]
  matches: MatchWithTeams[]
  profiles: Profile[]
}

export function AdminContent({ teams, matches, profiles }: AdminContentProps) {
  const [activeTab, setActiveTab] = useState('matches')
  const router = useRouter()

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-6 grid w-full grid-cols-4">
        <TabsTrigger value="matches" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Partidos
        </TabsTrigger>
        <TabsTrigger value="results" className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          Resultados
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Usuarios
        </TabsTrigger>
        <TabsTrigger value="teams" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Equipos
        </TabsTrigger>
      </TabsList>

      <TabsContent value="matches">
        <MatchesTab teams={teams} matches={matches} onRefresh={() => router.refresh()} />
      </TabsContent>

      <TabsContent value="results">
        <ResultsTab matches={matches} onRefresh={() => router.refresh()} />
      </TabsContent>

      <TabsContent value="users">
        <UsersTab profiles={profiles} onRefresh={() => router.refresh()} />
      </TabsContent>

      <TabsContent value="teams">
        <TeamsTab teams={teams} />
      </TabsContent>
    </Tabs>
  )
}

// Matches Tab
function MatchesTab({
  teams,
  matches,
  onRefresh,
}: {
  teams: Team[]
  matches: MatchWithTeams[]
  onRefresh: () => void
}) {
  const [homeTeamId, setHomeTeamId] = useState('')
  const [awayTeamId, setAwayTeamId] = useState('')
  const [matchDate, setMatchDate] = useState('')
  const [groupLetter, setGroupLetter] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleCreateMatch = async () => {
    if (!homeTeamId || !awayTeamId) return

    setSaving(true)
    const { error } = await supabase.from('matches').insert({
      home_team_id: parseInt(homeTeamId),
      away_team_id: parseInt(awayTeamId),
      match_date: matchDate || null,
      group_letter: groupLetter || null,
      stage: 'group',
    })

    if (!error) {
      setHomeTeamId('')
      setAwayTeamId('')
      setMatchDate('')
      setGroupLetter('')
      onRefresh()
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Crear Partido
          </CardTitle>
          <CardDescription>Agrega un nuevo partido al prode</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label>Equipo Local</Label>
              <Select value={homeTeamId} onValueChange={setHomeTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Equipo Visitante</Label>
              <Select value={awayTeamId} onValueChange={setAwayTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha y Hora</Label>
              <Input
                type="datetime-local"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Grupo</Label>
              <Select value={groupLetter} onValueChange={setGroupLetter}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map((g) => (
                    <SelectItem key={g} value={g}>
                      Grupo {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleCreateMatch} disabled={saving || !homeTeamId || !awayTeamId}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Crear Partido
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Partidos Creados ({matches.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grupo</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Visitante</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((match) => (
                <TableRow key={match.id}>
                  <TableCell>
                    <Badge variant="outline">{match.group_letter || '-'}</Badge>
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    {match.home_team?.flag_url && (
                      <Image
                        src={match.home_team.flag_url}
                        alt={match.home_team.name}
                        width={24}
                        height={16}
                        className="rounded"
                        unoptimized
                      />
                    )}
                    {match.home_team?.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {match.away_team?.flag_url && (
                        <Image
                          src={match.away_team.flag_url}
                          alt={match.away_team.name}
                          width={24}
                          height={16}
                          className="rounded"
                          unoptimized
                        />
                      )}
                      {match.away_team?.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {match.match_date
                      ? new Date(match.match_date).toLocaleDateString('es-AR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'America/Argentina/Buenos_Aires',
                        })
                      : 'Sin fecha'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={match.is_finished ? 'secondary' : 'default'}>
                      {match.is_finished ? 'Finalizado' : 'Pendiente'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// Results Tab
function ResultsTab({
  matches,
  onRefresh,
}: {
  matches: MatchWithTeams[]
  onRefresh: () => void
}) {
  const [selectedMatch, setSelectedMatch] = useState<string>('')
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const pendingMatches = matches.filter((m) => !m.is_finished)

  const handleSaveResult = async () => {
    if (!selectedMatch || homeScore === '' || awayScore === '') return

    setSaving(true)

    // Update match result
    const { error: matchError } = await supabase
      .from('matches')
      .update({
        home_score: parseInt(homeScore),
        away_score: parseInt(awayScore),
        is_finished: true,
      })
      .eq('id', parseInt(selectedMatch))

    if (matchError) {
      setSaving(false)
      return
    }

    // Calculate points for all predictions
    const { data: predictions } = await supabase
      .from('predictions')
      .select('*')
      .eq('match_id', parseInt(selectedMatch))

    if (predictions) {
      const actualHome = parseInt(homeScore)
      const actualAway = parseInt(awayScore)

      for (const pred of predictions) {
        let points = 0

        // Exact result = 10 points
        if (pred.home_score === actualHome && pred.away_score === actualAway) {
          points = 10
        }
        // Correct winner or draw = 5 points
        else if (
          (pred.home_score > pred.away_score && actualHome > actualAway) ||
          (pred.home_score < pred.away_score && actualHome < actualAway) ||
          (pred.home_score === pred.away_score && actualHome === actualAway)
        ) {
          points = 5
        }

        // Update prediction points
        await supabase
          .from('predictions')
          .update({ points_earned: points })
          .eq('id', pred.id)

        // Update user total points
        await supabase.rpc('increment_points', {
          user_id: pred.user_id,
          points_to_add: points,
        })
      }
    }

    setSelectedMatch('')
    setHomeScore('')
    setAwayScore('')
    onRefresh()
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Cargar Resultado
          </CardTitle>
          <CardDescription>
            Ingresa el resultado final de un partido para calcular los puntos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-2 sm:col-span-2">
              <Label>Partido</Label>
              <Select value={selectedMatch} onValueChange={setSelectedMatch}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar partido" />
                </SelectTrigger>
                <SelectContent>
                  {pendingMatches.map((match) => (
                    <SelectItem key={match.id} value={match.id.toString()}>
                      {match.home_team?.name} vs {match.away_team?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Goles Local</Label>
              <Input
                type="number"
                min="0"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Goles Visitante</Label>
              <Input
                type="number"
                min="0"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <Button
            onClick={handleSaveResult}
            disabled={saving || !selectedMatch || homeScore === '' || awayScore === ''}
            className="mt-4"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Guardar Resultado y Calcular Puntos
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultados Cargados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partido</TableHead>
                <TableHead>Resultado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches
                .filter((m) => m.is_finished)
                .map((match) => (
                  <TableRow key={match.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {match.home_team?.flag_url && (
                          <Image
                            src={match.home_team.flag_url}
                            alt={match.home_team.name}
                            width={24}
                            height={16}
                            className="rounded"
                            unoptimized
                          />
                        )}
                        {match.home_team?.name} vs {match.away_team?.name}
                        {match.away_team?.flag_url && (
                          <Image
                            src={match.away_team.flag_url}
                            alt={match.away_team.name}
                            width={24}
                            height={16}
                            className="rounded"
                            unoptimized
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">
                      {match.home_score} - {match.away_score}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// Users Tab
function UsersTab({
  profiles,
  onRefresh,
}: {
  profiles: Profile[]
  onRefresh: () => void
}) {
  const [updatingAdmin, setUpdatingAdmin] = useState<string | null>(null)
  const supabase = createClient()

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    setUpdatingAdmin(userId)
    await supabase.from('profiles').update({ is_admin: !currentStatus }).eq('id', userId)
    onRefresh()
    setUpdatingAdmin(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Usuarios Registrados ({profiles.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Puntos</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell className="font-medium">{profile.full_name || 'Sin nombre'}</TableCell>
                <TableCell>{profile.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{profile.points} pts</Badge>
                </TableCell>
                <TableCell>
                  {profile.is_admin ? (
                    <Badge className="bg-primary">Admin</Badge>
                  ) : (
                    <Badge variant="outline">Usuario</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleAdmin(profile.id, profile.is_admin)}
                    disabled={updatingAdmin === profile.id}
                  >
                    {updatingAdmin === profile.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : profile.is_admin ? (
                      'Quitar Admin'
                    ) : (
                      'Hacer Admin'
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// Teams Tab
function TeamsTab({ teams }: { teams: Team[] }) {
  // Group teams by group_letter
  const groupedTeams = teams.reduce(
    (acc, team) => {
      const group = team.group_letter || 'Sin Grupo'
      if (!acc[group]) {
        acc[group] = []
      }
      acc[group].push(team)
      return acc
    },
    {} as Record<string, Team[]>
  )

  const sortedGroups = Object.keys(groupedTeams).sort()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Equipos del Mundial ({teams.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedGroups.map((group) => (
            <div key={group} className="rounded-lg border border-border p-4">
              <h3 className="mb-3 flex items-center gap-2 font-bold">
                <Badge className="bg-primary">{group}</Badge>
                Grupo {group}
              </h3>
              <div className="space-y-2">
                {groupedTeams[group].map((team) => (
                  <div key={team.id} className="flex items-center gap-2">
                    {team.flag_url ? (
                      <Image
                        src={team.flag_url}
                        alt={team.name}
                        width={32}
                        height={20}
                        className="rounded"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-5 w-8 items-center justify-center rounded bg-muted text-xs">
                        {team.code}
                      </div>
                    )}
                    <span className="text-sm">{team.name}</span>
                    <span className="text-xs text-muted-foreground">({team.code})</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
