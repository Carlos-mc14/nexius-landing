import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { checkPermission } from "@/lib/permissions"
import { getProjectById, updateProject, deleteProject } from "@/lib/projects"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const project = await getProjectById(id)

    if (!project) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    return NextResponse.json(project, { status: 200 })
  } catch (error) {
    console.error("Error fetching project:", error)
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
    const canEditProject = await checkPermission(session.user.id, "homepage:edit")

    if (!canEditProject) {
      return NextResponse.json({ error: "No tienes permisos para editar proyectos" }, { status: 403 })
    }

    const data = await request.json()
    const project = await updateProject(id, data)

    return NextResponse.json(project, { status: 200 })
  } catch (error) {
    console.error("Error updating project:", error)

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
    const canDeleteProject = await checkPermission(session.user.id, "homepage:edit")

    if (!canDeleteProject) {
      return NextResponse.json({ error: "No tienes permisos para eliminar proyectos" }, { status: 403 })
    }

    await deleteProject(id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
