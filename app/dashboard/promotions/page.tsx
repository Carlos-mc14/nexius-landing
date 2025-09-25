"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Eye, Clock, Calendar, Package } from "lucide-react"
import { deletePromotion, getPromotions, getTimeRemaining, isPromotionValid } from "@/lib/promotions-client"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export const dynamic = "force-dynamic"

export default function PromotionsDashboardPage() {
  const [allPromotions, setAllPromotions] = useState<any[]>([])
  const [activePromotions, setActivePromotions] = useState<any[]>([])
  const [inactivePromotions, setInactivePromotions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true)
        const promotions = await getPromotions()
        setAllPromotions(promotions)
        setActivePromotions(promotions.filter((promotion) => promotion.status === "active"))
        setInactivePromotions(promotions.filter((promotion) => promotion.status === "inactive"))
      } catch (err) {
        console.error("Error fetching promotions:", err)
        setError("No se pudieron cargar las promociones")
      } finally {
        setLoading(false)
      }
    }

    fetchPromotions()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold tracking-tight">Error</h3>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => router.refresh()}>Intentar de nuevo</Button>
      </div>
    )
  }

  const handlePromotionDeleted = (deletedPromotionId: string) => {
    setAllPromotions((prevPromotions) => prevPromotions.filter((promotion) => promotion.id !== deletedPromotionId))
    setActivePromotions((prevPromotions) => prevPromotions.filter((promotion) => promotion.id !== deletedPromotionId))
    setInactivePromotions((prevPromotions) => prevPromotions.filter((promotion) => promotion.id !== deletedPromotionId))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Gestión de Promociones</h3>
          <p className="text-muted-foreground">Administra las promociones y ofertas especiales.</p>
        </div>
        <Link href="/dashboard/promotions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva promoción
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Todas ({allPromotions.length})</TabsTrigger>
          <TabsTrigger value="active">Activas ({activePromotions.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactivas ({inactivePromotions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {allPromotions.map((promotion) => (
              <PromotionCard key={promotion.id} promotion={promotion} onDeleted={handlePromotionDeleted} />
            ))}

            {allPromotions.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No hay promociones disponibles.</p>
                <Link href="/dashboard/promotions/new" className="mt-4 inline-block">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear nueva promoción
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {activePromotions.map((promotion) => (
              <PromotionCard key={promotion.id} promotion={promotion} onDeleted={handlePromotionDeleted} />
            ))}

            {activePromotions.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No hay promociones activas.</p>
                <Link href="/dashboard/promotions/new" className="mt-4 inline-block">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear nueva promoción
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {inactivePromotions.map((promotion) => (
              <PromotionCard key={promotion.id} promotion={promotion} onDeleted={handlePromotionDeleted} />
            ))}

            {inactivePromotions.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No hay promociones inactivas.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PromotionCard({ promotion, onDeleted }: { promotion: any; onDeleted: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deletePromotion(promotion.id)
      toast({
        title: "Promoción eliminada",
        description: `La promoción "${promotion.title}" ha sido eliminada correctamente.`,
      })
      onDeleted(promotion.id)
    } catch (error) {
      console.error("Error al eliminar la promoción:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la promoción. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setOpen(false)
    }
  }

  const timeRemaining = getTimeRemaining(promotion.endDate)
  const isValid = isPromotionValid(promotion)
  const isExpired = timeRemaining.total <= 0

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="aspect-video relative">
        <Image
          src={
            promotion.coverImage || `/placeholder.svg?height=300&width=400&text=${encodeURIComponent(promotion.title)}`
          }
          alt={promotion.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge variant={promotion.status === "active" ? "secondary" : "outline"}>
            {promotion.status === "active" ? "Activa" : "Inactiva"}
          </Badge>
          {promotion.featured && <Badge variant="default">Destacada</Badge>}
          {isExpired && <Badge variant="destructive">Expirada</Badge>}
        </div>
      </div>
      <CardHeader>
        <div className="space-y-1">
          <CardTitle className="line-clamp-2">{promotion.title}</CardTitle>
          <CardDescription className="line-clamp-2">{promotion.description}</CardDescription>
          <div className="text-sm text-muted-foreground">ID: {promotion.promotionId}</div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              <span>Stock: {promotion.stock}</span>
            </div>
            {!isExpired && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m
                </span>
              </div>
            )}
          </div>
          {promotion.discountPercentage && (
            <div className="text-sm font-medium text-green-600">{promotion.discountPercentage}% de descuento</div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Link href={`/dashboard/promotions/${promotion.id}`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </Link>
          <Link href={`/promociones/${promotion.slug}`} target="_blank">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              Ver
            </Button>
          </Link>
        </div>
        <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Eliminar</span>
        </Button>
      </CardFooter>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la promoción "{promotion.title}" y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
