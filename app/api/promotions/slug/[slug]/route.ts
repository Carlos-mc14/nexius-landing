import { NextResponse } from "next/server"
import { getPromotionBySlug } from "@/lib/promotions"

export async function GET(request: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  try {
    const { slug } = params
    const promotion = await getPromotionBySlug(slug)

    if (!promotion) {
      return NextResponse.json({ error: "Promoción no encontrada" }, { status: 404 })
    }

    return NextResponse.json(promotion, { status: 200 })
  } catch (error) {
    console.error("Error fetching promotion by slug:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
