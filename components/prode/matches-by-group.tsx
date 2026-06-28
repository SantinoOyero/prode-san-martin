'use client'

import { MatchCard } from './match-card'
import type { MatchWithTeams, Prediction } from '@/lib/types'

interface MatchesByGroupProps {
  matches: MatchWithTeams[]
  predictions: Prediction[]
  onPredictionSaved: () => void
}

// Rondas de eliminacion directa: etiqueta visible, ficha corta y orden de aparicion.
// Listo para cargar octavos, cuartos, etc. mas adelante sin tocar nada.
const KNOCKOUT_STAGES: Record<string, { label: string; chip: string; order: number }> = {
  '16avos': { label: '16avos de Final', chip: '16', order: 100 },
  octavos: { label: 'Octavos de Final', chip: '8', order: 101 },
  cuartos: { label: 'Cuartos de Final', chip: '4', order: 102 },
  semis: { label: 'Semifinales', chip: 'SF', order: 103 },
  tercer: { label: 'Tercer Puesto', chip: '3°', order: 104 },
  final: { label: 'Final', chip: 'F', order: 105 },
}

interface Section {
  key: string
  label: string
  chip: string
  order: number
  matches: MatchWithTeams[]
}

export function MatchesByGroup({ matches, predictions, onPredictionSaved }: MatchesByGroupProps) {
  // Agrupar: por grupo (fase de grupos) o por ronda (eliminacion directa)
  const sectionsMap = matches.reduce(
    (acc, match) => {
      const knockout =
        match.stage && match.stage !== 'group' ? KNOCKOUT_STAGES[match.stage] : undefined

      let key: string
      let label: string
      let chip: string
      let order: number

      if (knockout) {
        key = `K-${match.stage}`
        label = knockout.label
        chip = knockout.chip
        order = knockout.order
      } else {
        const letter = match.group_letter || '?'
        key = `G-${letter}`
        label = `Grupo ${letter}`
        chip = letter
        order = letter.charCodeAt(0) // A..L => orden alfabetico
      }

      if (!acc[key]) {
        acc[key] = { key, label, chip, order, matches: [] }
      }
      acc[key].matches.push(match)
      return acc
    },
    {} as Record<string, Section>
  )

  // Secciones ordenadas: grupos A..L primero, despues 16avos, octavos, etc.
  const sections = Object.values(sectionsMap).sort((a, b) => a.order - b.order)

  // Dentro de cada seccion, partidos por fecha
  sections.forEach((s) =>
    s.matches.sort((a, b) => {
      const da = a.match_date ? new Date(a.match_date).getTime() : 0
      const db = b.match_date ? new Date(b.match_date).getTime() : 0
      return da - db
    })
  )

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
      {sections.map((section) => (
        <div key={section.key}>
          <h3 className="mb-4 flex items-center gap-3 text-2xl font-bold text-sm-ink">
            <span
              className="shield-chip flex h-11 w-11 items-center justify-center rounded-md font-display text-xl text-white ring-1 ring-black/20"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.65)' }}
            >
              {section.chip}
            </span>
            <span className="font-display tracking-wide text-sm-ink">{section.label}</span>
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {section.matches.map((match) => (
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
