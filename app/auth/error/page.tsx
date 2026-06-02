import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-destructive/20 shadow-xl">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-IkBokNnhYjLyTMtmmgq5ZPdng2bAjN.png"
              alt="Club San Martin"
              width={80}
              height={80}
              className="relative rounded-full"
            />
          </div>
          <div className="space-y-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold text-destructive">
              Error de Autenticacion
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground">
            Hubo un problema al verificar tu cuenta. Puede que el link haya expirado o ya haya sido usado.
          </p>

          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/auth/login">
                Intentar Iniciar Sesion
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/registro">
                Registrarse de Nuevo
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/">
                Volver al Inicio
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
