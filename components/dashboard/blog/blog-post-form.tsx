"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { createBlogPost, updateBlogPost } from "@/lib/blog-client"
import { ImageUpload } from "@/components/dashboard/image-upload"
import { TagInput } from "@/components/dashboard/tag-input"
import { RichTextEditor } from "@/components/dashboard/blog/rich-text-editor"

const blogPostFormSchema = z.object({
  title: z.string().min(3, {
    message: "El título debe tener al menos 3 caracteres.",
  }),
  slug: z
    .string()
    .min(3, {
      message: "El slug debe tener al menos 3 caracteres.",
    })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "El slug solo puede contener letras minúsculas, números y guiones.",
    })
    .optional(),
  content: z.string().min(10, {
    message: "El contenido debe tener al menos 10 caracteres.",
  }),
  excerpt: z
    .string()
    .min(10, {
      message: "El extracto debe tener al menos 10 caracteres.",
    })
    .max(300, {
      message: "El extracto no puede superar los 300 caracteres.",
    }),
  coverImage: z.string().min(1, {
    message: "La imagen de portada es requerida.",
  }),
  category: z.string().min(1, {
    message: "La categoría es requerida.",
  }),
  tags: z.array(z.string()).min(1, {
    message: "Selecciona al menos una etiqueta.",
  }),
  publishedAt: z.date().optional(),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published"]).default("draft"),
  seoTitle: z
    .string()
    .max(70, {
      message: "El título SEO no puede superar los 70 caracteres.",
    })
    .optional(),
  seoDescription: z
    .string()
    .max(160, {
      message: "La descripción SEO no puede superar los 160 caracteres.",
    })
    .optional(),
})

type BlogPostFormValues = z.infer<typeof blogPostFormSchema>

interface BlogPostFormProps {
  initialData?: any
}

export function BlogPostForm({ initialData }: BlogPostFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      content: initialData?.content || "",
      excerpt: initialData?.excerpt || "",
      coverImage: initialData?.coverImage || "",
      category: initialData?.category || "",
      tags: initialData?.tags || [],
      publishedAt: initialData?.publishedAt ? new Date(initialData.publishedAt) : undefined,
      featured: initialData?.featured || false,
      status: initialData?.status || "draft",
      seoTitle: initialData?.seoTitle || "",
      seoDescription: initialData?.seoDescription || "",
    },
  })

  async function onSubmit(data: BlogPostFormValues) {
    setIsLoading(true)
    try {
      if (initialData) {
        await updateBlogPost(initialData.id, data)
        toast({
          title: "Artículo actualizado",
          description: "El artículo ha sido actualizado correctamente.",
        })
      } else {
        await createBlogPost(data)
        toast({
          title: "Artículo creado",
          description: "El artículo ha sido creado correctamente.",
        })
        form.reset()
      }
      router.push("/dashboard/blog")
      router.refresh()
    } catch (error) {
      console.error("Error submitting blog post:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el artículo. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Título del artículo" {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>Título principal del artículo.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="titulo-del-articulo" {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>
                URL amigable del artículo. Si lo dejas en blanco, se generará automáticamente a partir del título.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Extracto</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Breve resumen del artículo..."
                  className="min-h-[80px]"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>Resumen breve que aparecerá en las tarjetas y listados.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenido</FormLabel>
              <FormControl>
                <RichTextEditor value={field.value} onChange={field.onChange} disabled={isLoading} />
              </FormControl>
              <FormDescription>Contenido principal del artículo.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Desarrollo Web">Desarrollo Web</SelectItem>
                    <SelectItem value="Diseño UI/UX">Diseño UI/UX</SelectItem>
                    <SelectItem value="Inteligencia Artificial">Inteligencia Artificial</SelectItem>
                    <SelectItem value="Tecnología">Tecnología</SelectItem>
                    <SelectItem value="Programación">Programación</SelectItem>
                    <SelectItem value="Tendencias">Tendencias</SelectItem>
                    <SelectItem value="Tutoriales">Tutoriales</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Categoría principal del artículo.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="publishedAt"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de publicación</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        disabled={isLoading}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Selecciona una fecha (opcional)</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Fecha de publicación del artículo. Si no se selecciona, se usará la fecha actual.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tags"
          render={() => (
            <FormItem>
              <FormLabel>Etiquetas</FormLabel>
              <FormControl>
                <TagInput
                  placeholder="Añadir etiqueta..."
                  tags={form.watch("tags")}
                  setTags={(newTags) => form.setValue("tags", newTags)}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>Etiquetas para categorizar el artículo.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coverImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagen de portada</FormLabel>
              <FormControl>
                <ImageUpload value={field.value} onChange={field.onChange} disabled={isLoading} folder="blog" />
              </FormControl>
              <FormDescription>
                Imagen principal que se mostrará en las tarjetas y cabecera del artículo.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Destacado</FormLabel>
                  <FormDescription>Mostrar este artículo en la sección destacada del blog.</FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Estado actual del artículo.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 border rounded-md p-4">
          <h3 className="text-lg font-medium">SEO</h3>
          <FormField
            control={form.control}
            name="seoTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título SEO</FormLabel>
                <FormControl>
                  <Input placeholder="Título optimizado para SEO" {...field} disabled={isLoading} />
                </FormControl>
                <FormDescription>
                  Título optimizado para motores de búsqueda. Máximo 70 caracteres.
                  {field.value && (
                    <span className={`ml-2 ${field.value.length > 60 ? "text-amber-500" : ""}`}>
                      {field.value.length}/70
                    </span>
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="seoDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción SEO</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descripción optimizada para SEO..."
                    className="min-h-[80px]"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>
                  Descripción optimizada para motores de búsqueda. Máximo 160 caracteres.
                  {field.value && (
                    <span className={`ml-2 ${field.value.length > 150 ? "text-amber-500" : ""}`}>
                      {field.value.length}/160
                    </span>
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/blog")} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData ? "Actualizando..." : "Creando..."}
              </>
            ) : (
              <>{initialData ? "Actualizar artículo" : "Crear artículo"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
