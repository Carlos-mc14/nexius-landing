"use client"

import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Package, ExternalLink } from "lucide-react"
import { CountdownTimer } from "@/components/countdown-timer"
import { generateWhatsAppURL, isPromotionValid } from "@/lib/promotions-client"

interface PromotionCardProps {
  promotion: any
  showCountdown?: boolean
  variant?: "default" | "compact"
}

export function PromotionCard({ promotion, showCountdown = true, variant = "default" }: PromotionCardProps) {
  const isValid = isPromotionValid(promotion)
  const whatsappUrl = generateWhatsAppURL(promotion)

  if (variant === "compact") {
    return (
      <Card className="overflow-hidden">
        <div className="flex">
          <div className="relative w-32 h-32 flex-shrink-0">
            <Image
              src={
                promotion.coverImage ||
                `/placeholder.svg?height=128&width=128&text=${encodeURIComponent(promotion.title) || "/placeholder.svg"}`
              }
              alt={promotion.title}
              fill
              className="object-cover"
            />
            {promotion.featured && (
              <div className="absolute top-1 right-1">
                <Badge variant="default" className="text-xs">
                  Destacada
                </Badge>
              </div>
            )}
          </div>
          <div className="flex-1 p-4">
            <div className="space-y-2">
              <h3 className="font-semibold line-clamp-1">{promotion.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{promotion.description}</p>
              {promotion.discountPercentage && (
                <Badge variant="secondary" className="text-xs">
                  {promotion.discountPercentage}% OFF
                </Badge>
              )}
              <div className="flex gap-2">
                <Link href={`/promociones/${promotion.slug}`}>
                  <Button size="sm" variant="outline">
                    Ver más
                  </Button>
                </Link>
                {isValid && (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm">Solicitar</Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden flex flex-col h-full group hover:shadow-lg transition-shadow">
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={
            promotion.coverImage || `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(promotion.title)}`
          }
          alt={promotion.title}
          fill
          className="object-cover transition-transform group-hover:scale-105 duration-300"
        />
        <div className="absolute top-2 right-2 flex gap-2">
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
        </div>
        {!isValid && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg px-4 py-2">
              No disponible
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-2">{promotion.title}</CardTitle>
        <CardDescription className="line-clamp-3">{promotion.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            <span>Stock: {promotion.stock}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>ID: {promotion.promotionId}</span>
          </div>
        </div>

        {promotion.originalPrice && promotion.discountedPrice && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-green-600">S/ {promotion.discountedPrice}</span>
              <span className="text-sm text-muted-foreground line-through">S/ {promotion.originalPrice}</span>
            </div>
          </div>
        )}

        {showCountdown && isValid && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-center">Tiempo restante:</div>
            <CountdownTimer endDate={promotion.endDate} />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Link href={`/promociones/${promotion.slug}`} className="flex-1">
          <Button variant="outline" className="w-full group bg-transparent">
            Leer más
            <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
        {isValid && (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button className="w-full bg-green-600 hover:bg-green-700">Solicitar ahora</Button>
          </a>
        )}
      </CardFooter>
    </Card>
  )
}
