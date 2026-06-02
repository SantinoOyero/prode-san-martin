import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Monto de la inscripcion (en pesos). Si cambia, se toca aca.
const MONTO = 10000

// URL publica del sitio (para las vueltas de Mercado Pago y el webhook).
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://prode-san-martin.vercel.app'

export async function POST() {
  const supabase = await createClient()

  // Necesitamos saber QUE usuario esta pagando.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // El Access Token vive SOLO como variable de entorno del servidor.
  // Nunca en el codigo ni en el repo.
  const accessToken = process.env.MP_ACCESS_TOKEN
  if (!accessToken) {
    return NextResponse.json(
      { error: 'Falta configurar MP_ACCESS_TOKEN en el servidor.' },
      { status: 500 }
    )
  }

  // Preferencia de pago de Checkout Pro.
  const preference = {
    items: [
      {
        title: 'Inscripcion Prode Mundial 2026 - Club San Martin',
        quantity: 1,
        unit_price: MONTO,
        currency_id: 'ARS',
      },
    ],
    // Clave para el webhook: asi sabemos a quien marcarle el pago.
    external_reference: user.id,
    back_urls: {
      success: `${SITE_URL}/prode?pago=ok`,
      failure: `${SITE_URL}/prode?pago=error`,
      pending: `${SITE_URL}/prode?pago=pendiente`,
    },
    auto_return: 'approved',
    // Mercado Pago avisa aca cuando se confirma el pago (lo armamos en el Paso 4).
    notification_url: `${SITE_URL}/api/mp-webhook`,
    statement_descriptor: 'PRODE SAN MARTIN',
  }

  try {
    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preference),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Error creando preferencia MP:', data)
      return NextResponse.json(
        { error: 'No se pudo generar el pago.' },
        { status: 500 }
      )
    }

    // init_point: con credencial de TEST, MP redirige solo al sandbox.
    return NextResponse.json({ init_point: data.init_point })
  } catch (err) {
    console.error('Error de red con MP:', err)
    return NextResponse.json(
      { error: 'Hubo un problema al generar el pago.' },
      { status: 500 }
    )
  }
}
