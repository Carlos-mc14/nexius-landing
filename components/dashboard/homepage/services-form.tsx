"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { updateHomepageSection } from "@/lib/homepage-client"

const serviceSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, { message: "El título debe tener al menos 2 caracteres" }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }),
  icon: z.string().min(1, { message: "Selecciona un icono" }),
})

const servicesFormSchema = z.object({
  services: z.array(serviceSchema).min(1, { message: "Debe haber al menos un servicio" }),
})

type ServicesFormValues = z.infer<typeof servicesFormSchema>

interface ServicesFormProps {
  initialData: any[]
}

// Available icons
const availableIcons = [
  { value: "Globe", label: "Sitio Web" },
  { value: "Server", label: "Servidor" },
  { value: "Database", label: "Base de Datos" },
  { value: "Code", label: "Código" },
  { value: "Phone", label: "Teléfono" },
  { value: "MessageSquare", label: "Mensaje" },
  { value: "ShoppingCart", label: "Carrito" },
  { value: "CreditCard", label: "Tarjeta" },
  { value: "Users", label: "Usuarios" },
  { value: "BarChart", label: "Gráfico" },
  { value: "FileText", label: "Documento" },
  { value: "Image", label: "Imagen" },
  { value: "Video", label: "Video" },
  { value: "Music", label: "Música" },
  { value: "Mail", label: "Correo" },
]

export function ServicesForm({ initialData }: ServicesFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ServicesFormValues>({
    resolver: zodResolver(servicesFormSchema),
    defaultValues: {
      services: initialData.map((service) => ({
        id: service.id || String(Math.random()),
        title: service.title,
        description: service.description,
        icon: service.icon,
      })),
    },
  })

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "services",
  })

  async function onSubmit(data: ServicesFormValues) {
    setIsLoading(true)
    try {
      await updateHomepageSection("services", data.services)
      toast({
        title: "Servicios actualizados",
        description: "Los servicios han sido actualizados correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar los servicios. Intenta nuevamente.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    move(result.source.index, result.destination.index)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <FormDescription>Arrastra y suelta para reordenar los servicios.</FormDescription>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  id: String(Math.random()),
                  title: "",
                  description: "",
                  icon: "Globe",
                })
              }
              disabled={isLoading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Añadir Servicio
            </Button>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="services">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {fields.map((field, index) => (
                    <Draggable key={field.id} draggableId={field.id} index={index}>
                      {(provided) => (
                        <Card ref={provided.innerRef} {...provided.draggableProps} className="relative border-dashed">
                          <div
                            {...provided.dragHandleProps}
                            className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move opacity-50 hover:opacity-100"
                          >
                            <GripVertical className="h-5 w-5" />
                          </div>
                          <CardContent className="p-4 pl-10">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                              <div className="md:col-span-1">
                                <FormField
                                  control={form.control}
                                  name={`services.${index}.icon`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Icono</FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={isLoading}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un icono" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {availableIcons.map((icon) => (
                                            <SelectItem key={icon.value} value={icon.value}>
                                              {icon.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="md:col-span-3 space-y-4">
                                <FormField
                                  control={form.control}
                                  name={`services.${index}.title`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Título</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Título del servicio" {...field} disabled={isLoading} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`services.${index}.description`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Descripción</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Descripción del servicio"
                                          className="min-h-[80px]"
                                          {...field}
                                          disabled={isLoading}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 text-destructive hover:text-destructive"
                              onClick={() => remove(index)}
                              disabled={isLoading || fields.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Eliminar servicio</span>
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
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
