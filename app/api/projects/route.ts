import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { checkPermission } from "@/lib/permissions"
import { createProject, getProjects } from "@/lib/projects"

export async function GET() {
  try {
    // Projects are public data, no authentication required
    const projects = await getProjects()
    return NextResponse.json(projects, { status: 200 })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const canAddProject = await checkPermission(session.user.id, "homepage:edit")

    if (!canAddProject) {
      return NextResponse.json({ error: "No tienes permisos para añadir proyectos" }, { status: 403 })
    }

  const { safeParseJson } = await import('@/lib/requestUtils')
  const parsed = await safeParseJson(request)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const data = parsed.body
  const project = await createProject(data)

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)

    const errorMessage = error instanceof Error ? error.message : "Error interno del servidor"

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
