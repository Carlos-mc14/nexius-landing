import { put } from "@vercel/blob"
import { v4 as uuidv4 } from "uuid"

/**
 * Sube un archivo a Vercel Blob
 * @param buffer - Buffer del archivo a subir
 * @param fileExtension - Extensión del archivo (sin el punto)
 * @param folder - Carpeta opcional donde guardar el archivo
 * @returns URL del archivo subido
 */
export async function uploadToVercelBlob(buffer: Buffer, fileExtension: string, folder = "uploads"): Promise<string> {
  try {
    // Generar un nombre único para el archivo
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`

    // Subir el archivo a Vercel Blob
    const { url } = await put(fileName, buffer, {
      access: "public",
      contentType: getContentType(fileExtension),
    })

    return url
  } catch (error) {
    console.error("Error al subir archivo a Vercel Blob:", error)
    throw new Error("Error al subir el archivo a Vercel Blob")
  }
}

/**
 * Determina el tipo de contenido basado en la extensión del archivo
 */
function getContentType(fileExtension: string): string {
  const extension = fileExtension.toLowerCase()

  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg"
    case "png":
      return "image/png"
    case "gif":
      return "image/gif"
    case "webp":
      return "image/webp"
    case "svg":
      return "image/svg+xml"
    case "pdf":
      return "application/pdf"
    default:
      return "application/octet-stream"
  }
}
