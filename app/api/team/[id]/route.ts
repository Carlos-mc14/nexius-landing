import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { checkPermission } from "@/lib/permissions"
import { getTeamMemberById, updateTeamMember, deleteTeamMember } from "@/lib/team"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const isOwnProfile = session.user.teamMemberId === id
    const canManageTeam = await checkPermission(session.user.id, "team:manage")

    if (!isOwnProfile && !canManageTeam) {
      return NextResponse.json({ error: "No tienes permisos para ver este miembro del equipo" }, { status: 403 })
    }

    const teamMember = await getTeamMemberById(id)

    if (!teamMember) {
      return NextResponse.json({ error: "Miembro del equipo no encontrado" }, { status: 404 })
    }

    return NextResponse.json(teamMember, { status: 200 })
  } catch (error) {
    console.error("Error fetching team member:", error)
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
    const isOwnProfile = session.user.teamMemberId === id
    const canEditTeam = await checkPermission(session.user.id, "team:edit")

    if (!isOwnProfile && !canEditTeam) {
      return NextResponse.json({ error: "No tienes permisos para editar este miembro del equipo" }, { status: 403 })
    }

    const data = await request.json()
    const teamMember = await updateTeamMember(id, data)

    return NextResponse.json(teamMember, { status: 200 })
  } catch (error) {
    console.error("Error updating team member:", error)

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
    const canDeleteTeam = await checkPermission(session.user.id, "team:delete")

    if (!canDeleteTeam) {
      return NextResponse.json({ error: "No tienes permisos para eliminar miembros del equipo" }, { status: 403 })
    }

    await deleteTeamMember(id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting team member:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
