import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { checkPermission } from "@/lib/permissions"
import { saveImageMetadata, getAllImageMetadata } from "@/lib/image-metadata"

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url)
    const folder = url.searchParams.get("folder") || undefined

    const metadata = await getAllImageMetadata(folder)
    return NextResponse.json(metadata, { status: 200 })
  } catch (error) {
    console.error("Error fetching image metadata:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const canUpload = await checkPermission(session.user.id, "profile:edit")

    if (!canUpload) {
      return NextResponse.json({ error: "No tienes permisos para gestionar imágenes" }, { status: 403 })
    }

    const data = await request.json()
    const metadata = await saveImageMetadata(data)

    return NextResponse.json(metadata, { status: 201 })
  } catch (error) {
    console.error("Error saving image metadata:", error)
    const errorMessage = error instanceof Error ? error.message : "Error interno del servidor"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
