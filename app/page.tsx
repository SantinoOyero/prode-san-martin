import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Trophy, Target, ShieldCheck, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

// Fallback con las 12 zonas y banderas, por si la base aun no tiene datos.
const allGroups = {
  A: [
    { name: 'México', code: 'MEX', flag_url: 'https://flagcdn.com/w80/mx.png' },
    { name: 'Canadá', code: 'CAN', flag_url: 'https://flagcdn.com/w80/ca.png' },
    { name: 'Ecuador', code: 'ECU', flag_url: 'https://flagcdn.com/w80/ec.png' },
    { name: 'Venezuela', code: 'VEN', flag_url: 'https://flagcdn.com/w80/ve.png' },
  ],
  B: [
    { name: 'Estados Unidos', code: 'USA', flag_url: 'https://flagcdn.com/w80/us.png' },
    { name: 'Inglaterra', code: 'ENG', flag_url: 'https://flagcdn.com/w80/gb-eng.png' },
    { name: 'Irán', code: 'IRN', flag_url: 'https://flagcdn.com/w80/ir.png' },
    { name: 'Gales', code: 'WAL', flag_url: 'https://flagcdn.com/w80/gb-wls.png' },
  ],
  C: [
    { name: 'Argentina', code: 'ARG', flag_url: 'https://flagcdn.com/w80/ar.png' },
    { name: 'Polonia', code: 'POL', flag_url: 'https://flagcdn.com/w80/pl.png' },
    { name: 'Arabia Saudita', code: 'KSA', flag_url: 'https://flagcdn.com/w80/sa.png' },
    { name: 'Australia', code: 'AUS', flag_url: 'https://flagcdn.com/w80/au.png' },
  ],
  D: [
    { name: 'Francia', code: 'FRA', flag_url: 'https://flagcdn.com/w80/fr.png' },
    { name: 'Dinamarca', code: 'DEN', flag_url: 'https://flagcdn.com/w80/dk.png' },
    { name: 'Túnez', code: 'TUN', flag_url: 'https://flagcdn.com/w80/tn.png' },
    { name: 'Perú', code: 'PER', flag_url: 'https://flagcdn.com/w80/pe.png' },
  ],
  E: [
    { name: 'España', code: 'ESP', flag_url: 'https://flagcdn.com/w80/es.png' },
    { name: 'Alemania', code: 'GER', flag_url: 'https://flagcdn.com/w80/de.png' },
    { name: 'Japón', code: 'JPN', flag_url: 'https://flagcdn.com/w80/jp.png' },
    { name: 'Costa Rica', code: 'CRC', flag_url: 'https://flagcdn.com/w80/cr.png' },
  ],
  F: [
    { name: 'Bélgica', code: 'BEL', flag_url: 'https://flagcdn.com/w80/be.png' },
    { name: 'Croacia', code: 'CRO', flag_url: 'https://flagcdn.com/w80/hr.png' },
    { name: 'Marruecos', code: 'MAR', flag_url: 'https://flagcdn.com/w80/ma.png' },
    { name: 'Camerún', code: 'CMR', flag_url: 'https://flagcdn.com/w80/cm.png' },
  ],
  G: [
    { name: 'Brasil', code: 'BRA', flag_url: 'https://flagcdn.com/w80/br.png' },
    { name: 'Suiza', code: 'SUI', flag_url: 'https://flagcdn.com/w80/ch.png' },
    { name: 'Serbia', code: 'SRB', flag_url: 'https://flagcdn.com/w80/rs.png' },
    { name: 'Nigeria', code: 'NGA', flag_url: 'https://flagcdn.com/w80/ng.png' },
  ],
  H: [
    { name: 'Portugal', code: 'POR', flag_url: 'https://flagcdn.com/w80/pt.png' },
    { name: 'Uruguay', code: 'URU', flag_url: 'https://flagcdn.com/w80/uy.png' },
    { name: 'Corea del Sur', code: 'KOR', flag_url: 'https://flagcdn.com/w80/kr.png' },
    { name: 'Ghana', code: 'GHA', flag_url: 'https://flagcdn.com/w80/gh.png' },
  ],
  I: [
    { name: 'Países Bajos', code: 'NED', flag_url: 'https://flagcdn.com/w80/nl.png' },
    { name: 'Senegal', code: 'SEN', flag_url: 'https://flagcdn.com/w80/sn.png' },
    { name: 'Qatar', code: 'QAT', flag_url: 'https://flagcdn.com/w80/qa.png' },
    { name: 'Jamaica', code: 'JAM', flag_url: 'https://flagcdn.com/w80/jm.png' },
  ],
  J: [
    { name: 'Italia', code: 'ITA', flag_url: 'https://flagcdn.com/w80/it.png' },
    { name: 'Colombia', code: 'COL', flag_url: 'https://flagcdn.com/w80/co.png' },
    { name: 'Egipto', code: 'EGY', flag_url: 'https://flagcdn.com/w80/eg.png' },
    { name: 'Panamá', code: 'PAN', flag_url: 'https://flagcdn.com/w80/pa.png' },
  ],
  K: [
    { name: 'Chile', code: 'CHI', flag_url: 'https://flagcdn.com/w80/cl.png' },
    { name: 'Paraguay', code: 'PAR', flag_url: 'https://flagcdn.com/w80/py.png' },
    { name: 'Argelia', code: 'ALG', flag_url: 'https://flagcdn.com/w80/dz.png' },
    { name: 'Nueva Zelanda', code: 'NZL', flag_url: 'https://flagcdn.com/w80/nz.png' },
  ],
  L: [
    { name: 'Austria', code: 'AUT', flag_url: 'https://flagcdn.com/w80/at.png' },
    { name: 'Ucrania', code: 'UKR', flag_url: 'https://flagcdn.com/w80/ua.png' },
    { name: 'Honduras', code: 'HON', flag_url: 'https://flagcdn.com/w80/hn.png' },
    { name: 'Indonesia', code: 'IDN', flag_url: 'https://flagcdn.com/w80/id.png' },
  ],
}

type LandingTeam = { name: string; code: string; flag_url: string | null }

function Flag({ team, size = 'md' }: { team: LandingTeam; size?: 'sm' | 'md' }) {
  const dims = size === 'sm' ? 'h-5 w-7' : 'h-6 w-9'
  return (
    <div
      className={`relative ${dims} shrink-0 overflow-hidden rounded-[3px] shadow-sm ring-1 ring-black/10`}
    >
      {team.flag_url ? (
        <Image src={team.flag_url} alt={team.name} fill className="object-cover" unoptimized />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted text-[9px] font-bold">
          {team.code}
        </div>
      )}
    </div>
  )
}

export default async function Home() {
  const supabase = await createClient()

  const { data: teams } = await supabase
    .from('teams')
    .select('*')
    .order('group_letter')
    .order('name')

  const groupedTeams =
    teams?.reduce(
      (acc, team) => {
        const group = team.group_letter
        if (!group) return acc
        if (!acc[group]) acc[group] = []
        acc[group].push(team)
        return acc
      },
      {} as Record<string, LandingTeam[]>
    ) || {}

  const displayGroups: Record<string, LandingTeam[]> =
    Object.keys(groupedTeams).length >= 12 ? groupedTeams : (allGroups as Record<string, LandingTeam[]>)

  return (
    <div className="min-h-screen bg-background">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-50 border-b border-sm-gold/20 bg-sm-green-deep text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/club-san-martin-logo.png"
              alt="Club San Martín"
              width={40}
              height={40}
              className="h-10 w-10 object-contain drop-shadow"
              unoptimized
            />
            <div className="leading-none">
              <span className="font-display text-lg tracking-wide text-white">Prode 2026</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-sm-gold">
                Club San Martín
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                Ingresar
              </Button>
            </Link>
            <Link href="/auth/registro">
              <Button className="bg-sm-gold font-semibold text-sm-ink hover:bg-sm-gold-bright">
                Registrarse
              </Button>
            </Link>
          </div>
        </div>
        <div className="gold-rule" />
      </header>

      {/* ===== Hero ===== */}
      <section className="hero-heraldic relative overflow-hidden text-white">
        <div className="stripe-texture absolute inset-0" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:py-28">
          <div className="rise-in mx-auto mb-8 flex h-32 w-32 items-center justify-center">
            <Image
              src="/images/club-san-martin-logo.png"
              alt="Club San Martín"
              width={128}
              height={128}
              className="h-32 w-32 object-contain drop-shadow-[0_8px_30px_rgba(231,181,63,0.45)]"
              unoptimized
            />
          </div>

          <span
            className="rise-in mb-5 inline-block rounded-full border border-sm-gold/40 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-sm-gold"
            style={{ animationDelay: '0.1s' }}
          >
            Prode oficial del club
          </span>

          <h1
            className="rise-in font-display text-5xl leading-[0.9] text-white sm:text-7xl lg:text-8xl"
            style={{ animationDelay: '0.18s' }}
          >
            Prode Mundial
            <br />
            <span className="text-sm-gold drop-shadow">20</span>
            <span className="text-white">26</span>
          </h1>

          <p
            className="rise-in mx-auto mt-6 max-w-2xl text-pretty text-lg text-white/80"
            style={{ animationDelay: '0.26s' }}
          >
            Predecí los resultados de las 48 selecciones, competí contra tus compañeros del club y
            ayudá a bancar la gira. Cada pronóstico suma.
          </p>

          <div
            className="rise-in mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: '0.34s' }}
          >
            <Link href="/auth/registro">
              <Button
                size="lg"
                className="min-w-[210px] bg-sm-gold text-base font-bold text-sm-ink shadow-lg hover:bg-sm-gold-bright"
              >
                Participar ahora
                <ArrowRight className="ml-1 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="min-w-[210px] border-white/40 bg-transparent text-base font-semibold text-white hover:bg-white/10 hover:text-white"
              >
                Ya tengo cuenta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Cómo funciona ===== */}
      <section className="border-b border-border bg-sm-cream py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl text-foreground sm:text-4xl">Cómo funciona</h2>
            <div className="gold-rule mx-auto mt-3 w-24" />
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                n: '1',
                bg: 'bg-sm-green',
                title: 'Registrate',
                text: 'Creá tu cuenta con tu email, pagá la inscripción de 15000 pesos y entrás al prode oficial del club.',
              },
              {
                n: '2',
                bg: 'bg-sm-blue',
                title: 'Predecí',
                text: 'Cargá tu pronóstico de cada partido hasta 1 hora antes de que arranque.',
              },
              {
                n: '3',
                bg: 'bg-sm-gold-deep',
                title: 'Competí',
                text: 'Sumá puntos, subí en la tabla y peleá por los premios.',
              },
            ].map((step) => (
              <div key={step.n} className="flex flex-col items-center text-center">
                <div
                  className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${step.bg} font-display text-2xl text-white ring-4 ring-white shadow-lg`}
                >
                  {step.n}
                </div>
                <h3 className="font-display text-xl tracking-wide text-foreground">{step.title}</h3>
                <p className="mt-2 text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Sistema de puntos ===== */}
      <section className="border-b border-border bg-background py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl text-foreground sm:text-4xl">Sistema de puntos</h2>
            <div className="gold-rule mx-auto mt-3 w-24" />
          </div>

          <div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">
            <div className="club-card p-7 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sm-green/10">
                <Target className="h-8 w-8 text-sm-green" />
              </div>
              <div className="font-display text-6xl leading-none text-sm-green">10</div>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-sm-gold-deep">
                Puntos
              </p>
              <p className="mt-3 font-semibold text-foreground">Resultado exacto</p>
              <p className="mt-1 text-sm text-muted-foreground">Pronosticás 2-1 y sale 2-1.</p>
            </div>

            <div className="club-card p-7 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sm-blue/10">
                <Trophy className="h-8 w-8 text-sm-blue" />
              </div>
              <div className="font-display text-6xl leading-none text-sm-blue">5</div>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-sm-gold-deep">
                Puntos
              </p>
              <p className="mt-3 font-semibold text-foreground">Ganador o empate</p>
              <p className="mt-1 text-sm text-muted-foreground">Le pegás al resultado, no al marcador.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Grupos con banderas ===== */}
      <section className="border-b border-border bg-sm-cream py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl text-foreground sm:text-4xl">
              Las 12 zonas del Mundial
            </h2>
            <p className="mt-2 text-muted-foreground">48 selecciones, 48 banderas, una sola gloria.</p>
            <div className="gold-rule mx-auto mt-3 w-24" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Object.entries(displayGroups).map(([group, teamsInGroup]) => (
              <div key={group} className="club-card transition-transform hover:-translate-y-1">
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <span
                    className="shield-chip flex h-10 w-10 items-center justify-center rounded-md font-display text-lg text-white ring-1 ring-black/20"
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.65)' }}
                  >
                    {group}
                  </span>
                  <span className="font-display text-xl tracking-wide text-sm-ink">
                    Grupo {group}
                  </span>
                </div>
                <ul className="divide-y divide-border/70">
                  {teamsInGroup.map((team) => (
                    <li key={team.code} className="flex items-center gap-3 px-4 py-2.5">
                      <Flag team={team} />
                      <span className="text-sm font-medium text-foreground">{team.name}</span>
                      <span className="ml-auto text-[10px] font-bold tracking-widest text-muted-foreground">
                        {team.code}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="hero-heraldic relative overflow-hidden">
        <div className="stripe-texture absolute inset-0" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center text-white">
          <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-sm-gold" />
          <h2 className="font-display text-3xl sm:text-4xl">No te quedes afuera</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            El Mundial 2026 está por arrancar. Registrate y empezá a sumar desde el primer partido.
          </p>
          <Link href="/auth/registro">
            <Button
              size="lg"
              className="mt-7 bg-sm-gold text-base font-bold text-sm-ink hover:bg-sm-gold-bright"
            >
              Crear mi cuenta
              <ArrowRight className="ml-1 h-5 w-5" />
            </Button>
          </Link>
        </div>
        <div className="gold-rule" />
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-sm-green-deep py-10 text-center text-white">
        <Image
          src="/images/club-san-martin-logo.png"
          alt="Club San Martín"
          width={56}
          height={56}
          className="mx-auto h-14 w-14 object-contain"
          unoptimized
        />
        <p className="mt-3 font-display tracking-wide text-sm-gold">Club San Martín</p>
        <p className="mt-1 text-sm text-white/70">Prode Mundial 2026</p>
        <p className="mx-auto mt-3 max-w-md px-4 text-xs text-white/50">
          Todos los fondos recaudados nos ayudan a irnos de gira a Sudáfrica.
        </p>
      </footer>
    </div>
  )
}
