import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MemberNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Miembro no encontrado</h1>
        <p className="text-gray-500 max-w-md mx-auto">
          Lo sentimos, no pudimos encontrar el miembro del equipo que estás buscando.
        </p>
        <Link href="/equipo">
          <Button className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al equipo
          </Button>
        </Link>
      </div>
    </main>
  )
}

