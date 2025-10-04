import { notFound } from "next/navigation"
import { getPromotionBySlug, getActivePromotions, isPromotionValid } from "@/lib/promotions"
import { getSeoConfig } from "@/lib/seo"
import { buildPageMetadataOverrides } from "@/lib/seo-utils"
import type { Metadata } from "next"
import PromotionPageClient from "./PromotionPageClient"

interface PromotionPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PromotionPageProps): Promise<Metadata> {
  const { slug } = await params
  const promotion = await getPromotionBySlug(slug)
  const seoConfig = await getSeoConfig()

  if (!promotion) {
    // Return a small override when not found so layout still supplies defaults
    return buildPageMetadataOverrides(seoConfig, {
      title: "Promoción no encontrada | Nexius",
      description: "La promoción que buscas no está disponible o ha expirado.",
    }) as Metadata
  }

  const title = promotion.seoTitle || `${promotion.title} | Promociones Nexius`
  const description = promotion.seoDescription || promotion.description || `Aprovecha esta oferta especial: ${promotion.title}. ¡Por tiempo limitado!`

  const overrides = buildPageMetadataOverrides(seoConfig, {
    title,
    description,
    image: promotion.coverImage || `${seoConfig.siteUrl}/placeholder.svg?height=630&width=1200`,
    path: `/promociones/${promotion.slug}`,
  })

  return overrides as Metadata
}

// Disable caching for this page to always show the latest promotion data
export const revalidate = 0

export default async function PromotionPage({ params }: PromotionPageProps) {
  const { slug } = await params
  const promotion = await getPromotionBySlug(slug)

  if (!promotion) {
    notFound()
  }

  const isValid = isPromotionValid(promotion)
  const relatedPromotions = await getActivePromotions(3)
  const filteredRelatedPromotions = relatedPromotions.filter((p) => p.id !== promotion.id).slice(0, 3)

  return <PromotionPageClient promotion={promotion} isValid={isValid} relatedPromotions={filteredRelatedPromotions} />
}
