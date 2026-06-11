'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { MatchWithTeams, Prediction } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Check, Clock, Trophy, Lock } from 'lucide-react'

// El prode cierra esta cantidad de tiempo ANTES del horario del partido.
const CIERRE_ANTES_MS = 60 * 60 * 1000 // 1 hora

// Devuelve un texto corto tipo "2d 3h" / "5h 20m" / "12m" con lo que falta.
function formatearFalta(ms: number): string {
  const totalMin = Math.floor(ms / 60000)
  const dias = Math.floor(totalMin / 1440)
  const horas = Math.floor((totalMin % 1440) / 60)
  const mins = totalMin % 60
  if (dias > 0) return `${dias}d ${horas}h`
  if (horas > 0) return `${horas}h ${mins}m`
  return `${mins}m`
}

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
  // Recuerda el ultimo resultado guardado, para no guardar de mas y para el autoguardado.
  const lastSavedRef = useRef<string>(
    prediction ? `${prediction.home_score}-${prediction.away_score}` : ''
  )
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

  // Sincroniza esta tarjeta cuando la prediccion cambia desde AFUERA, es decir
  // cuando el mismo partido se edito en otra seccion (ej: "Partidos de hoy" y
  // su grupo muestran el mismo partido). Si el cambio no vino de esta tarjeta,
  // re-cargamos los casilleros para que las dos muestren siempre lo mismo.
  useEffect(() => {
    const combo = prediction ? `${prediction.home_score}-${prediction.away_score}` : ''
    if (combo !== lastSavedRef.current) {
      setHomeScore(prediction?.home_score?.toString() ?? '')
      setAwayScore(prediction?.away_score?.toString() ?? '')
      lastSavedRef.current = combo
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prediction])

  // El partido cierra 1 hora antes del horario. Calculamos contra "ahora"
  // solo en el cliente (now !== null) para no romper la hydration.
  const matchTime = match.match_date ? new Date(match.match_date).getTime() : null
  const closeTime = matchTime !== null ? matchTime - CIERRE_ANTES_MS : null

  const isClosed =
    now !== null && closeTime !== null ? now >= closeTime : false

  const canPredict = !isClosed && !match.is_finished

  // Texto de cuanto falta para el cierre (solo si esta abierto).
  const faltaParaCierre =
    now !== null && closeTime !== null && now < closeTime
      ? formatearFalta(closeTime - now)
      : null

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
      lastSavedRef.current = `${parseInt(homeScore)}-${parseInt(awayScore)}`
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onPredictionSaved()
    }

    setSaving(false)
  }

  // Autoguardado: si completaste los dos casilleros y no le diste a "Guardar",
  // a los ~2 segundos se guarda solo. Despues lo podes cambiar y se vuelve a
  // guardar. Asi nadie pierde su pronostico por olvidarse de apretar el boton.
  useEffect(() => {
    if (!canPredict) return
    if (homeScore === '' || awayScore === '') return
    const combo = `${parseInt(homeScore)}-${parseInt(awayScore)}`
    if (combo === lastSavedRef.current) return
    const t = setTimeout(() => {
      handleSavePrediction()
    }, 2000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeScore, awayScore, canPredict])

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
      {/* Estado / cuenta regresiva (arriba a la derecha) */}
      <div className="absolute right-2 top-2">
        {match.is_finished ? (
          <Badge className="bg-muted text-muted-foreground">Finalizado</Badge>
        ) : now === null ? (
          <Badge variant="outline" className="border-sm-green/40 text-sm-green">
            <Clock className="mr-1 h-3 w-3" />
            Pendiente
          </Badge>
        ) : isClosed ? (
          <Badge className="bg-muted text-muted-foreground">
            <Lock className="mr-1 h-3 w-3" />
            Cerrado
          </Badge>
        ) : (
          <Badge variant="outline" className="border-sm-gold/60 bg-sm-gold/10 text-sm-gold-deep">
            <Clock className="mr-1 h-3 w-3" />
            Cierra en {faltaParaCierre}
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
        <p className="mb-1 text-center text-sm font-medium text-foreground">
          {formatMatchDate(match.match_date)}
        </p>
        {canPredict && (
          <p className="mb-4 text-center text-xs text-muted-foreground/70">
            Cierra 1 h antes (hora de Buenos Aires)
          </p>
        )}
        {!canPredict && <div className="mb-4" />}

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
            <span className="flex min-h-[2.6em] items-center justify-center text-center text-sm font-medium leading-tight text-foreground">
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
            <span className="flex min-h-[2.6em] items-center justify-center text-center text-sm font-medium leading-tight text-foreground">
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
