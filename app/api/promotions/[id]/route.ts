import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { checkPermission } from "@/lib/permissions"
import { getPromotionById, updatePromotion, deletePromotion } from "@/lib/promotions"

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  try {
    const { id } = params
    const promotion = await getPromotionById(id)

    if (!promotion) {
      return NextResponse.json({ error: "Promoción no encontrada" }, { status: 404 })
    }

    return NextResponse.json(promotion, { status: 200 })
  } catch (error) {
    console.error("Error fetching promotion:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

  const { id } = params
  const canEditPromotion = await checkPermission(session.user.id, "promotions:edit")

    if (!canEditPromotion) {
      return NextResponse.json({ error: "No tienes permisos para editar promociones" }, { status: 403 })
    }

  const { safeParseJson } = await import('@/lib/requestUtils')
  const parsed = await safeParseJson(request)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const data = parsed.body
  const promotion = await updatePromotion(id, data)

    return NextResponse.json(promotion, { status: 200 })
  } catch (error) {
    console.error("Error updating promotion:", error)

    const errorMessage = error instanceof Error ? error.message : "Error interno del servidor"

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = params
    const canDeletePromotion = await checkPermission(session.user.id, "promotions:edit")

    if (!canDeletePromotion) {
      return NextResponse.json({ error: "No tienes permisos para eliminar promociones" }, { status: 403 })
    }

    await deletePromotion(id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting promotion:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
