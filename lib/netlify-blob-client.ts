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
 * Sube un archivo al almacenamiento de Netlify Blob
 * @param file Archivo a subir
 * @param options Opciones de subida
 * @returns URL del archivo subido
 */
export async function uploadToNetlifyBlob(
  file: File,
  options: BlobUploadOptions = {}
): Promise<string> {
  try {
    // Sanitizar nombre de archivo y crear nombre único
    const sanitizedFilename = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9_.-]/g, '');
    const filename = options.filename || `${Date.now()}-${sanitizedFilename}`;
    
    const folder = options.folder || 'images';
    
    // Construir blobKey usando la carpeta y el nombre de archivo
    const blobKey = `${folder}/${filename}`;

    // Obtener el store de Netlify Blobs con las credenciales
    const store = getStore({
      name: "media-assets",
      siteID: process.env.NEXT_PUBLIC_NETLIFY_SITE_ID || process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_BLOBS_KEY
    });

    // Subir el archivo como JSON con metadatos
    await store.setJSON(blobKey, await file.arrayBuffer(), {
      metadata: { 
        contentType: file.type, 
        filename: file.name, 
        size: file.size,
        uploadedAt: new Date().toISOString()
      },
    });
    
    // Construir la URL pública
    const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.NEXTAUTH_URL;
    const publicUrl = `${baseUrl}/.netlify/blob/media-assets/${encodeURIComponent(blobKey)}`;
    return publicUrl;
  } catch (error) {
    console.error("Error uploading to Netlify Blob:", error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Elimina un archivo del almacenamiento de Netlify Blob
 * @param url URL del archivo a eliminar
 * @returns boolean indicando si se eliminó correctamente
 */
export async function deleteFromNetlifyBlob(url: string): Promise<boolean> {
  try {
    if (!url) {
      console.warn("No URL provided for deletion");
      return false;
    }

    // Extraer la clave del blob de la URL
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    
    // La clave está después de "media-assets/" en la URL
    const mediaAssetsIndex = pathSegments.findIndex(seg => seg === "media-assets");
    if (mediaAssetsIndex === -1 || mediaAssetsIndex >= pathSegments.length - 1) {
      throw new Error("Invalid blob URL format");
    }
    
    // Reconstruir la clave combinando los segmentos después de "media-assets"
    const blobKey = decodeURIComponent(pathSegments.slice(mediaAssetsIndex + 1).join('/'));
    
    // Obtener el store para 'media-assets'
    const store = getStore({
      name: "media-assets",
      siteID: process.env.NEXT_PUBLIC_NETLIFY_SITE_ID || process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_BLOBS_KEY
    });
    
    // Eliminar el archivo
    await store.delete(blobKey);
    return true;
  } catch (error) {
    console.error("Error deleting from Netlify Blob:", error);
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : String(error)}`);
  }
}