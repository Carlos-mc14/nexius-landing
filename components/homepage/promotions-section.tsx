import Link from "next/link"
import { PromotionCard } from "@/components/promotion-card"
import { Button } from "@/components/ui/button"
import { SectionHeader } from "./section-header"
import { FadeIn, StaggerContainer, StaggerItem } from "./motion-wrapper"

interface Promotion {
  id: string
  [key: string]: any
}

interface Props {
  promotions: Promotion[]
  meta?: { badge?: string; title?: string; description?: string }
}

export function PromotionsSection({ promotions, meta }: Props) {
  if (!promotions || promotions.length === 0) return null
  return (
    <section
      id="promociones"
      className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-950/20 dark:via-orange-950/20 dark:to-red-950/20"
    >
      <div className="container px-4 md:px-6">
        <SectionHeader
          badge={meta?.badge || "Ofertas Especiales"}
          title={meta?.title || "Promociones Destacadas"}
          description={meta?.description || "Aprovecha nuestras ofertas exclusivas por tiempo limitado. Servicios de calidad con descuentos especiales."}
        />
        <StaggerContainer className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {promotions.map((p) => (
            <StaggerItem key={p.id}>
              <PromotionCard promotion={p} showCountdown={true} />
            </StaggerItem>
          ))}
        </StaggerContainer>
        <FadeIn className="flex justify-center mt-10">
          <Link href="/promociones">
            <Button
              size="lg"
              className="group bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0"
            >
              Ver todas las promociones
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </Link>
        </FadeIn>
      </div>
    </section>
  )
}
