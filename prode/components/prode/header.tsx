'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { Profile } from '@/lib/types'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, Star } from 'lucide-react'

export function Header() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(data)
      }
      setLoading(false)
    }
    getProfile()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    router.push('/')
  }

  const isActive = (path: string) => pathname === path

  const navBtn = (path: string) =>
    isActive(path)
      ? 'bg-sm-gold text-sm-ink hover:bg-sm-gold-bright font-semibold'
      : 'text-white hover:bg-white/10 hover:text-white'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-sm-gold/20 bg-sm-green-deep text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href={profile ? '/prode' : '/'} className="flex items-center gap-3">
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

        {/* Desktop */}
        <nav className="hidden items-center gap-2 md:flex">
          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-white/10" />
          ) : profile ? (
            <>
              <Link href="/prode">
                <Button variant="ghost" className={navBtn('/prode')}>
                  Mis predicciones
                </Button>
              </Link>
              <Link href="/ranking">
                <Button variant="ghost" className={navBtn('/ranking')}>
                  Ranking
                </Button>
              </Link>
              {profile.is_admin && (
                <Link href="/admin">
                  <Button variant="ghost" className={navBtn('/admin')}>
                    Admin
                  </Button>
                </Link>
              )}
              <div className="ml-1 flex items-center gap-1.5 rounded-full border border-sm-gold/40 bg-sm-gold/15 px-3 py-1.5">
                <Star className="h-3.5 w-3.5 fill-sm-gold text-sm-gold" />
                <span className="text-sm font-bold text-sm-gold">{profile.points} pts</span>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                Salir
              </Button>
            </>
          ) : (
            <>
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
            </>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="text-white md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div className="gold-rule" />

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav className="border-t border-white/10 bg-sm-green-dark px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {loading ? (
              <div className="h-9 w-full animate-pulse rounded-md bg-white/10" />
            ) : profile ? (
              <>
                <Link href="/prode" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className={`w-full justify-start ${navBtn('/prode')}`}>
                    Mis predicciones
                  </Button>
                </Link>
                <Link href="/ranking" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className={`w-full justify-start ${navBtn('/ranking')}`}>
                    Ranking
                  </Button>
                </Link>
                {profile.is_admin && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className={`w-full justify-start ${navBtn('/admin')}`}>
                      Admin
                    </Button>
                  </Link>
                )}
                <div className="flex items-center gap-2 rounded-md border border-sm-gold/40 bg-sm-gold/15 px-3 py-2">
                  <Star className="h-4 w-4 fill-sm-gold text-sm-gold" />
                  <span className="text-sm font-bold text-sm-gold">
                    {profile.points} puntos totales
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full border-white/30 bg-transparent text-white hover:bg-white/10"
                >
                  Salir
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                    Ingresar
                  </Button>
                </Link>
                <Link href="/auth/registro" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-sm-gold font-semibold text-sm-ink hover:bg-sm-gold-bright">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
