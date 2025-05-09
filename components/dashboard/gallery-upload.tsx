"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Loader2 } from "lucide-react"
import Image from "next/image"
import { uploadToNetlifyBlob } from "@/lib/netlify-blob-client"
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

  const handleRemove = (index: number) => {
    // Nota: Aquí podríamos implementar la eliminación de la imagen de Netlify Blob
    // Para esto, necesitaríamos llamar a deleteFromNetlifyBlob(value[index])
    const newImages = [...value]
    newImages.splice(index, 1)
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {value.map((image, index) => (
          <div key={index} className="relative aspect-video overflow-hidden rounded-md">
            <Image src={image || "/placeholder.svg"} alt={`Gallery image ${index + 1}`} fill className="object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => handleRemove(index)}
              disabled={disabled || isUploading}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Eliminar imagen</span>
            </Button>
          </div>
        ))}

        {value.length < maxImages && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed aspect-video">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground text-center px-2">Subir imagen</p>
            <Label 
              htmlFor="gallery-upload" 
              className={`cursor-pointer text-xs text-center ${disabled || isUploading ? "opacity-50" : ""}`}
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
              disabled={disabled || isUploading}
            />
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {value.length} de {maxImages} imágenes
      </p>
    </div>
  )
}