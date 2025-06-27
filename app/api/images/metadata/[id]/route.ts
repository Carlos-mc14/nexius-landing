import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { checkPermission } from "@/lib/permissions"
import { updateImageMetadata, deleteImageMetadata } from "@/lib/image-metadata"

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const canManageImages = await checkPermission(session.user.id, "profile:edit")

    if (!canManageImages) {
      return NextResponse.json({ error: "No tienes permisos para gestionar imágenes" }, { status: 403 })
    }

    const { id } = params
    const data = await request.json()
    const metadata = await updateImageMetadata(id, data)

    if (!metadata) {
      return NextResponse.json({ error: "Metadata no encontrada" }, { status: 404 })
    }

    return NextResponse.json(metadata, { status: 200 })
  } catch (error) {
    console.error("Error updating image metadata:", error)
    const errorMessage = error instanceof Error ? error.message : "Error interno del servidor"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const canManageImages = await checkPermission(session.user.id, "profile:edit")

    if (!canManageImages) {
      return NextResponse.json({ error: "No tienes permisos para gestionar imágenes" }, { status: 403 })
    }

    const { id } = params
    const success = await deleteImageMetadata(id)

    if (!success) {
      return NextResponse.json({ error: "Metadata no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting image metadata:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
