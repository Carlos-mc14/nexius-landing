import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { checkPermission, getUserPermissions } from "@/lib/permissions"
import type { Permission } from "@/lib/permissions"

// Endpoint para verificar si el usuario tiene un permiso específico
export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

      const { safeParseJson } = await import("@/lib/requestUtils")
      const parsed = await safeParseJson(request)
      if (!parsed.ok) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
      const body = parsed.body
    const { permission } = body

    if (!permission) {
      return NextResponse.json({ error: "Se requiere especificar un permiso" }, { status: 400 })
    }

    const hasPermission = await checkPermission(session.user.id, permission as Permission)

    return NextResponse.json({ hasPermission })
  } catch (error) {
    console.error("Error al verificar permiso:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Endpoint para obtener todos los permisos del usuario actual
export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const permissions = await getUserPermissions(session.user.id)

    return NextResponse.json({ permissions })
  } catch (error) {
    console.error("Error al obtener permisos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
