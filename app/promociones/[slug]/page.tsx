import { notFound } from "next/navigation"
import { getPromotionBySlug, getActivePromotions, isPromotionValid } from "@/lib/promotions"
import { getSeoConfig } from "@/lib/seo"
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
    return {
      title: "Promoción no encontrada | Nexius",
      description: "La promoción que buscas no está disponible o ha expirado.",
    }
  }

  return {
    title: promotion.seoTitle || `${promotion.title} | Promociones Nexius`,
    description:
      promotion.seoDescription ||
      promotion.description ||
      `Aprovecha esta oferta especial: ${promotion.title}. ¡Por tiempo limitado!`,
    keywords: `promoción, oferta, descuento, ${promotion.title}, Nexius`,
    openGraph: {
      title: promotion.title,
      description: promotion.description,
      url: `${seoConfig.siteUrl}/promociones/${promotion.slug}`,
      siteName: "Nexius",
      images: [
        {
          url: promotion.coverImage || `${seoConfig.siteUrl}/placeholder.svg?height=630&width=1200`,
          width: 1200,
          height: 630,
          alt: promotion.title,
        },
      ],
      type: "website",
    },
    alternates: {
      canonical: `/promociones/${promotion.slug}`,
    },
  }
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
