import { getStore } from "@netlify/blobs";

// Definir tipos para mejor tipado
export interface BlobUploadOptions {
  // Nombre del archivo que se quiere guardar (opcional)
  filename?: string;
  // Carpeta donde guardar (opcional)
  folder?: string;
  // Tiempo de expiración en segundos (opcional)
  expirationSeconds?: number;
}

/**
 * Sube una imagen al almacenamiento de Netlify Blob
 * @param file Archivo a subir
 * @param options Opciones de subida
 * @returns URL de la imagen subida
 */
export async function uploadToNetlifyBlob(
  file: File,
  options: BlobUploadOptions = {}
): Promise<string> {
  try {
    // Generar un nombre único para el archivo si no se proporciona uno
    const filename = options.filename || `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    // Determinar la carpeta (por defecto 'images')
    const folder = options.folder || 'images';
    
    // Crear una clave única para el blob
    const blobKey = `${folder}/${filename}`;
    
    // Obtener el store para 'media-assets'
    const store = getStore("media-assets");

    // 1) sube el blob (no devuelve URL)
    await store.setJSON(blobKey, await file.arrayBuffer(), {
        metadata: { contentType: file.type, filename: file.name, size: file.size },
      })
    
    const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/.netlify/blob/media-assets/${encodeURIComponent(blobKey)}`
    return publicUrl
  } catch (error) {
    console.error("Error uploading to Netlify Blob:", error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Elimina una imagen del almacenamiento de Netlify Blob
 * @param url URL de la imagen a eliminar
 */
export async function deleteFromNetlifyBlob(url: string): Promise<void> {
  try {
    // Extraer la clave del blob de la URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const blobKey = pathParts[pathParts.length - 1];
    
    // Obtener el store para 'media-assets'
    const store = getStore('media-assets');
    
    // Eliminar el archivo
    await store.delete(blobKey);
  } catch (error) {
    console.error("Error deleting from Netlify Blob:", error);
    throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : String(error)}`);
  }
}