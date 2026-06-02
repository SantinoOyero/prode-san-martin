import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Cliente "admin" de Supabase: usa la SERVICE ROLE KEY (secreta, solo servidor)
// para poder escribir en la base sin sesion de usuario. El aviso de Mercado
// Pago no viene logueado, por eso necesitamos esta llave.
function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {},
      },
    }
  )
}

// Mercado Pago puede pingear con GET para validar la URL. Respondemos 200.
export async function GET() {
  return NextResponse.json({ ok: true })
}

export async function POST(request: Request) {
  const accessToken = process.env.MP_ACCESS_TOKEN
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Si falta alguna llave, avisamos por consola pero respondemos 200 para que
  // MP no quede reintentando infinito.
  if (!accessToken || !serviceKey) {
    console.error('Webhook MP: faltan MP_ACCESS_TOKEN o SUPABASE_SERVICE_ROLE_KEY')
    return NextResponse.json({ ok: true })
  }

  // El aviso puede venir por query (?type=payment&data.id=123) o en el body.
  const url = new URL(request.url)
  let body: { type?: string; topic?: string; data?: { id?: string | number } } = {}
  try {
    body = await request.json()
  } catch {
    // algunos avisos vienen sin body
  }

  const type = body.type || body.topic || url.searchParams.get('type') || url.searchParams.get('topic')
  const paymentId =
    body?.data?.id || url.searchParams.get('data.id') || url.searchParams.get('id')

  // Solo nos interesan los avisos de pago.
  if (type !== 'payment' || !paymentId) {
    return NextResponse.json({ ok: true })
  }

  try {
    // Le preguntamos a MP el estado real del pago (nunca confiamos en el aviso solo).
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const pago = await mpRes.json()

    if (!mpRes.ok) {
      console.error('Webhook MP: no se pudo leer el pago', paymentId, pago)
      return NextResponse.json({ ok: true })
    }

    const userId: string | undefined = pago.external_reference
    const aprobado = pago.status === 'approved'

    // Solo desbloqueamos si el pago esta aprobado y sabemos de que usuario es.
    if (aprobado && userId) {
      const admin = getAdminClient()

      // 1) Habilitamos al usuario.
      await admin.from('profiles').update({ pago_hecho: true }).eq('id', userId)

      // 2) Registramos el pago (si todavia no estaba registrado).
      const { data: existente } = await admin
        .from('pagos')
        .select('id')
        .eq('mp_payment_id', String(paymentId))
        .maybeSingle()

      if (!existente) {
        await admin.from('pagos').insert({
          user_id: userId,
          mp_payment_id: String(paymentId),
          estado: pago.status,
          monto: pago.transaction_amount,
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook MP: error procesando', err)
    // Devolvemos 200 igual para no entrar en bucle de reintentos.
    return NextResponse.json({ ok: true })
  }
}
