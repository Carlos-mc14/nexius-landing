import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { checkPermission } from "@/lib/permissions"
import { uploadToVercelBlob } from "@/lib/blob"
import { saveImageMetadata } from "@/lib/image-metadata"

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Check permissions (any user with dashboard access can upload)
    const canUpload = await checkPermission(session.user.id, "profile:edit")
    if (!canUpload) {
      return NextResponse.json({ error: "No tienes permisos para subir archivos" }, { status: 403 })
    }

    // Parse the multipart form data
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string) || "general"
    const name = (formData.get("name") as string) || ""
    const altText = (formData.get("altText") as string) || ""
    const description = (formData.get("description") as string) || ""

    if (!file) {
      return NextResponse.json({ error: "No se ha proporcionado ningún archivo" }, { status: 400 })
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "El archivo no puede superar los 5MB" }, { status: 400 })
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "El archivo debe ser una imagen" }, { status: 400 })
    }

    // Get file extension
    const fileExtension = file.name.split(".").pop() || "jpg"

    try {
      // Convert the file to an ArrayBuffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Upload to Vercel Blob
      const fileUrl = await uploadToVercelBlob(buffer, fileExtension, folder)

      // Save metadata if provided
      if (name || altText || description) {
        await saveImageMetadata({
          url: fileUrl,
          name: name || file.name,
          altText: altText || name || file.name,
          description,
          folder,
          size: file.size,
        })
      }

      // Return the URL to the uploaded file
      return NextResponse.json({
        url: fileUrl,
        name: name || file.name,
        altText: altText || name || file.name,
        description,
        success: true,
      })
    } catch (error) {
      console.error("Error saving file:", error)
      return NextResponse.json({ error: "Error al guardar el archivo" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in upload API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
