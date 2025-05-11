"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ImageUploadModalProps {
  onClose: () => void
  onInsert: (imageUrl: string, altText: string) => void
  folder?: string
}

export function ImageUploadModal({ onClose, onInsert, folder = "general" }: ImageUploadModalProps) {
  const [activeTab, setActiveTab] = useState<string>("upload")
  const [imageUrl, setImageUrl] = useState<string>("")
  const [altText, setAltText] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [externalUrl, setExternalUrl] = useState<string>("")
  const [externalAltText, setExternalAltText] = useState<string>("")
  const [isUploading, setIsUploading] = useState<boolean>(false)

  const handleUpload = async (file: File) => {
    if (!file) return

    setIsUploading(true)
    try {
      // Create FormData
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", folder)
      formData.append("name", altText || file.name)
      formData.append("altText", altText || file.name)
      formData.append("description", description)

      // Upload the file
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Error al subir la imagen")
      }

      const data = await response.json()
      setImageUrl(data.url)

      toast({
        title: "Imagen subida",
        description: "La imagen se ha subido correctamente",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: "No se pudo subir la imagen. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleInsert = () => {
    if (activeTab === "upload") {
      if (!imageUrl) {
        toast({
          title: "Error",
          description: "Debes subir una imagen primero",
          variant: "destructive",
        })
        return
      }
      onInsert(imageUrl, altText || "Imagen")
    } else {
      if (!externalUrl) {
        toast({
          title: "Error",
          description: "Debes ingresar una URL de imagen",
          variant: "destructive",
        })
        return
      }
      onInsert(externalUrl, externalAltText || "Imagen")
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Insertar imagen</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Subir imagen</TabsTrigger>
            <TabsTrigger value="url">URL externa</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="image-upload">Imagen</Label>
              <div className="flex justify-center">
                {imageUrl ? (
                  <div className="relative w-full max-w-xs">
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt={altText || "Vista previa"}
                      className="max-h-[200px] object-contain mx-auto border rounded-md"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setImageUrl("")}
                    >
                      Eliminar
                    </Button>
                  </div>
                ) : (
                  <div className="w-full">
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                      disabled={isUploading}
                    />
                  </div>
                )}
              </div>
              {isUploading && (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>Subiendo imagen...</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="alt-text">Texto alternativo</Label>
              <Input
                id="alt-text"
                placeholder="Descripción de la imagen para accesibilidad"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descripción detallada de la imagen"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="external-url">URL de la imagen</Label>
              <Input
                id="external-url"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="external-alt-text">Texto alternativo</Label>
              <Input
                id="external-alt-text"
                placeholder="Descripción de la imagen para accesibilidad"
                value={externalAltText}
                onChange={(e) => setExternalAltText(e.target.value)}
              />
            </div>

            {externalUrl && (
              <div className="flex justify-center border rounded-md p-2">
                <img
                  src={externalUrl || "/placeholder.svg"}
                  alt={externalAltText || "Vista previa"}
                  className="max-h-[200px] object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg"
                    toast({
                      title: "Error",
                      description: "No se pudo cargar la imagen. Verifica la URL.",
                      variant: "destructive",
                    })
                  }}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleInsert} disabled={isUploading}>
            Insertar imagen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
