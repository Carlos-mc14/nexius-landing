import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { checkPermission } from "@/lib/permissions"
import { getSeoConfig, updateSeoConfig } from "@/lib/seo"

export async function GET() {
  try {
    const config = await getSeoConfig()
    return NextResponse.json(config)
  } catch (error) {
    console.error("Error fetching SEO config:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const canEditSeo = await checkPermission(session.user.id, "homepage:edit")

    if (!canEditSeo) {
      return NextResponse.json({ error: "No tienes permisos para editar la configuración SEO" }, { status: 403 })
    }

  const { safeParseJson } = await import('@/lib/requestUtils')
  const parsed = await safeParseJson(request)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const data = parsed.body
  const config = await updateSeoConfig(data)

    return NextResponse.json(config)
  } catch (error) {
    console.error("Error updating SEO config:", error)
    const errorMessage = error instanceof Error ? error.message : "Error interno del servidor"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
