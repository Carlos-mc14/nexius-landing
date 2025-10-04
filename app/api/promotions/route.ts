import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { checkPermission } from "@/lib/permissions"
import { createPromotion, getPromotions } from "@/lib/promotions"

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url)
    const status = url.searchParams.get("status") as "active" | "inactive" | "all" | null
    const limit = url.searchParams.get("limit") ? Number.parseInt(url.searchParams.get("limit")!) : undefined
    const featured =
      url.searchParams.get("featured") === "true"
        ? true
        : url.searchParams.get("featured") === "false"
          ? false
          : undefined
    const onlyValid = url.searchParams.get("onlyValid") === "true"

    // Promotions are public data, no authentication required for active promotions
    const promotions = await getPromotions({
      status: status || "active",
      limit,
      featured,
      onlyValid,
    })

    return NextResponse.json(promotions, { status: 200 })
  } catch (error) {
    console.error("Error fetching promotions:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const canAddPromotion = await checkPermission(session.user.id, "promotions:edit")

    if (!canAddPromotion) {
      return NextResponse.json({ error: "No tienes permisos para añadir promociones" }, { status: 403 })
    }

  const { safeParseJson } = await import('@/lib/requestUtils')
  const parsed = await safeParseJson(request)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const data = parsed.body

    // Add author information from session
    data.author = {
      id: session.user.id,
      name: session.user.name,
      image: session.user.image,
    }

    const promotion = await createPromotion(data)

    return NextResponse.json(promotion, { status: 201 })
  } catch (error) {
    console.error("Error creating promotion:", error)

    const errorMessage = error instanceof Error ? error.message : "Error interno del servidor"

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
