"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { updateHomepageSection } from "@/lib/homepage-client"
import { ImageUpload } from "../image-upload"

const heroFormSchema = z.object({
  title: z.string().min(5, { message: "El título debe tener al menos 5 caracteres" }),
  subtitle: z.string().min(10, { message: "El subtítulo debe tener al menos 10 caracteres" }),
  image: z.string().min(1, { message: "La imagen es requerida" }),
  primaryButtonText: z.string().min(1, { message: "El texto del botón principal es requerido" }),
  primaryButtonUrl: z.string().min(1, { message: "La URL del botón principal es requerida" }),
  secondaryButtonText: z.string().optional(),
  secondaryButtonUrl: z.string().optional(),
})

type HeroFormValues = z.infer<typeof heroFormSchema>

interface HeroSectionFormProps {
  initialData: any
}

export function HeroSectionForm({ initialData }: HeroSectionFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<HeroFormValues>({
    resolver: zodResolver(heroFormSchema),
    defaultValues: initialData || {
      title: "",
      subtitle: "",
      image: "",
      primaryButtonText: "",
      primaryButtonUrl: "",
      secondaryButtonText: "",
      secondaryButtonUrl: "",
    },
  })

  async function onSubmit(data: HeroFormValues) {
    setIsLoading(true)
    try {
      console.log("Submitting hero section data:", data)

      await updateHomepageSection("hero", data)
      toast({
        title: "Sección actualizada",
        description: "La sección Hero ha sido actualizada correctamente.",
      })
    } catch (error) {
      console.error("Error submitting hero section:", error)

      toast({
        title: "Error",
        description: "No se pudo actualizar la sección. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Título principal" {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>Título principal que aparecerá en la sección Hero.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtítulo</FormLabel>
              <FormControl>
                <Textarea placeholder="Descripción breve" className="min-h-[80px]" {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>Texto descriptivo que aparecerá debajo del título.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagen</FormLabel>
              <FormControl>
                <ImageUpload value={field.value} onChange={field.onChange} disabled={isLoading} />
              </FormControl>
              <FormDescription>Imagen que aparecerá en la sección Hero.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="primaryButtonText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Texto del botón principal</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Solicitar cotización" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="primaryButtonUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL del botón principal</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: /contacto" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="secondaryButtonText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Texto del botón secundario (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Nuestros servicios" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="secondaryButtonUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL del botón secundario (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: /servicios" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
