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
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { createProject, updateProject } from "@/lib/projects-client"
import { ImageUpload } from "@/components/dashboard/image-upload"
import { GalleryUpload } from "@/components/dashboard/gallery-upload"
import { TagInput } from "@/components/dashboard/tag-input"

const projectFormSchema = z.object({
  name: z.string().min(3, {
    message: "El nombre del proyecto debe tener al menos 3 caracteres.",
  }),
  description: z.string().min(10, {
    message: "La descripción debe tener al menos 10 caracteres.",
  }),
  client: z.string().min(2, {
    message: "El nombre del cliente debe tener al menos 2 caracteres.",
  }),
  startDate: z.date({
    required_error: "La fecha de inicio es requerida.",
  }),
  completionDate: z.date().optional(),
  technologies: z.array(z.string()).min(1, {
    message: "Selecciona al menos una tecnología.",
  }),
  featured: z.boolean().default(false),
  completed: z.boolean().default(false),
  imageUrl: z.string().min(1, {
    message: "La imagen del proyecto es requerida.",
  }),
  gallery: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  url: z
    .string()
    .url({
      message: "Debe ser una URL válida.",
    })
    .optional()
    .or(z.literal("")),
  githubUrl: z
    .string()
    .url({
      message: "Debe ser una URL válida.",
    })
    .optional()
    .or(z.literal("")),
})

type ProjectFormValues = z.infer<typeof projectFormSchema>

interface ProjectFormProps {
  initialData?: any
}

export function ProjectForm({ initialData }: ProjectFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      client: initialData?.client || "",
      startDate: initialData?.startDate ? new Date(initialData.startDate) : new Date(),
      completionDate: initialData?.completionDate ? new Date(initialData.completionDate) : undefined,
      technologies: initialData?.technologies || [],
      featured: initialData?.featured || false,
      completed: initialData?.completed || false,
      imageUrl: initialData?.imageUrl || "",
      gallery: initialData?.gallery || [],
      tags: initialData?.tags || [],
      url: initialData?.url || "",
      githubUrl: initialData?.githubUrl || "",
    },
  })

  async function onSubmit(data: ProjectFormValues) {
    setIsLoading(true)
    try {
      if (initialData) {
        await updateProject(initialData._id, data)
        toast({
          title: "Proyecto actualizado",
          description: "El proyecto ha sido actualizado correctamente.",
        })
      } else {
        await createProject(data)
        toast({
          title: "Proyecto creado",
          description: "El proyecto ha sido creado correctamente.",
        })
        form.reset()
      }
      router.push("/dashboard/projects")
      router.refresh()
    } catch (error) {
      console.error("Error submitting project:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el proyecto. Intenta nuevamente.",
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del proyecto</FormLabel>
              <FormControl>
                <Input placeholder="Sitio web corporativo" {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>Nombre que identifica al proyecto.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Desarrollo de un sitio web corporativo con sistema de gestión de contenidos..."
                  className="min-h-[120px]"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>Descripción detallada del proyecto.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="client"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del cliente" {...field} disabled={isLoading} />
                </FormControl>
                <FormDescription>Nombre de la empresa o cliente.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de inicio</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        disabled={isLoading}
                      >
                        {field.value ? format(field.value, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>Fecha en que se inició el proyecto.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="completionDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de finalización</FormLabel>
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
                Fecha en que se finalizó el proyecto. Dejar en blanco si aún está en desarrollo.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="technologies"
          render={() => (
            <FormItem>
              <FormLabel>Tecnologías utilizadas</FormLabel>
              <FormControl>
                <TagInput
                  placeholder="Añadir tecnología..."
                  tags={form.watch("technologies")}
                  setTags={(newTags) => form.setValue("technologies", newTags)}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>Tecnologías y herramientas utilizadas en el proyecto.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={() => (
            <FormItem>
              <FormLabel>Etiquetas</FormLabel>
              <FormControl>
                <TagInput
                  placeholder="Añadir etiqueta..."
                  tags={form.watch("tags") || []}
                  setTags={(newTags) => form.setValue("tags", newTags)}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>Etiquetas para categorizar el proyecto (ej: web, móvil, ecommerce).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL del proyecto</FormLabel>
                <FormControl>
                  <Input placeholder="https://ejemplo.com" {...field} disabled={isLoading} />
                </FormControl>
                <FormDescription>URL donde se puede ver el proyecto en vivo (opcional).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="githubUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL del repositorio</FormLabel>
                <FormControl>
                  <Input placeholder="https://github.com/usuario/proyecto" {...field} disabled={isLoading} />
                </FormControl>
                <FormDescription>URL del repositorio de código (opcional).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                  <FormDescription>
                    Mostrar este proyecto en la sección destacada de la página de inicio.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="completed"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Completado</FormLabel>
                  <FormDescription>Marcar este proyecto como completado.</FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagen principal</FormLabel>
              <FormControl>
                <ImageUpload value={field.value} onChange={field.onChange} disabled={isLoading} />
              </FormControl>
              <FormDescription>Imagen principal que se mostrará en las tarjetas y listas de proyectos.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gallery"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Galería de imágenes</FormLabel>
              <FormControl>
                <GalleryUpload value={field.value || []} onChange={field.onChange} disabled={isLoading} />
              </FormControl>
              <FormDescription>Imágenes adicionales del proyecto para mostrar en la página detallada.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {initialData ? "Actualizando..." : "Creando..."}
            </>
          ) : (
            <>{initialData ? "Actualizar proyecto" : "Crear proyecto"}</>
          )}
        </Button>
      </form>
    </Form>
  )
}
