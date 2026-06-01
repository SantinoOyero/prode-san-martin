'use client'

import { useState, useCallback, useEffect } from 'react'
import { MatchesByGroup } from '@/components/prode/matches-by-group'
import { createClient } from '@/lib/supabase/client'
import type { MatchWithTeams, Prediction } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

  return (
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
  )
}
