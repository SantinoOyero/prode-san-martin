'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Trophy, Target, ShieldCheck } from 'lucide-react'

// Monto de la inscripcion (en pesos). Si algun dia cambia, se toca aca.
const MONTO_ARS = 10000

interface PagoGateProps {
  nombre?: string | null
}

export function PagoGate({ nombre }: PagoGateProps) {
  const [loading, setLoading] = useState(false)

  const handlePagar = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/crear-pago', { method: 'POST' })
      const data = await res.json()
      if (data.init_point) {
        // Redirige al checkout de Mercado Pago (QR o tarjeta).
        window.location.href = data.init_point
      } else {
        alert(data.error || 'No se pudo generar el pago. Intentá de nuevo.')
        setLoading(false)
      }
    } catch {
      alert('Hubo un problema al generar el pago. Intentá de nuevo.')
      setLoading(false)
    }
  }

  const montoTexto = MONTO_ARS.toLocaleString('es-AR')

  return (
    <div className="mx-auto max-w-xl">
      <Card className="club-card overflow-hidden">
        {/* Encabezado del club, compacto (igual que el footer del sitio) */}
        <div className="bg-sm-green-deep px-6 py-5 text-center">
          <Image
            src="/images/club-san-martin-logo.png"
            alt="Club San Martín"
            width={44}
            height={44}
            className="mx-auto h-11 w-11 object-contain drop-shadow"
            unoptimized
          />
          <p className="mt-2 font-display text-base tracking-wide text-sm-gold">Club San Martín</p>
          <p className="text-xs text-white/75">Prode Mundial 2026</p>
          <p className="mx-auto mt-1.5 max-w-xs text-[11px] leading-snug text-white/60">
            Todos los fondos recaudados nos ayudan a irnos de gira a Sudáfrica.
          </p>
        </div>

        <CardContent className="p-6">
          {/* Titulo de la accion */}
          <div className="mb-5 text-center">
            <h2 className="font-display text-2xl tracking-wide text-sm-ink">Pagá para jugar</h2>
            {nombre && (
              <p className="mt-1 text-sm text-muted-foreground">
                Hola {nombre}, activá tu lugar en el prode.
              </p>
            )}
          </div>

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
