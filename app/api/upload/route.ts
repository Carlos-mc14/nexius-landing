import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { checkPermission } from "@/lib/permissions"
import { writeFile } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

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

    // Generate a unique filename
    const fileName = `${uuidv4()}.${fileExtension}`

    // Create the uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads")

    try {
      // Convert the file to an ArrayBuffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Save the file
      const filePath = join(uploadsDir, fileName)
      await writeFile(filePath, buffer)

      // Return the URL to the uploaded file
      const fileUrl = `/uploads/${fileName}`
      return NextResponse.json({ url: fileUrl, success: true })
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
