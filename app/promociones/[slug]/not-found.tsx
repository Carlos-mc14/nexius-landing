import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Search } from "lucide-react"

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col pt-16">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="text-8xl">🎯</div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Promoción no encontrada</h1>
            <p className="text-muted-foreground">
              La promoción que buscas no existe o ya no está disponible. Puede que haya expirado o el enlace sea
              incorrecto.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/promociones">
              <Button className="w-full sm:w-auto">
                <Search className="mr-2 h-4 w-4" />
                Ver todas las promociones
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
