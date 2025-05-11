"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { TagInput } from "@/components/dashboard/tag-input"
import { ImageUpload } from "@/components/dashboard/image-upload"
import { GalleryUpload } from "@/components/dashboard/gallery-upload"
import { slugify } from "@/lib/utils"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Esquema de validación para el formulario
const projectFormSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  slug: z.string().min(2, {
    message: "El slug debe tener al menos 2 caracteres.",
  }),
  description: z.string().min(10, {
    message: "La descripción debe tener al menos 10 caracteres.",
  }),
  fullDescription: z.string().optional(),
  image: z.string().min(1, {
    message: "La imagen es obligatoria.",
  }),
  gallery: z.array(z.string()).optional(),
  status: z.string({
    required_error: "Por favor selecciona un estado.",
  }),
  category: z.string().min(1, {
    message: "La categoría es obligatoria.",
  }),
  tags: z.array(z.string()).min(1, {
    message: "Debes añadir al menos una etiqueta.",
  }),
  demoUrl: z.string().url({ message: "Debe ser una URL válida" }).optional().or(z.literal("")),
  repoUrl: z.string().url({ message: "Debe ser una URL válida" }).optional().or(z.literal("")),
  featured: z.boolean().default(false),
  completionDate: z.string().optional(),
  useCases: z
    .array(
      z.object({
        title: z.string().min(1, { message: "El título es obligatorio" }),
        description: z.string().min(1, { message: "La descripción es obligatoria" }),
      }),
    )
    .optional(),
})

type ProjectFormValues = z.infer<typeof projectFormSchema>

// Estados disponibles para un proyecto
const projectStatuses = [
  { value: "En Progreso", label: "En Progreso" },
  { value: "Completado", label: "Completado" },
  { value: "Pausado", label: "Pausado" },
  { value: "Cancelado", label: "Cancelado" },
]

// Categorías de proyectos
const projectCategories = [
  { value: "Web", label: "Desarrollo Web" },
  { value: "Móvil", label: "Desarrollo Móvil" },
  { value: "Desktop", label: "Aplicación de Escritorio" },
  { value: "API", label: "API / Backend" },
  { value: "E-commerce", label: "E-commerce" },
  { value: "CMS", label: "CMS / Gestor de Contenidos" },
  { value: "Otro", label: "Otro" },
]

interface ProjectFormProps {
  initialData?: any
}

export function ProjectForm({ initialData }: ProjectFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [useCases, setUseCases] = useState<{ title: string; description: string }[]>(initialData?.useCases || [])

  // Configuración del formulario con valores iniciales
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      fullDescription: initialData?.fullDescription || "",
      image: initialData?.image || "",
      gallery: initialData?.gallery || [],
      status: initialData?.status || "En Progreso",
      category: initialData?.category || "",
      tags: initialData?.tags || [],
      demoUrl: initialData?.demoUrl || "",
      repoUrl: initialData?.repoUrl || "",
      featured: initialData?.featured || false,
      completionDate: initialData?.completionDate
        ? typeof initialData.completionDate === "string"
          ? initialData.completionDate.split("T")[0]
          : new Date(initialData.completionDate).toISOString().split("T")[0]
        : "",
      useCases: initialData?.useCases || [],
    },
  })

  // Función para generar el slug a partir del nombre
  const generateSlug = () => {
    const name = form.getValues("name")
    if (name) {
      const slug = slugify(name)
      form.setValue("slug", slug)
    }
  }

  // Función para añadir un nuevo caso de uso
  const addUseCase = () => {
    const newUseCases = [...useCases, { title: "", description: "" }]
    setUseCases(newUseCases)
    form.setValue("useCases", newUseCases)
  }

  // Función para actualizar un caso de uso
  const updateUseCase = (index: number, field: "title" | "description", value: string) => {
    const newUseCases = [...useCases]
    newUseCases[index][field] = value
    setUseCases(newUseCases)
    form.setValue("useCases", newUseCases)
  }

  // Función para eliminar un caso de uso
  const removeUseCase = (index: number) => {
    const newUseCases = useCases.filter((_, i) => i !== index)
    setUseCases(newUseCases)
    form.setValue("useCases", newUseCases)
  }

  // Función para enviar el formulario
  async function onSubmit(data: ProjectFormValues) {
    try {
      setIsLoading(true)

      // Preparar los datos para enviar
      const projectData = {
        ...data,
        // Asegurarse de que los casos de uso estén incluidos
        useCases: useCases.filter((useCase) => useCase.title && useCase.description),
      }

      // Determinar si es una actualización o creación
      const url = initialData ? `/api/projects/${initialData.id}` : "/api/projects"
      const method = initialData ? "PUT" : "POST"

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al guardar el proyecto")
      }

      const result = await response.json()

      toast({
        title: initialData ? "Proyecto actualizado" : "Proyecto creado",
        description: initialData
          ? "El proyecto ha sido actualizado correctamente."
          : "El proyecto ha sido creado correctamente.",
      })

      // Redireccionar a la lista de proyectos
      router.push("/dashboard/projects")
      router.refresh()
    } catch (error: any) {
      console.error("Error al guardar el proyecto:", error)
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al guardar el proyecto.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="media">Multimedia</TabsTrigger>
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="usecases">Casos de Uso</TabsTrigger>
          </TabsList>

          {/* Pestaña General */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Proyecto</FormLabel>
                      <FormControl>
                        <Input placeholder="Mi Proyecto" {...field} />
                      </FormControl>
                      <FormDescription>El nombre visible del proyecto.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-end gap-2">
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="mi-proyecto" {...field} />
                        </FormControl>
                        <FormDescription>
                          Identificador único para URLs (sin espacios ni caracteres especiales).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="outline" onClick={generateSlug} className="mb-2">
                    Generar
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción Corta</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Breve descripción del proyecto..." className="resize-none" {...field} />
                      </FormControl>
                      <FormDescription>Una descripción breve que aparecerá en las tarjetas y listados.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fullDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción Completa</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descripción detallada del proyecto..."
                          className="resize-none min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Una descripción detallada que aparecerá en la página del proyecto.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña Multimedia */}
          <TabsContent value="media" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagen Principal</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>La imagen principal que representa al proyecto.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gallery"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Galería de Imágenes</FormLabel>
                      <FormControl>
                        <GalleryUpload
                          value={field.value || []}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>Imágenes adicionales para mostrar en la galería del proyecto.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña Detalles */}
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {projectStatuses.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>El estado actual del proyecto.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {projectCategories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>La categoría principal del proyecto.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Etiquetas / Tecnologías</FormLabel>
                      <FormControl>
                        <TagInput
                          placeholder="Añade una etiqueta y presiona Enter"
                          tags={field.value || []}
                          setTags={(newTags) => field.onChange(newTags)}
                        />
                      </FormControl>
                      <FormDescription>
                        Tecnologías, herramientas o conceptos relacionados con el proyecto.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="demoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL de Demo</FormLabel>
                        <FormControl>
                          <Input placeholder="https://ejemplo.com" {...field} />
                        </FormControl>
                        <FormDescription>Enlace a una demostración en vivo (opcional).</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="repoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL del Repositorio</FormLabel>
                        <FormControl>
                          <Input placeholder="https://github.com/usuario/repo" {...field} />
                        </FormControl>
                        <FormDescription>Enlace al repositorio de código (opcional).</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="completionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Finalización</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>Fecha en que se completó o se espera completar el proyecto.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Destacado</FormLabel>
                          <FormDescription>Mostrar este proyecto en secciones destacadas del sitio.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña Casos de Uso */}
          <TabsContent value="usecases" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Casos de Uso</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addUseCase}>
                    <Plus className="h-4 w-4 mr-2" /> Añadir Caso de Uso
                  </Button>
                </div>

                {useCases.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No hay casos de uso definidos. Añade casos de uso para mostrar ejemplos prácticos de cómo se
                      utiliza el proyecto.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {useCases.map((useCase, index) => (
                      <div key={index} className="border rounded-md p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Caso de Uso #{index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUseCase(index)}
                            className="text-destructive hover:text-destructive/90"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <FormLabel>Título</FormLabel>
                            <Input
                              value={useCase.title}
                              onChange={(e) => updateUseCase(index, "title", e.target.value)}
                              placeholder="Título del caso de uso"
                            />
                          </div>

                          <div>
                            <FormLabel>Descripción</FormLabel>
                            <Textarea
                              value={useCase.description}
                              onChange={(e) => updateUseCase(index, "description", e.target.value)}
                              placeholder="Descripción detallada del caso de uso"
                              className="resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/projects")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Actualizar Proyecto" : "Crear Proyecto"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
