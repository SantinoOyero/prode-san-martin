'use client'

import { useState, useCallback, useEffect } from 'react'
import { MatchesByGroup } from '@/components/prode/matches-by-group'
import { MatchCard } from '@/components/prode/match-card'
import { createClient } from '@/lib/supabase/client'
import type { MatchWithTeams, Prediction } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarDays } from 'lucide-react'

interface ProdeContentProps {
  initialMatches: MatchWithTeams[]
  initialPredictions: Prediction[]
  userId: string
}

export function ProdeContent({ initialMatches, initialPredictions, userId }: ProdeContentProps) {
  const [matches] = useState(initialMatches)
  const [predictions, setPredictions] = useState(initialPredictions)
  const [now, setNow] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    setNow(Date.now())
  }, [])

  const refreshPredictions = useCallback(async () => {
    const { data } = await supabase.from('predictions').select('*').eq('user_id', userId)
    if (data) {
      setPredictions(data)
    }
  }, [supabase, userId])

  // Filter matches by status. Antes del montaje (now === null) se toma como
  // pendiente todo lo no finalizado, asi el render del server y el del cliente
  // coinciden y no hay error de hydration.
  const pendingMatches = matches.filter(
    (m) =>
      !m.is_finished &&
      (!m.match_date || now === null || new Date(m.match_date).getTime() > now)
  )
  const finishedMatches = matches.filter((m) => m.is_finished)
  const allMatches = matches

  // Fecha (YYYY-MM-DD) en hora de Buenos Aires, para comparar "hoy".
  const baDate = (ms: number) =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(ms))

  // Partidos que se juegan hoy (solo en el cliente, now !== null).
  const todayMatches =
    now === null
      ? []
      : matches.filter(
          (m) => m.match_date && baDate(new Date(m.match_date).getTime()) === baDate(now)
        )

  const hoyLabel =
    now === null
      ? ''
      : new Date(now).toLocaleDateString('es-AR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          timeZone: 'America/Argentina/Buenos_Aires',
        })

  const getPrediction = (matchId: number) =>
    predictions.find((p) => p.match_id === matchId)

  return (
    <div>
      {/* ===== Partidos de hoy (solo cliente) ===== */}
      {now !== null && (
        <div className="club-card mb-8 p-5">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-sm-gold-deep" />
            <h2 className="font-display text-xl tracking-wide text-foreground">
              Partidos de hoy
            </h2>
            {hoyLabel && (
              <span className="ml-1 text-sm capitalize text-muted-foreground">· {hoyLabel}</span>
            )}
          </div>

          {todayMatches.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {todayMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  prediction={getPrediction(match.id)}
                  onPredictionSaved={refreshPredictions}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Hoy no se juegan partidos del Mundial. Mirá los próximos más abajo.
            </p>
          )}
        </div>
      )}

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pendientes ({pendingMatches.length})
          </TabsTrigger>
          <TabsTrigger value="finished">
            Finalizados ({finishedMatches.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            Todos ({allMatches.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <MatchesByGroup
            matches={pendingMatches}
            predictions={predictions}
            onPredictionSaved={refreshPredictions}
          />
        </TabsContent>

        <TabsContent value="finished">
          <MatchesByGroup
            matches={finishedMatches}
            predictions={predictions}
            onPredictionSaved={refreshPredictions}
          />
        </TabsContent>

        <TabsContent value="all">
          <MatchesByGroup
            matches={allMatches}
            predictions={predictions}
            onPredictionSaved={refreshPredictions}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
