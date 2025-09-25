import { notFound } from "next/navigation"
import { getPromotionById } from "@/lib/promotions"
import { PromotionForm } from "@/components/dashboard/promotions/promotion-form"

interface EditPromotionPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditPromotionPage({ params }: EditPromotionPageProps) {
  const { id } = await params
  const promotion = await getPromotionById(id)

  if (!promotion) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Editar Promoción</h3>
        <p className="text-muted-foreground">Modifica los detalles de la promoción "{promotion.title}".</p>
      </div>
      <PromotionForm initialData={promotion} />
    </div>
  )
}
