"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Upload, X } from "lucide-react"
import Image from "next/image"
import { toast } from "@/components/ui/use-toast"

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  folder?: string
}

export function ImageUpload({ value, onChange, disabled, folder = "general" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [showMetadataModal, setShowMetadataModal] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageName, setImageName] = useState("")
  const [imageAltText, setImageAltText] = useState("")
  const [imageDescription, setImageDescription] = useState("")

  const handleUploadClick = () => {
    setShowMetadataModal(true)
  }

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setImageFile(file)
    setImageName(file.name.split(".")[0]) // Default name from filename without extension
  }

  const handleUpload = async () => {
    if (!imageFile) return

    setIsUploading(true)
    try {
      // Create FormData
      const formData = new FormData()
      formData.append("file", imageFile)
      formData.append("folder", folder)
      formData.append("name", imageName || imageFile.name)
      formData.append("altText", imageAltText || imageName || imageFile.name)
      formData.append("description", imageDescription)

      // Upload the file
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Error al subir la imagen")
      }

      const data = await response.json()
      onChange(data.url)

      toast({
        title: "Imagen subida",
        description: "La imagen se ha subido correctamente",
      })

      // Reset state
      setShowMetadataModal(false)
      setImageFile(null)
      setImageName("")
      setImageAltText("")
      setImageDescription("")
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

  const handleRemove = () => {
    onChange("")
  }

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative aspect-square w-40 overflow-hidden rounded-md">
          <Image src={value || "/placeholder.svg"} alt="Uploaded image" fill className="object-cover" />
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-6 w-6"
              onClick={handleRemove}
              disabled={disabled || isUploading}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Eliminar imagen</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-md border border-dashed p-8">
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Arrastra y suelta una imagen o haz clic para seleccionar</p>
          </div>
          <Button onClick={handleUploadClick} disabled={disabled || isUploading} variant="secondary">
            {isUploading ? "Subiendo..." : "Seleccionar imagen"}
          </Button>
        </div>
      )}

      {/* Metadata Modal */}
      <Dialog open={showMetadataModal} onOpenChange={setShowMetadataModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Información de la imagen</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Seleccionar imagen</Label>
              <Input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelected}
                disabled={isUploading}
              />
            </div>

            {imageFile && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="image-name">Nombre de la imagen</Label>
                  <Input
                    id="image-name"
                    value={imageName}
                    onChange={(e) => setImageName(e.target.value)}
                    placeholder="Nombre descriptivo de la imagen"
                    disabled={isUploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image-alt">Texto alternativo (Alt)</Label>
                  <Input
                    id="image-alt"
                    value={imageAltText}
                    onChange={(e) => setImageAltText(e.target.value)}
                    placeholder="Descripción para accesibilidad"
                    disabled={isUploading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Describe la imagen para personas con discapacidad visual.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image-description">Descripción (opcional)</Label>
                  <Textarea
                    id="image-description"
                    value={imageDescription}
                    onChange={(e) => setImageDescription(e.target.value)}
                    placeholder="Descripción detallada de la imagen"
                    disabled={isUploading}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMetadataModal(false)} disabled={isUploading}>
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={!imageFile || isUploading}>
              {isUploading ? "Subiendo..." : "Subir imagen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
