import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle2 } from "lucide-react"

export default function RegistroExitosoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-xl">
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
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">
              Registro Exitoso!
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <div className="space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Te enviamos un email de confirmacion.
            </p>
            <p className="text-sm text-muted-foreground">
              Revisa tu bandeja de entrada y hace click en el link para activar tu cuenta.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <p className="text-muted-foreground">
              Si no recibiste el email, revisa tu carpeta de spam o intenta registrarte de nuevo.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/auth/login">
                Ir a Iniciar Sesion
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
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
