"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { updateSeoConfig } from "@/lib/seo-client"
import { ImageUpload } from "@/components/dashboard/image-upload"

const seoFormSchema = z.object({
  title: z.string().min(5, { message: "El título debe tener al menos 5 caracteres" }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }),
  keywords: z.string().min(5, { message: "Las palabras clave son requeridas" }),
  ogImage: z.string(), // Permitimos cualquier string para la imagen
  favicon: z.string(), // Permitimos cualquier string para el favicon
  themeColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Debe ser un color hexadecimal válido (ej: #000000)",
  }),
  twitterHandle: z.string().optional(),
  siteUrl: z.string().url({ message: "Debe ser una URL válida" }),
  googleAnalyticsId: z.string().optional(),
  facebookAppId: z.string().optional(),
  additionalMetaTags: z
    .array(
      z.object({
        name: z.string().min(1, { message: "El nombre es requerido" }),
        content: z.string().min(1, { message: "El contenido es requerido" }),
      }),
    )
    .optional(),
})

type SeoFormValues = z.infer<typeof seoFormSchema>

interface SeoFormProps {
  initialData: any
}

export function SeoForm({ initialData }: SeoFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [metaTags, setMetaTags] = useState<{ name: string; content: string }[]>(initialData?.additionalMetaTags || [])

  const form = useForm<SeoFormValues>({
    resolver: zodResolver(seoFormSchema),
    defaultValues: {
      ...initialData,
      additionalMetaTags: initialData?.additionalMetaTags || [],
    },
  })

  async function onSubmit(data: SeoFormValues) {
    setIsLoading(true)
    try {
      await updateSeoConfig({
        ...data,
        additionalMetaTags: metaTags,
      })
      toast({
        title: "Configuración actualizada",
        description: "La configuración SEO ha sido actualizada correctamente.",
      })
    } catch (error) {
      console.error("Error submitting SEO config:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addMetaTag = () => {
    setMetaTags([...metaTags, { name: "", content: "" }])
  }

  const removeMetaTag = (index: number) => {
    const newMetaTags = [...metaTags]
    newMetaTags.splice(index, 1)
    setMetaTags(newMetaTags)
  }

  const updateMetaTag = (index: number, field: "name" | "content", value: string) => {
    const newMetaTags = [...metaTags]
    newMetaTags[index][field] = value
    setMetaTags(newMetaTags)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título del sitio</FormLabel>
                <FormControl>
                  <Input placeholder="Nexius | Soluciones Digitales" {...field} disabled={isLoading} />
                </FormControl>
                <FormDescription>
                  Título que aparecerá en la pestaña del navegador y en los resultados de búsqueda.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="siteUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL del sitio</FormLabel>
                <FormControl>
                  <Input placeholder="https://nexius.lat" {...field} disabled={isLoading} />
                </FormControl>
                <FormDescription>URL principal de tu sitio web.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Desarrollamos software a medida, sitios web y sistemas especializados..."
                  className="min-h-[80px]"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>Descripción breve que aparecerá en los resultados de búsqueda.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Palabras clave</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="desarrollo web, software a medida, sistemas para restaurantes..."
                  className="min-h-[80px]"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>Palabras clave separadas por comas.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="favicon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Favicon</FormLabel>
                <FormControl>
                  <ImageUpload value={field.value} onChange={field.onChange} disabled={isLoading} />
                </FormControl>
                <FormDescription>
                  Icono que aparecerá en la pestaña del navegador (recomendado: 32x32px).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ogImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imagen para redes sociales</FormLabel>
                <FormControl>
                  <ImageUpload value={field.value} onChange={field.onChange} disabled={isLoading} />
                </FormControl>
                <FormDescription>
                  Imagen que aparecerá cuando se comparta tu sitio (recomendado: 1200x630px).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="themeColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color del tema</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input type="text" placeholder="#000000" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormControl>
                    <Input
                      type="color"
                      value={field.value}
                      onChange={field.onChange}
                      className="w-12 p-1 h-10"
                      disabled={isLoading}
                    />
                  </FormControl>
                </div>
                <FormDescription>Color principal para la barra de navegación en dispositivos móviles.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="twitterHandle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuario de Twitter</FormLabel>
                <FormControl>
                  <Input placeholder="@nexiuslat" {...field} disabled={isLoading} />
                </FormControl>
                <FormDescription>Usuario de Twitter para las tarjetas de Twitter.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="googleAnalyticsId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID de Google Analytics</FormLabel>
                <FormControl>
                  <Input placeholder="G-XXXXXXXXXX" {...field} disabled={isLoading} />
                </FormControl>
                <FormDescription>ID de seguimiento de Google Analytics (opcional).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="facebookAppId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID de App de Facebook</FormLabel>
                <FormControl>
                  <Input placeholder="123456789012345" {...field} disabled={isLoading} />
                </FormControl>
                <FormDescription>ID de la aplicación de Facebook para el Pixel (opcional).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Meta Tags Adicionales</h3>
            <Button type="button" variant="outline" size="sm" onClick={addMetaTag} disabled={isLoading}>
              <Plus className="mr-2 h-4 w-4" />
              Añadir Meta Tag
            </Button>
          </div>

          {metaTags.map((tag, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="flex-1">
                <FormLabel className={index !== 0 ? "sr-only" : ""}>Nombre</FormLabel>
                <Input
                  placeholder="robots"
                  value={tag.name}
                  onChange={(e) => updateMetaTag(index, "name", e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="flex-1">
                <FormLabel className={index !== 0 ? "sr-only" : ""}>Contenido</FormLabel>
                <Input
                  placeholder="index, follow"
                  value={tag.content}
                  onChange={(e) => updateMetaTag(index, "content", e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeMetaTag(index)}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Eliminar</span>
              </Button>
            </div>
          ))}
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar cambios"
          )}
        </Button>
      </form>
    </Form>
  )
}
