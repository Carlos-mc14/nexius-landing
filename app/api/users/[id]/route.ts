import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { checkPermission } from "@/lib/permissions"
import { getUserById, updateUser, deleteUser } from "@/lib/users"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const isOwnProfile = session.user.id === id
    const canManageUsers = await checkPermission(session.user.id, "users:manage")

    if (!isOwnProfile && !canManageUsers) {
      return NextResponse.json({ error: "No tienes permisos para ver este usuario" }, { status: 403 })
    }

    const user = await getUserById(id)

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // No enviar el hash de la contraseña al cliente
    const { passwordHash, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword, { status: 200 })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const isOwnProfile = session.user.id === id
    const canEditUsers = await checkPermission(session.user.id, "users:edit")

    if (!isOwnProfile && !canEditUsers) {
      return NextResponse.json({ error: "No tienes permisos para editar este usuario" }, { status: 403 })
    }

    // Si no es el propio perfil y no es admin, no permitir cambiar el rol
    const isAdmin = session.user.role === "admin"
    const data = await request.json()

    if (!isAdmin && data.role && !isOwnProfile) {
      return NextResponse.json({ error: "No tienes permisos para cambiar el rol de otros usuarios" }, { status: 403 })
    }

    // Si es el propio perfil, no permitir cambiar el rol ni el estado activo
    if (isOwnProfile && !isAdmin) {
      delete data.role
      delete data.active
    }

    const updatedUser = await updateUser(id, data)

    // No enviar el hash de la contraseña al cliente
    return NextResponse.json(updatedUser, { status: 200 })
  } catch (error) {
    console.error("Error updating user:", error)

    const errorMessage = error instanceof Error ? error.message : "Error interno del servidor"

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const canDeleteUsers = await checkPermission(session.user.id, "users:delete")

    if (!canDeleteUsers) {
      return NextResponse.json({ error: "No tienes permisos para eliminar usuarios" }, { status: 403 })
    }

    // No permitir eliminar el propio usuario
    if (session.user.id === id) {
      return NextResponse.json({ error: "No puedes eliminar tu propio usuario" }, { status: 403 })
    }

    await deleteUser(id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
