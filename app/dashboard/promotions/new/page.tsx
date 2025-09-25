import { PromotionForm } from "@/components/dashboard/promotions/promotion-form"

export default function NewPromotionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Nueva Promoción</h3>
        <p className="text-muted-foreground">Crea una nueva promoción para tu negocio.</p>
      </div>
      <PromotionForm />
    </div>
  )
}
