'use client'

import { MatchCard } from './match-card'
import type { MatchWithTeams, Prediction } from '@/lib/types'

interface MatchesByGroupProps {
  matches: MatchWithTeams[]
  predictions: Prediction[]
  onPredictionSaved: () => void
}

export function MatchesByGroup({ matches, predictions, onPredictionSaved }: MatchesByGroupProps) {
  // Group matches by group_letter
  const groupedMatches = matches.reduce(
    (acc, match) => {
      const group = match.group_letter || 'Sin Grupo'
      if (!acc[group]) {
        acc[group] = []
      }
      acc[group].push(match)
      return acc
    },
    {} as Record<string, MatchWithTeams[]>
  )

  // Sort groups alphabetically
  const sortedGroups = Object.keys(groupedMatches).sort()

  const getPredictionForMatch = (matchId: number) => {
    return predictions.find((p) => p.match_id === matchId)
  }

  if (matches.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-muted p-12 text-center">
        <p className="text-lg text-muted-foreground">
          No hay partidos disponibles todavia.
        </p>
        <p className="mt-2 text-sm text-muted-foreground/70">
          El administrador agregara los partidos proximamente.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {sortedGroups.map((group) => (
        <div key={group}>
          <h3 className="mb-4 flex items-center gap-3 text-2xl font-bold text-sm-ink">
            <span
              className="shield-chip flex h-11 w-11 items-center justify-center rounded-md font-display text-xl text-white ring-1 ring-black/20"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.65)' }}
            >
              {group}
            </span>
            <span className="font-display tracking-wide text-sm-ink">Grupo {group}</span>
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groupedMatches[group].map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                prediction={getPredictionForMatch(match.id)}
                onPredictionSaved={onPredictionSaved}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
