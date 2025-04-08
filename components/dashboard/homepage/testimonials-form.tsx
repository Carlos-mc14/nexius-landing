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
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { updateHomepageSection } from "@/lib/homepage-client"

const testimonialSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  company: z.string().min(2, { message: "La empresa debe tener al menos 2 caracteres" }),
  text: z.string().min(10, { message: "El testimonio debe tener al menos 10 caracteres" }),
  pending: z.boolean().optional(),
})

const testimonialsFormSchema = z.object({
  testimonials: z.array(testimonialSchema).min(1, { message: "Debe haber al menos un testimonio" }),
})

type TestimonialsFormValues = z.infer<typeof testimonialsFormSchema>

interface TestimonialsFormProps {
  initialData: any[]
}

export function TestimonialsForm({ initialData }: TestimonialsFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<TestimonialsFormValues>({
    resolver: zodResolver(testimonialsFormSchema),
    defaultValues: {
      testimonials: initialData.map((testimonial) => ({
        id: testimonial.id || String(Math.random()),
        name: testimonial.name,
        company: testimonial.company,
        text: testimonial.text,
        pending: testimonial.pending || false,
      })),
    },
  })

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "testimonials",
  })

  async function onSubmit(data: TestimonialsFormValues) {
    setIsLoading(true)
    try {
      await updateHomepageSection("testimonials", data.testimonials)
      toast({
        title: "Testimonios actualizados",
        description: "Los testimonios han sido actualizados correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar los testimonios. Intenta nuevamente.",
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
            <FormDescription>Arrastra y suelta para reordenar los testimonios.</FormDescription>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  id: String(Math.random()),
                  name: "",
                  company: "",
                  text: "",
                  pending: false,
                })
              }
              disabled={isLoading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Añadir Testimonio
            </Button>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="testimonials">
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
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <FormField
                                control={form.control}
                                name={`testimonials.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Nombre del cliente" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`testimonials.${index}.company`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Empresa</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Nombre de la empresa" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="mt-4">
                              <FormField
                                control={form.control}
                                name={`testimonials.${index}.text`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Testimonio</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Texto del testimonio"
                                        className="min-h-[100px]"
                                        {...field}
                                        disabled={isLoading}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
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
                              <span className="sr-only">Eliminar testimonio</span>
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
