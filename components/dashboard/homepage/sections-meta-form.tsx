"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateHomepageSection } from "@/lib/homepage-client"
import { toast } from "@/components/ui/use-toast"

// Definimos las claves permitidas para evitar introducir nuevas sin control.
const SECTION_KEYS = [
  "services",
  "whyChooseUs",
  "portfolio",
  "promotions",
  "blog",
  "testimonials",
  "contact",
] as const

const sectionMetaSchema = z.object({
  key: z.enum(SECTION_KEYS),
  badge: z.string().optional().nullable(),
  title: z.string().min(3, { message: "El título debe tener al menos 3 caracteres" }),
  description: z.string().optional().nullable(),
})

const sectionsMetaFormSchema = z.object({
  sections: z.array(sectionMetaSchema),
})

type SectionsMetaFormValues = z.infer<typeof sectionsMetaFormSchema>

interface SectionsMetaFormProps {
  initialData: Record<string, { badge?: string; title: string; description?: string }>
}

export function SectionsMetaForm({ initialData }: SectionsMetaFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const normalized = SECTION_KEYS.map((k) => ({
    key: k,
    badge: initialData?.[k]?.badge || "",
    title: initialData?.[k]?.title || "",
    description: initialData?.[k]?.description || "",
  }))

  const form = useForm<SectionsMetaFormValues>({
    resolver: zodResolver(sectionsMetaFormSchema),
    defaultValues: { sections: normalized },
  })

  const { fields } = useFieldArray({ control: form.control, name: "sections" })

  async function onSubmit(data: SectionsMetaFormValues) {
    setIsLoading(true)
    try {
      const payload: Record<string, { badge?: string; title: string; description?: string }> = {}
      data.sections.forEach((s) => {
        payload[s.key] = {
          badge: s.badge || undefined,
            title: s.title,
          description: s.description || undefined,
        }
      })
      await updateHomepageSection("sectionsMeta", payload)
      toast({
        title: "Metadatos actualizados",
        description: "Los encabezados de las secciones fueron guardados correctamente.",
      })
    } catch (e) {
      toast({
        title: "Error",
        description: "No se pudieron guardar los metadatos. Intenta nuevamente.",
        variant: "destructive",
      })
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          {fields.map((field, idx) => (
            <Card key={field.id} className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">
                  {form.getValues(`sections.${idx}.key`)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name={`sections.${idx}.badge`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Badge</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Texto corto (opcional)"
                          {...field}
                          value={field.value || ""}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>Etiqueta superior pequeña.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`sections.${idx}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Título de la sección" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`sections.${idx}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descripción (opcional)"
                          className="min-h-[70px]"
                          {...field}
                          value={field.value || ""}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          ))}
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
            </>
          ) : (
            "Guardar cambios"
          )}
        </Button>
      </form>
    </Form>
  )
}
