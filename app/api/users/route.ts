import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { checkPermission } from "@/lib/permissions"
import { getUsers, createUser } from "@/lib/users"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const canManageUsers = await checkPermission(session.user.id, "users:manage")

    if (!canManageUsers) {
      return NextResponse.json({ error: "No tienes permisos para ver los usuarios" }, { status: 403 })
    }

    const users = await getUsers()

    return NextResponse.json(users, { status: 200 })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const canAddUsers = await checkPermission(session.user.id, "users:add")

    if (!canAddUsers) {
      return NextResponse.json({ error: "No tienes permisos para añadir usuarios" }, { status: 403 })
    }

    const data = await request.json()

    // Validar datos mínimos requeridos
    if (!data.name || !data.email || !data.password || !data.role) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: nombre, email, contraseña y rol son obligatorios" },
        { status: 400 },
      )
    }

    const user = await createUser(data)

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)

    const errorMessage = error instanceof Error ? error.message : "Error interno del servidor"

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
