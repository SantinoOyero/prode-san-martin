'use client'

import { useEffect, useState } from 'react'

type BIPEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallAppButton() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [standalone, setStandalone] = useState(false)
  const [showIOSHelp, setShowIOSHelp] = useState(false)

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    setStandalone(isStandalone)

    const ua = window.navigator.userAgent.toLowerCase()
    setIsIOS(/iphone|ipad|ipod/.test(ua))

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BIPEvent)
    }
    const onInstalled = () => setDeferred(null)

    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  // Ya está instalada: no mostramos nada
  if (standalone) return null

  const handleInstall = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
  }

  // Android / Chrome desktop: instalador nativo disponible
  if (deferred) {
    return (
      <button
        onClick={handleInstall}
        className="inline-flex items-center gap-2 rounded-xl bg-[#e7b53f] px-5 py-3 font-bold text-[#062812] shadow-md transition hover:brightness-105"
      >
        📲 Instalá la app
      </button>
    )
  }

  // iPhone (Safari): no hay instalador nativo, mostramos instrucciones
  if (isIOS) {
    return (
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => setShowIOSHelp((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl border border-[#e7b53f] px-5 py-3 font-bold text-[#e7b53f] transition hover:bg-[#e7b53f]/10"
        >
          📲 Instalá la app
        </button>
        {showIOSHelp && (
          <p className="max-w-xs text-center text-sm text-white/80">
            En iPhone: tocá el botón <strong>Compartir</strong> y después{' '}
            <strong>«Agregar a inicio»</strong>. (Tiene que ser desde Safari.)
          </p>
        )}
      </div>
    )
  }

  // En otros navegadores el botón nativo puede no estar disponible aún
  return null
}
