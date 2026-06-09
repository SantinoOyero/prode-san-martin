'use client'

import { useEffect, useState } from 'react'

type Platform = 'android' | 'ios'

const STEPS: Record<Platform, { title: string; steps: string[] }> = {
  android: {
    title: 'Instalar en Android',
    steps: [
      'Abrí Chrome',
      'Tocá el menú ⋮ (tres puntos arriba a la derecha)',
      'Seleccioná «Agregar a pantalla de inicio»',
      'Confirmá tocando «Agregar»',
    ],
  },
  ios: {
    title: 'Instalar en iPhone',
    steps: [
      'Abrí Safari',
      'Tocá el botón Compartir (cuadrado con flecha ↑)',
      'Deslizá y seleccioná «Agregar a inicio»',
      'Tocá «Agregar»',
    ],
  },
}

const DISMISS_KEY = 'prode-install-dismissed'

export function InstallBanner() {
  const [hidden, setHidden] = useState(true)
  const [modal, setModal] = useState<Platform | null>(null)

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true

    let dismissed = false
    try {
      dismissed = window.localStorage.getItem(DISMISS_KEY) === '1'
    } catch {
      // localStorage no disponible: igual mostramos el banner
    }

    setHidden(standalone || dismissed)
  }, [])

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // ignorar
    }
    setHidden(true)
  }

  if (hidden) return null

  return (
    <>
      {/* Banner */}
      <div className="relative mb-6 flex flex-col gap-3 rounded-2xl border border-[#e7b53f]/45 bg-[#062d12]/70 p-5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={dismiss}
          aria-label="Cerrar"
          className="absolute right-3 top-3 text-white/50 transition hover:text-white"
        >
          ✕
        </button>

        <div className="pr-6">
          <h3 className="font-bold text-[#e7b53f]">Instalá el prode en tu inicio</h3>
          <p className="text-sm text-white/80">Accedé más rápido sin abrir el navegador</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setModal('android')}
            className="rounded-lg border border-[#e7b53f]/60 px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e7b53f]/10"
          >
            Android
          </button>
          <button
            onClick={() => setModal('ios')}
            className="rounded-lg border border-[#e7b53f]/60 px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e7b53f]/10"
          >
            iPhone
          </button>
        </div>
      </div>

      {/* Modal con el paso a paso */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setModal(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl border border-[#e7b53f]/50 bg-[#06240f] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModal(null)}
              aria-label="Cerrar"
              className="absolute right-4 top-4 text-white/50 transition hover:text-white"
            >
              ✕
            </button>

            <h3 className="mb-5 text-lg font-bold text-[#e7b53f]">{STEPS[modal].title}</h3>

            <ol className="flex flex-col gap-4">
              {STEPS[modal].steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full border border-[#e7b53f] text-sm font-bold text-[#e7b53f]">
                    {i + 1}
                  </span>
                  <span className="pt-0.5 text-white/90">{step}</span>
                </li>
              ))}
            </ol>

            <button
              onClick={() => setModal(null)}
              className="mt-6 w-full rounded-lg bg-[#0f7a30] py-3 font-bold text-white transition hover:brightness-110"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  )
}
