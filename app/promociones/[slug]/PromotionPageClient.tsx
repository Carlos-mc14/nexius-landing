"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Clock, Package, ExternalLink, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CountdownTimer } from "@/components/countdown-timer"
import { PromotionCard } from "@/components/promotion-card"
import { generateWhatsAppURL } from "@/lib/promotions-client"
import type { Promotion } from "@/lib/promotions"

interface PromotionPageClientProps {
  promotion: Promotion
  isValid: boolean
  relatedPromotions: Promotion[]
}

export default function PromotionPageClient({ promotion, isValid, relatedPromotions }: PromotionPageClientProps) {
  const whatsappUrl = generateWhatsAppURL(promotion)

  return (
    <main className="flex min-h-screen flex-col pt-16">
      {/* Breadcrumb */}
      <section className="w-full py-4 border-b">
        <div className="container px-4 md:px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <Link href="/promociones" className="hover:text-foreground transition-colors">
              Promociones
            </Link>
            <span>/</span>
            <span className="text-foreground">{promotion.title}</span>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="w-full py-8 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-start">
            {/* Image */}
            <div className="relative">
              <div className="aspect-video relative overflow-hidden rounded-lg">
                <Image
                  src={
                    promotion.coverImage ||
                    `/placeholder.svg?height=600&width=800&text=${encodeURIComponent(promotion.title) || "/placeholder.svg"}`
                  }
                  alt={promotion.title}
                  fill
                  className="object-cover"
                  priority
                />
                {!isValid && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive" className="text-xl px-6 py-3">
                      Promoción no disponible
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {promotion.featured && (
                    <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                      Destacada
                    </Badge>
                  )}
                  {promotion.discountPercentage && (
                    <Badge variant="secondary" className="bg-green-500 text-white hover:bg-green-600">
                      {promotion.discountPercentage}% OFF
                    </Badge>
                  )}
                  <Badge variant="outline">ID: {promotion.promotionId}</Badge>
                </div>

                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{promotion.title}</h1>

                <p className="text-xl text-muted-foreground">{promotion.description}</p>

                {/* Pricing */}
                {promotion.originalPrice && promotion.discountedPrice && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-bold text-green-600">S/ {promotion.discountedPrice}</span>
                      <span className="text-xl text-muted-foreground line-through">S/ {promotion.originalPrice}</span>
                    </div>
                    {promotion.discountPercentage && (
                      <p className="text-sm text-green-600 font-medium">
                        ¡Ahorras S/ {(promotion.originalPrice - promotion.discountedPrice).toFixed(2)}!
                      </p>
                    )}
                  </div>
                )}

                {/* Stock */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    <span>Stock disponible: {promotion.stock}</span>
                  </div>
                </div>
              </div>

              {/* Countdown */}
              {isValid && (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="h-5 w-5" />
                      Tiempo restante
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CountdownTimer endDate={promotion.endDate} />
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {isValid ? (
                  <>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-lg py-6">
                        Solicitar ahora por WhatsApp
                        <ExternalLink className="ml-2 h-5 w-5" />
                      </Button>
                    </a>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: promotion.title,
                            text: promotion.description,
                            url: window.location.href,
                          })
                        } else {
                          navigator.clipboard.writeText(window.location.href)
                        }
                      }}
                      className="sm:w-auto"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Compartir
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">Esta promoción ya no está disponible</p>
                    <Link href="/promociones">
                      <Button variant="outline">Ver otras promociones</Button>
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/promociones"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a promociones
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Terms and Conditions */}
      {promotion.termsAndConditions && (
        <section className="w-full py-8 md:py-16 bg-muted/30">
          <div className="container px-4 md:px-6">
            <Card>
              <CardHeader>
                <CardTitle>Términos y Condiciones</CardTitle>
                <CardDescription>Condiciones aplicables a esta promoción</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap">{promotion.termsAndConditions}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Related Promotions */}
      {relatedPromotions.length > 0 && (
        <section className="w-full py-8 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">Otras promociones que te pueden interesar</h2>
                <p className="text-muted-foreground">Descubre más ofertas especiales disponibles</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPromotions.map((relatedPromotion) => (
                  <PromotionCard key={relatedPromotion.id} promotion={relatedPromotion} showCountdown={false} />
                ))}
              </div>
              <div className="text-center">
                <Link href="/promociones">
                  <Button variant="outline" size="lg">
                    Ver todas las promociones
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Offer",
            name: promotion.title,
            description: promotion.description,
            image: promotion.coverImage,
            validFrom: promotion.startDate,
            validThrough: promotion.endDate,
            availability: isValid ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            inventoryLevel: promotion.stock,
            ...(promotion.originalPrice &&
              promotion.discountedPrice && {
                price: promotion.discountedPrice,
                priceCurrency: "PEN",
                priceValidUntil: promotion.endDate,
              }),
            seller: {
              "@type": "Organization",
              name: "Nexius",
              url: "https://nexius.lat",
            },
          }),
        }}
      />
    </main>
  )
}
