"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Medal, Award, Crown } from "lucide-react"
import Image from "next/image"

interface LeaderboardEntry {
  id: string
  email: string
  full_name: string | null
  points: number
}

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchLeaderboard() {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, points")
        .order("points", { ascending: false })
        .limit(20)

      if (!error && data) {
        setEntries(data)
      }
      setLoading(false)
    }

    fetchLeaderboard()
  }, [supabase])

  const getRankIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 1:
        return <Trophy className="h-5 w-5 text-gray-400" />
      case 2:
        return <Medal className="h-5 w-5 text-amber-700" />
      default:
        return <span className="w-6 text-center font-bold text-muted-foreground">{position + 1}</span>
    }
  }

  const getRankStyle = (position: number) => {
    switch (position) {
      case 0:
        return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 dark:from-yellow-900/20 dark:to-amber-900/20 dark:border-yellow-700"
      case 1:
        return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300 dark:from-gray-800/50 dark:to-slate-800/50 dark:border-gray-600"
      case 2:
        return "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300 dark:from-orange-900/20 dark:to-amber-900/20 dark:border-orange-700"
      default:
        return "bg-card border-border"
    }
  }

  if (loading) {
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2 font-display tracking-wide text-primary">
            <Trophy className="h-5 w-5" />
            Tabla de Posiciones
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (entries.length === 0) {
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2 font-display tracking-wide text-primary">
            <Trophy className="h-5 w-5" />
            Tabla de Posiciones
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Award className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Todavia no hay participantes registrados.
            </p>
            <p className="text-sm text-muted-foreground/70">
              Se el primero en participar del prode!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-primary/20 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/10">
        <CardTitle className="flex items-center gap-2 font-display tracking-wide text-primary">
          <Trophy className="h-5 w-5" />
          Tabla de Posiciones
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center gap-4 rounded-lg border-2 p-3 transition-all hover:shadow-md ${getRankStyle(index)}`}
            >
              <div className="flex h-10 w-10 items-center justify-center">
                {getRankIcon(index)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {entry.full_name || entry.email.split("@")[0]}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {entry.email}
                </p>
              </div>

              <div className="flex flex-col items-end">
                <span className={`text-xl font-bold ${index === 0 ? "text-yellow-600 dark:text-yellow-400" : "text-primary"}`}>
                  {entry.points}
                </span>
                <span className="text-xs text-muted-foreground">puntos</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
