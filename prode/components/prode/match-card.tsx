'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { MatchWithTeams, Prediction } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Check, Clock, Trophy } from 'lucide-react'

interface MatchCardProps {
  match: MatchWithTeams
  prediction?: Prediction
  onPredictionSaved: () => void
}

export function MatchCard({ match, prediction, onPredictionSaved }: MatchCardProps) {
  const [homeScore, setHomeScore] = useState<string>(prediction?.home_score?.toString() ?? '')
  const [awayScore, setAwayScore] = useState<string>(prediction?.away_score?.toString() ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [now, setNow] = useState<number | null>(null)
  const supabase = createClient()

  // Se calcula la hora actual solo en el cliente (despues del montaje) para
  // que el render del servidor y el primer render del cliente coincidan y no
  // haya error de hydration. Se actualiza cada minuto para ir bloqueando
  // partidos que arrancan.
  useEffect(() => {
    setNow(Date.now())
    const interval = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(interval)
  }, [])

  const isMatchStarted =
    now !== null && match.match_date
      ? new Date(match.match_date).getTime() <= now
      : false

  const canPredict = !isMatchStarted && !match.is_finished

  const handleSavePrediction = async () => {
    if (!homeScore || !awayScore) return

    setSaving(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setSaving(false)
      return
    }

    const { error } = await supabase.from('predictions').upsert(
      {
        user_id: user.id,
        match_id: match.id,
        home_score: parseInt(homeScore),
        away_score: parseInt(awayScore),
      },
      { onConflict: 'user_id,match_id' }
    )

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onPredictionSaved()
    }

    setSaving(false)
  }

  const formatMatchDate = (dateString: string | null) => {
    if (!dateString) return 'Fecha por definir'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-AR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Argentina/Buenos_Aires',
    })
  }

  const getPointsEarned = () => {
    if (!prediction || !match.is_finished) return null
    return prediction.points_earned
  }

  const pointsEarned = getPointsEarned()

  return (
    <Card
      className={`club-card relative transition-all ${
        match.is_finished
          ? 'opacity-95'
          : canPredict
            ? 'hover:-translate-y-0.5 hover:shadow-md'
            : ''
      }`}
    >
      {/* Match Status Badge */}
      <div className="absolute right-2 top-2">
        {match.is_finished ? (
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            Finalizado
          </Badge>
        ) : isMatchStarted ? (
          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
            En juego
          </Badge>
        ) : (
          <Badge variant="outline" className="border-primary/50 text-primary">
            <Clock className="mr-1 h-3 w-3" />
            Pendiente
          </Badge>
        )}
      </div>

      {/* Points Earned */}
      {pointsEarned !== null && (
        <div className="absolute left-2 top-2">
          <Badge
            className={
              pointsEarned === 10
                ? 'bg-sm-gold text-sm-ink'
                : pointsEarned > 0
                  ? 'bg-sm-blue text-white'
                  : 'bg-muted text-muted-foreground'
            }
          >
            <Trophy className="mr-1 h-3 w-3" />
            {pointsEarned} pts
          </Badge>
        </div>
      )}

      <CardContent className="p-4 pt-10">
        {/* Match Date */}
        <p className="mb-4 text-center text-sm text-muted-foreground">
          {formatMatchDate(match.match_date)}
        </p>

        {/* Teams */}
        <div className="flex items-center justify-between gap-4">
          {/* Home Team */}
          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="relative h-12 w-16 overflow-hidden rounded-md border border-border shadow-sm">
              {match.home_team.flag_url ? (
                <Image
                  src={match.home_team.flag_url}
                  alt={match.home_team.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-xs">
                  {match.home_team.code}
                </div>
              )}
            </div>
            <span className="text-center text-sm font-medium text-foreground">
              {match.home_team.name}
            </span>
          </div>

          {/* Score Inputs */}
          <div className="flex items-center gap-2">
            {canPredict ? (
              <>
                <Input
                  type="number"
                  min="0"
                  max="99"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  className="h-12 w-14 text-center text-xl font-bold"
                  placeholder="-"
                />
                <span className="text-xl font-bold text-muted-foreground">-</span>
                <Input
                  type="number"
                  min="0"
                  max="99"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  className="h-12 w-14 text-center text-xl font-bold"
                  placeholder="-"
                />
              </>
            ) : (
              <>
                <div className="flex h-12 w-14 items-center justify-center rounded-md border border-border bg-muted text-xl font-bold">
                  {match.is_finished ? match.home_score : prediction?.home_score ?? '-'}
                </div>
                <span className="text-xl font-bold text-muted-foreground">-</span>
                <div className="flex h-12 w-14 items-center justify-center rounded-md border border-border bg-muted text-xl font-bold">
                  {match.is_finished ? match.away_score : prediction?.away_score ?? '-'}
                </div>
              </>
            )}
          </div>

          {/* Away Team */}
          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="relative h-12 w-16 overflow-hidden rounded-md border border-border shadow-sm">
              {match.away_team.flag_url ? (
                <Image
                  src={match.away_team.flag_url}
                  alt={match.away_team.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-xs">
                  {match.away_team.code}
                </div>
              )}
            </div>
            <span className="text-center text-sm font-medium text-foreground">
              {match.away_team.name}
            </span>
          </div>
        </div>

        {/* Prediction Display when match finished */}
        {match.is_finished && prediction && (
          <div className="mt-4 rounded-md bg-muted/50 p-2 text-center">
            <p className="text-xs text-muted-foreground">
              Tu prediccion: {prediction.home_score} - {prediction.away_score}
            </p>
          </div>
        )}

        {/* Save Button */}
        {canPredict && (
          <Button
            onClick={handleSavePrediction}
            disabled={!homeScore || !awayScore || saving}
            className="mt-4 w-full"
            variant={saved ? 'secondary' : 'default'}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : saved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Guardado
              </>
            ) : prediction ? (
              'Actualizar Prediccion'
            ) : (
              'Guardar Prediccion'
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
