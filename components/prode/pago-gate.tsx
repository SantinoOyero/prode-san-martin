'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Lock, Trophy, Target, ShieldCheck } from 'lucide-react'

// Monto de la inscripcion (en pesos). Si algun dia cambia, se toca aca.
const MONTO_ARS = 10000

interface PagoGateProps {
  nombre?: string | null
}

export function PagoGate({ nombre }: PagoGateProps) {
  const [loading, setLoading] = useState(false)

  const handlePagar = async () => {
    setLoading(true)
    // En el Paso 3 esto va a llamar a nuestra API que crea el pago en
    // Mercado Pago y redirige al checkout. Por ahora es un placeholder.
    alert('El pago con Mercado Pago se conecta en el proximo paso 👍')
    setLoading(false)
  }

  const montoTexto = MONTO_ARS.toLocaleString('es-AR')

  return (
    <div className="mx-auto max-w-xl">
      <Card className="club-card overflow-hidden">
        {/* Franja superior con el escudo del club */}
        <div className="hero-heraldic stripe-texture px-6 py-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30">
            <Lock className="h-7 w-7 text-white" />
          </div>
          <h2 className="font-display text-2xl tracking-wide text-white sm:text-3xl">
            Pagá para jugar
          </h2>
          <p className="mt-1 text-sm text-white/80">
            {nombre ? `Hola ${nombre}, ` : ''}activá tu lugar en el prode del club
          </p>
        </div>

        <CardContent className="p-6">
          {/* Monto */}
          <div className="mb-6 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-sm-gold-deep">
              Inscripción
            </p>
            <div className="mt-1 font-display text-5xl leading-none text-sm-ink">
              ${montoTexto}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Un único pago para participar de todo el Mundial.
            </p>
          </div>

          {/* Beneficios */}
          <div className="mb-6 space-y-3">
            <div className="flex items-start gap-3">
              <Target className="mt-0.5 h-5 w-5 shrink-0 text-sm-green" />
              <p className="text-sm text-foreground">
                Cargá tu pronóstico de los 72 partidos de la fase de grupos.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-sm-blue" />
              <p className="text-sm text-foreground">
                Sumá puntos, subí en la tabla y peleá por los premios.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sm-gold-deep" />
              <p className="text-sm text-foreground">
                Pago seguro con Mercado Pago (QR o tarjeta).
              </p>
            </div>
          </div>

          {/* Botón de pago */}
          <Button
            onClick={handlePagar}
            disabled={loading}
            className="h-12 w-full bg-sm-blue text-base font-bold hover:bg-sm-blue/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generando pago...
              </>
            ) : (
              <>Pagar con Mercado Pago</>
            )}
          </Button>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Una vez confirmado el pago, se te habilita el prode automáticamente.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
