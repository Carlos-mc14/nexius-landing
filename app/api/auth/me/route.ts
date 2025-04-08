import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getUserPermissions } from "@/lib/permissions"

// Endpoint para obtener información del usuario actual
export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 200 })
    }

    // Obtener los permisos del usuario
    const permissions = await getUserPermissions(session.user.id)

    return NextResponse.json({
      authenticated: true,
      user: {
        ...session.user,
        permissions,
      },
    })
  } catch (error) {
    console.error("Error al obtener información del usuario:", error)
    return NextResponse.json({ authenticated: false }, { status: 200 })
  }
}
