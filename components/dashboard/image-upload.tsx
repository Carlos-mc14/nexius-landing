"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Loader2 } from "lucide-react"
import Image from "next/image"
import { uploadToNetlifyBlob, deleteFromNetlifyBlob } from "@/lib/netlify-blob-client"
import { toast } from "@/components/ui/use-toast"

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  folder?: string
  aspectRatio?: "square" | "video" | "wide"
}

export function ImageUpload({ 
  value, 
  onChange, 
  disabled, 
  folder = "projects",
  aspectRatio = "square" 
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Mapeo de relaciones de aspecto a clases
  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[16/9]"
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

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
      
      onChange(imageUrl)
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

  const handleRemove = async () => {
    if (!value) return

    setIsDeleting(true)
    try {
      // Implementamos la eliminación de la imagen de Netlify Blob
      await deleteFromNetlifyBlob(value)
      onChange("")
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
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {value ? (
        <div className={`relative ${aspectRatioClasses[aspectRatio]} w-full max-w-md overflow-hidden rounded-md border border-border`}>
          <Image 
            src={value} 
            alt="Imagen subida" 
            fill 
            className="object-cover" 
            sizes="(max-width: 768px) 100vw, 400px"
            onError={(e) => {
              // Fallback para imágenes que fallan
              const target = e.target as HTMLImageElement
              target.src = "/placeholder.svg"
            }}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={handleRemove}
            disabled={disabled || isUploading || isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
            <span className="sr-only">Eliminar imagen</span>
          </Button>
        </div>
      ) : (
        <div className={`flex flex-col items-center justify-center gap-4 rounded-md border border-dashed p-8 ${aspectRatioClasses[aspectRatio]} max-w-md`}>
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">Arrastra y suelta una imagen o haz clic para seleccionar</p>
          </div>
          <Label
            htmlFor="image-upload"
            className={`cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 ${
              disabled || isUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Subiendo...</span>
              </div>
            ) : (
              "Seleccionar imagen"
            )}
          </Label>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={disabled || isUploading}
          />
        </div>
      )}
    </div>
  )
}