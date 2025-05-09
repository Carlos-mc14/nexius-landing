"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { uploadToNetlifyBlob, deleteFromNetlifyBlob } from "@/lib/netlify-blob-client"
import { toast } from "@/components/ui/use-toast"

interface GalleryUploadProps {
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
  maxImages?: number
  folder?: string
}

export function GalleryUpload({
  value,
  onChange,
  disabled,
  maxImages = 6,
  folder = "projects/gallery"
}: GalleryUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if maximum number of images is reached
    if (value.length >= maxImages) {
      toast({
        title: "Límite alcanzado",
        description: `No puedes subir más de ${maxImages} imágenes`,
        variant: "destructive",
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen no puede superar los 5MB",
        variant: "destructive",
      })
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "El archivo debe ser una imagen",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      const imageUrl = await uploadToNetlifyBlob(file, {
        folder: folder,
        filename: `${Date.now()}-${file.name.replace(/\s+/g, '-')}`,
      })
      
      onChange([...value, imageUrl])
      toast({
        title: "Imagen subida",
        description: "La imagen se ha subido correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo subir la imagen. Intenta nuevamente.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = async (index: number) => {
    const imageUrl = value[index]
    if (!imageUrl) return

    setIsDeleting(index)
    try {
      // Implementamos la eliminación de la imagen de Netlify Blob
      await deleteFromNetlifyBlob(imageUrl)
      
      const newImages = [...value]
      newImages.splice(index, 1)
      onChange(newImages)
      
      toast({
        title: "Imagen eliminada",
        description: "La imagen se ha eliminado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la imagen. Intenta nuevamente.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsDeleting(null)
    }
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex < 0 || 
      fromIndex >= value.length || 
      toIndex < 0 || 
      toIndex >= value.length
    ) {
      return
    }

    const newImages = [...value]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {value.map((image, index) => (
          <div key={index} className="relative aspect-video overflow-hidden rounded-md border border-border">
            <Image 
              src={image || "/placeholder.svg"} 
              alt={`Imagen de galería ${index + 1}`} 
              fill 
              className="object-cover" 
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={(e) => {
                // Fallback para imágenes que fallan
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg"
              }}
            />
            <div className="absolute top-2 right-2 flex gap-1">
              {index > 0 && (
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="icon" 
                  className="h-6 w-6 bg-white/80 hover:bg-white/90"
                  onClick={() => moveImage(index, index - 1)}
                  disabled={disabled || isUploading || isDeleting !== null}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Mover a la izquierda</span>
                </Button>
              )}
              {index < value.length - 1 && (
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="icon" 
                  className="h-6 w-6 bg-white/80 hover:bg-white/90"
                  onClick={() => moveImage(index, index + 1)}
                  disabled={disabled || isUploading || isDeleting !== null}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Mover a la derecha</span>
                </Button>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleRemove(index)}
                disabled={disabled || isUploading || isDeleting !== null}
              >
                {isDeleting === index ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                <span className="sr-only">Eliminar imagen</span>
              </Button>
            </div>
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              {index + 1} / {value.length}
            </div>
          </div>
        ))}

        {value.length < maxImages && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed aspect-video">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground text-center px-2">Subir imagen</p>
            <Label 
              htmlFor="gallery-upload" 
              className={`cursor-pointer text-xs text-center rounded-md bg-primary px-4 py-2 text-primary-foreground shadow hover:bg-primary/90 ${disabled || isUploading ? "opacity-50" : ""}`}
            >
              {isUploading ? (
                <div className="flex items-center gap-1 justify-center">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Subiendo...</span>
                </div>
              ) : (
                "Seleccionar"
              )}
            </Label>
            <Input
              id="gallery-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={disabled || isUploading || isDeleting !== null}
            />
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          {value.length} de {maxImages} imágenes
        </p>
        {value.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Usa las flechas para reorganizar las imágenes
          </p>
        )}
      </div>
    </div>
  )
}