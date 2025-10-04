import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { checkPermission } from "@/lib/permissions"
import { createTeamMember, getTeamMembers } from "@/lib/team"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const canViewTeam = await checkPermission(session.user.id, "team:manage")

    if (!canViewTeam) {
      return NextResponse.json({ error: "No tienes permisos para ver el equipo" }, { status: 403 })
    }

    const teamMembers = await getTeamMembers()

    return NextResponse.json(teamMembers, { status: 200 })
  } catch (error) {
    console.error("Error fetching team members:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const canAddTeamMember = await checkPermission(session.user.id, "team:add")

    if (!canAddTeamMember) {
      return NextResponse.json({ error: "No tienes permisos para añadir miembros al equipo" }, { status: 403 })
    }

  const { safeParseJson } = await import("@/lib/requestUtils")
  const parsed = await safeParseJson(request)
  if (!parsed.ok) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  const data = parsed.body
  const teamMember = await createTeamMember(data)

    return NextResponse.json(teamMember, { status: 201 })
  } catch (error) {
    console.error("Error creating team member:", error)

    const errorMessage = error instanceof Error ? error.message : "Error interno del servidor"

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
