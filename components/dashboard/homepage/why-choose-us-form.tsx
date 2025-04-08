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

const reasonSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, { message: "El título debe tener al menos 2 caracteres" }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }),
})

const whyChooseUsFormSchema = z.object({
  reasons: z.array(reasonSchema).min(1, { message: "Debe haber al menos una razón" }),
})

type WhyChooseUsFormValues = z.infer<typeof whyChooseUsFormSchema>

interface WhyChooseUsFormProps {
  initialData: any[]
}

export function WhyChooseUsForm({ initialData }: WhyChooseUsFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<WhyChooseUsFormValues>({
    resolver: zodResolver(whyChooseUsFormSchema),
    defaultValues: {
      reasons: initialData.map((reason) => ({
        id: reason.id || String(Math.random()),
        title: reason.title,
        description: reason.description,
      })),
    },
  })

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "reasons",
  })

  async function onSubmit(data: WhyChooseUsFormValues) {
    setIsLoading(true)
    try {
      await updateHomepageSection("whyChooseUs", data.reasons)
      toast({
        title: "Razones actualizadas",
        description: "Las razones han sido actualizadas correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar las razones. Intenta nuevamente.",
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
            <FormDescription>Arrastra y suelta para reordenar las razones.</FormDescription>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  id: String(Math.random()),
                  title: "",
                  description: "",
                })
              }
              disabled={isLoading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Añadir Razón
            </Button>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="reasons">
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
                            <FormField
                              control={form.control}
                              name={`reasons.${index}.title`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Título</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Título de la razón" {...field} disabled={isLoading} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="mt-4">
                              <FormField
                                control={form.control}
                                name={`reasons.${index}.description`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Descripción de la razón"
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

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 text-destructive hover:text-destructive"
                              onClick={() => remove(index)}
                              disabled={isLoading || fields.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Eliminar razón</span>
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
