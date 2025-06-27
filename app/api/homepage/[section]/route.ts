import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { checkPermission } from "@/lib/permissions"
import { updateHomepageSection } from "@/lib/homepage"

export async function PUT(request: Request, props: { params: Promise<{ section: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const canEditHomepage = await checkPermission(session.user.id, "homepage:edit")

    if (!canEditHomepage) {
      return NextResponse.json(
        { error: "No tienes permisos para editar el contenido de la página principal" },
        { status: 403 },
      )
    }

    const { section } = await params

    // Validate section name to prevent injection
    const validSections = ["hero", "services", "testimonials", "whyChooseUs", "contactInfo", "footer"]
    if (!validSections.includes(section)) {
      return NextResponse.json({ error: `Sección inválida: ${section}` }, { status: 400 })
    }

    const data = await request.json()

    // Update the section in the database
    await updateHomepageSection(section, data)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error updating homepage section ${params.section}:`, error)

    const errorMessage = error instanceof Error ? error.message : "Error interno del servidor"

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function GET(request: Request, props: { params: Promise<{ section: string }> }) {
  const params = await props.params;
  try {
    const { section } = await params

    // Validate section name to prevent injection
    const validSections = ["hero", "services", "testimonials", "whyChooseUs", "contactInfo", "footer"]
    if (!validSections.includes(section)) {
      return NextResponse.json({ error: `Sección inválida: ${section}` }, { status: 400 })
    }

    // This would typically fetch the specific section from the database
    // For now, we'll return a simple success message
    return NextResponse.json({ success: true, message: `Section ${section} would be returned here` })
  } catch (error) {
    console.error(`Error getting homepage section ${params.section}:`, error)

    const errorMessage = error instanceof Error ? error.message : "Error interno del servidor"

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
