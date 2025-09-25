import { Suspense } from "react"
import { getActivePromotions } from "@/lib/promotions"
import { PromotionCard } from "@/components/promotion-card"
import { Badge } from "@/components/ui/badge"
import { getSeoConfig } from "@/lib/seo"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const seoConfig = await getSeoConfig()

  return {
    title: "Promociones y Ofertas Especiales | Nexius",
    description:
      "Descubre nuestras promociones exclusivas y ofertas especiales en desarrollo web, diseño y tecnología. ¡Aprovecha estos descuentos por tiempo limitado!",
    keywords: "promociones, ofertas, descuentos, desarrollo web, diseño, tecnología, Nexius",
    openGraph: {
      title: "Promociones y Ofertas Especiales | Nexius",
      description:
        "Descubre nuestras promociones exclusivas y ofertas especiales en desarrollo web, diseño y tecnología.",
      url: `${seoConfig.siteUrl}/promociones`,
      siteName: "Nexius",
      images: [
        {
          url: `${seoConfig.siteUrl}/placeholder.svg?height=630&width=1200&text=Promociones+Nexius`,
          width: 1200,
          height: 630,
          alt: "Promociones Nexius",
        },
      ],
      type: "website",
    },
    alternates: {
      canonical: "/promociones",
    },
  }
}

// Disable caching for this page to always show the latest promotions
export const revalidate = 0

export default async function PromotionsPage() {
  return (
    <main className="flex min-h-screen flex-col pt-16">
      {/* Hero Section */}
      <section className="relative w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm backdrop-blur-sm dark:border-primary/30 dark:bg-primary/20">
              <span className="font-medium">Ofertas Especiales</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Promociones Exclusivas
            </h1>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Aprovecha nuestras ofertas especiales por tiempo limitado. Servicios de desarrollo web, diseño y
              tecnología con descuentos únicos.
            </p>
          </div>
        </div>
      </section>

      {/* Promotions Section */}
      <section className="w-full py-16 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="overflow-hidden rounded-lg border bg-card shadow-sm animate-pulse">
                    <div className="aspect-video w-full bg-muted"></div>
                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <div className="h-5 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-5/6"></div>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="h-16 bg-muted rounded"></div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <div className="h-10 bg-muted rounded flex-1"></div>
                        <div className="h-10 bg-muted rounded flex-1"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            }
          >
            <PromotionsList />
          </Suspense>
        </div>
      </section>
    </main>
  )
}

async function PromotionsList() {
  const promotions = await getActivePromotions(20) // Get up to 20 active promotions

  if (promotions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="space-y-4">
          <div className="text-6xl">🎯</div>
          <h2 className="text-2xl font-bold">No hay promociones activas</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Por el momento no tenemos promociones disponibles. ¡Mantente atento a nuestras redes sociales para no
            perderte las próximas ofertas!
          </p>
        </div>
      </div>
    )
  }

  // Separate featured and regular promotions
  const featuredPromotions = promotions.filter((promotion) => promotion.featured)
  const regularPromotions = promotions.filter((promotion) => !promotion.featured)

  return (
    <div className="space-y-12">
      {/* Featured Promotions */}
      {featuredPromotions.length > 0 && (
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
              Promociones Destacadas
            </Badge>
            <h2 className="text-2xl font-bold">Ofertas Imperdibles</h2>
            <p className="text-muted-foreground">Nuestras mejores promociones seleccionadas especialmente para ti</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPromotions.map((promotion) => (
              <PromotionCard key={promotion.id} promotion={promotion} showCountdown={true} />
            ))}
          </div>
        </div>
      )}

      {/* Regular Promotions */}
      {regularPromotions.length > 0 && (
        <div className="space-y-8">
          {featuredPromotions.length > 0 && (
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Más Promociones</h2>
              <p className="text-muted-foreground">Descubre todas nuestras ofertas disponibles</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPromotions.map((promotion) => (
              <PromotionCard key={promotion.id} promotion={promotion} showCountdown={true} />
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="text-center py-12 bg-muted/30 rounded-lg">
        <div className="space-y-4">
          <h3 className="text-xl font-bold">¿No encuentras lo que buscas?</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Contáctanos directamente y te ayudaremos a encontrar la solución perfecta para tu proyecto
          </p>
          <a
            href="https://wa.me/+51973648613?text=Hola%2C%20me%20interesa%20conocer%20m%C3%A1s%20sobre%20sus%20servicios"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700 transition-colors"
          >
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
