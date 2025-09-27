"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Loader2, Trash2 } from "lucide-react"
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
import { createPromotion, updatePromotion } from "@/lib/promotions-client"
import { ImageUpload } from "@/components/dashboard/image-upload"

const promotionFormSchema = z
  .object({
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
    description: z.string().min(10, {
      message: "La descripción debe tener al menos 10 caracteres.",
    }),
    promotionId: z
      .string()
      .min(3, {
        message: "El ID de promoción debe tener al menos 3 caracteres.",
      })
      .optional(),
    stock: z.number().min(0, {
      message: "El stock debe ser un número positivo.",
    }),
    startDate: z.date({
      required_error: "La fecha de inicio es requerida.",
    }),
    endDate: z.date({
      required_error: "La fecha de fin es requerida.",
    }),
    coverImage: z.string().min(1, {
      message: "La imagen de portada es requerida.",
    }),
    discountPercentage: z.number().min(0).max(100).optional(),
    originalPrice: z.number().min(0).optional(),
    discountedPrice: z.number().min(0).optional(),
    termsAndConditions: z.string().optional(),
    featured: z.boolean().default(false),
    status: z.enum(["active", "inactive"]).default("active"),
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
  .refine((data) => data.endDate > data.startDate, {
    message: "La fecha de fin debe ser posterior a la fecha de inicio.",
    path: ["endDate"],
  })

type PromotionFormValues = z.infer<typeof promotionFormSchema>

interface PromotionFormProps {
  initialData?: any
}

export function PromotionForm({ initialData }: PromotionFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      promotionId: initialData?.promotionId || "",
      stock: initialData?.stock || 0,
      startDate: initialData?.startDate ? new Date(initialData.startDate) : new Date(),
      endDate: initialData?.endDate ? new Date(initialData.endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      coverImage: initialData?.coverImage || "",
      discountPercentage: initialData?.discountPercentage || undefined,
      originalPrice: initialData?.originalPrice || undefined,
      discountedPrice: initialData?.discountedPrice || undefined,
      termsAndConditions: initialData?.termsAndConditions || "",
      featured: initialData?.featured || false,
      status: initialData?.status || "active",
      seoTitle: initialData?.seoTitle || "",
      seoDescription: initialData?.seoDescription || "",
    },
  })
  
  // Observar los campos relacionados con precios
  const discountPercentage = form.watch("discountPercentage");
  const originalPrice = form.watch("originalPrice");
  const discountedPrice = form.watch("discountedPrice");

  // Función para limpiar los campos de precios
  const clearPriceFields = () => {
    form.setValue("discountPercentage", undefined, { shouldValidate: true, shouldDirty: true });
    form.setValue("originalPrice", undefined, { shouldValidate: true, shouldDirty: true });
    form.setValue("discountedPrice", undefined, { shouldValidate: true, shouldDirty: true });
  };

  useEffect(() => {
    const disc = discountPercentage;
    const orig = originalPrice;
    const discPrice = discountedPrice;

    const isValidNumber = (val: number | undefined | null): val is number => {
      return val != null && !isNaN(val) && isFinite(val);
    };

    // Caso 1: Original + Descuento → calcular Precio con Descuento
    if (isValidNumber(orig) && isValidNumber(disc) && disc >= 0 && disc <= 100) {
      if (!isValidNumber(discPrice)) {
        const calculated = orig * (1 - disc / 100);
        if (isFinite(calculated) && calculated >= 0) {
          form.setValue("discountedPrice", parseFloat(calculated.toFixed(2)), {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
      }
    }
    // Caso 2: Original + Precio con Descuento → calcular Descuento (%)
    else if (isValidNumber(orig) && isValidNumber(discPrice) && orig > 0) {
      if (!isValidNumber(disc)) {
        const calculated = ((orig - discPrice) / orig) * 100;
        if (isFinite(calculated) && calculated >= 0 && calculated <= 100) {
          form.setValue("discountPercentage", parseFloat(calculated.toFixed(2)), {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
      }
    }
    // Caso 3: Descuento + Precio con Descuento → calcular Precio Original
    else if (isValidNumber(disc) && isValidNumber(discPrice) && disc >= 0 && disc < 100) {
      if (!isValidNumber(orig)) {
        const calculated = discPrice / (1 - disc / 100);
        if (isFinite(calculated) && calculated >= 0) {
          form.setValue("originalPrice", parseFloat(calculated.toFixed(2)), {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
      }
    }
  }, [discountPercentage, originalPrice, discountedPrice, form]);

  async function onSubmit(data: PromotionFormValues) {
    setIsLoading(true)
    try {
      if (initialData) {
        await updatePromotion(initialData.id, data)
        toast({
          title: "Promoción actualizada",
          description: "La promoción ha sido actualizada correctamente.",
        })
      } else {
        await createPromotion(data)
        toast({
          title: "Promoción creada",
          description: "La promoción ha sido creada correctamente.",
        })
        form.reset()
      }
      router.push("/dashboard/promotions")
      router.refresh()
    } catch (error) {
      console.error("Error submitting promotion:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la promoción. Intenta nuevamente.",
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
                <Input placeholder="Título de la promoción" {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>Título principal de la promoción.</FormDescription>
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
                <Input placeholder="titulo-de-la-promocion" {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>
                URL amigable de la promoción. Si lo dejas en blanco, se generará automáticamente a partir del título.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="promotionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID de Promoción</FormLabel>
              <FormControl>
                <Input placeholder="PROMO-2024-001" {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>
                ID único para identificación del cliente. Si lo dejas en blanco, se generará automáticamente.
              </FormDescription>
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
                  placeholder="Descripción detallada de la promoción..."
                  className="min-h-[120px]"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>Descripción completa que aparecerá en la página de la promoción.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Disponible</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="100"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>Cantidad disponible para esta promoción.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descuento (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="20"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>Porcentaje de descuento (opcional).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="originalPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio Original</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="100.00"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>Precio original del producto/servicio.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="discountedPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio con Descuento</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="80.00"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>Precio final con descuento aplicado.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botón para limpiar los campos de precios */}
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearPriceFields}
            disabled={isLoading}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Limpiar precios
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Inicio</FormLabel>
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
                          <span>Selecciona fecha de inicio</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormDescription>Fecha y hora de inicio de la promoción.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Fin</FormLabel>
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
                          <span>Selecciona fecha de fin</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormDescription>Fecha y hora de finalización de la promoción.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="termsAndConditions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Términos y Condiciones</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Términos y condiciones de la promoción..."
                  className="min-h-[100px]"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>Términos y condiciones aplicables a esta promoción.</FormDescription>
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
                <ImageUpload value={field.value} onChange={field.onChange} disabled={isLoading} folder="promotions" />
              </FormControl>
              <FormDescription>
                Imagen principal que se mostrará en las tarjetas y cabecera de la promoción.
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
                  <FormLabel>Destacada</FormLabel>
                  <FormDescription>
                    Mostrar esta promoción en la sección destacada de la página principal.
                  </FormDescription>
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
                    <SelectItem value="active">Activa</SelectItem>
                    <SelectItem value="inactive">Inactiva</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Estado actual de la promoción.</FormDescription>
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
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/promotions")}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData ? "Actualizando..." : "Creando..."}
              </>
            ) : (
              <>{initialData ? "Actualizar promoción" : "Crear promoción"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}