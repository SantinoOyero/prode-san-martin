import { Header } from "@/components/prode/header"
import { Leaderboard } from "@/components/prode/leaderboard"

export default function RankingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-4xl tracking-wide text-foreground">Tabla de Posiciones</h1>
          <p className="text-muted-foreground mt-2">
            Mira como estan los participantes del prode.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Leaderboard />
        </div>
      </main>
    </div>
  )
}
