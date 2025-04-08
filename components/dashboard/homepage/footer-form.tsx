"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Loader2, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { updateHomepageSection } from "@/lib/homepage-client"

const linkSchema = z.object({
  text: z.string().min(1, { message: "El texto es requerido" }),
  url: z.string().min(1, { message: "La URL es requerida" }),
})

const footerFormSchema = z.object({
  companyDescription: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }),
  links: z.object({
    company: z.array(linkSchema),
    legal: z.array(linkSchema),
  }),
  copyright: z.string().min(1, { message: "El texto de copyright es requerido" }),
})

type FooterFormValues = z.infer<typeof footerFormSchema>

interface FooterFormProps {
  initialData: any
}

export function FooterForm({ initialData }: FooterFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FooterFormValues>({
    resolver: zodResolver(footerFormSchema),
    defaultValues: initialData || {
      companyDescription: "",
      links: {
        company: [],
        legal: [],
      },
      copyright: `© ${new Date().getFullYear()} Nexius. Todos los derechos reservados.`,
    },
  })

  const companyLinks = useFieldArray({
    control: form.control,
    name: "links.company",
  })

  const legalLinks = useFieldArray({
    control: form.control,
    name: "links.legal",
  })

  async function onSubmit(data: FooterFormValues) {
    setIsLoading(true)
    try {
      await updateHomepageSection("footer", data)
      toast({
        title: "Footer actualizado",
        description: "El footer ha sido actualizado correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el footer. Intenta nuevamente.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="companyDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción de la Empresa</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Breve descripción de la empresa"
                  className="min-h-[80px]"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>Esta descripción aparecerá en el footer del sitio.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Enlaces de la Empresa</h3>
            <FormDescription>Enlaces que aparecerán en la sección "Empresa" del footer.</FormDescription>

            <div className="space-y-4 mt-4">
              {companyLinks.fields.map((field, index) => (
                <Card key={field.id} className="relative">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`links.company.${index}.text`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Texto</FormLabel>
                            <FormControl>
                              <Input placeholder="Sobre Nosotros" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`links.company.${index}.url`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL</FormLabel>
                            <FormControl>
                              <Input placeholder="/nosotros" {...field} disabled={isLoading} />
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
                      onClick={() => companyLinks.remove(index)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar enlace</span>
                    </Button>
                  </CardContent>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => companyLinks.append({ text: "", url: "" })}
                disabled={isLoading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Añadir Enlace
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Enlaces Legales</h3>
            <FormDescription>Enlaces que aparecerán en la sección "Legal" del footer.</FormDescription>

            <div className="space-y-4 mt-4">
              {legalLinks.fields.map((field, index) => (
                <Card key={field.id} className="relative">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`links.legal.${index}.text`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Texto</FormLabel>
                            <FormControl>
                              <Input placeholder="Términos y Condiciones" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`links.legal.${index}.url`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL</FormLabel>
                            <FormControl>
                              <Input placeholder="/terminos" {...field} disabled={isLoading} />
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
                      onClick={() => legalLinks.remove(index)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar enlace</span>
                    </Button>
                  </CardContent>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => legalLinks.append({ text: "", url: "" })}
                disabled={isLoading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Añadir Enlace
              </Button>
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="copyright"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto de Copyright</FormLabel>
              <FormControl>
                <Input placeholder="© 2023 Nexius. Todos los derechos reservados." {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>Texto de copyright que aparecerá en la parte inferior del footer.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
