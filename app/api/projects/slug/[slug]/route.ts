import { NextResponse } from "next/server"
import { getProjectBySlug } from "@/lib/projects"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params
    const project = await getProjectBySlug(slug)

    if (!project) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    return NextResponse.json(project, { status: 200 })
  } catch (error) {
    console.error("Error fetching project by slug:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
