"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Loader2, Send, CheckCircle, Wand2, MessageCircle } from "lucide-react"
import { useRecaptcha } from "@/components/recaptcha-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

// Definir el esquema de validación
const formSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  email: z.string().email({ message: "Ingrese un email válido" }),
  telefono: z.string()
  .min(6, "El teléfono debe tener al menos 6 dígitos")
  .regex(/^\+?[0-9\s\-\(\)]+$/, "Ingrese un número de teléfono válido"),
  empresa: z.string().min(0, { message: "Ingrese el nombre de su empresa" }),
  servicio: z.string().min(1, { message: "Seleccione un servicio" }),
  mensaje: z.string().min(10, { message: "El mensaje debe tener al menos 10 caracteres" }),
})

type FormValues = z.infer<typeof formSchema>

// Componente para la animación de éxito
const SuccessAnimation = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-background bg-slate-100 dark:bg-background rounded-md z-10"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.5, times: [0, 0.7, 1] }}
        className="text-green-600 mb-4"
      >
        <CheckCircle size={80} className="stroke-2" />
      </motion.div>
      <motion.h3 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-bold text-foreground dark:text-foreground"
      >
        ¡Mensaje enviado con éxito!
      </motion.h3>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-2 text-center text-muted-foreground dark:text-muted-foreground max-w-xs"
      >
        Gracias por contactarnos. Responderemos a tu mensaje lo antes posible.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-6"
      >
        <div className="w-16 h-1 bg-green-600 rounded-full mx-auto" />
      </motion.div>
    </motion.div>
  )
}

import type { ServiceItem } from "@/types/homepage"

interface ContactFormProps {
  servicesFromDashboard?: ServiceItem[]
}

export default function ContactForm({ servicesFromDashboard }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { executeRecaptcha, isLoaded } = useRecaptcha()

  const whatsappNumber = "+51973648613" 
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      email: "",
      telefono: "",
      empresa: "",
      servicio: "",
      mensaje: "",
    },
  })

  // Generar opciones dinámicas desde servicios del dashboard (si existen)
  const dynamicServiceOptions = (servicesFromDashboard || []).map((s) => {
    const slug = s.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
    return { value: slug || s.id || s.title, label: s.title }
  })

  // Fallback legacy opciones (solo si no hay servicios en dashboard)
  const legacyOptions = [
    { value: "diseno-web", label: "Diseño Web" },
    { value: "desarrollo-medida", label: "Desarrollo a Medida" },
    { value: "sistema-restaurante", label: "Sistema para Restaurantes" },
    { value: "sistema-hotel", label: "Sistema para Hoteles" },
    { value: "e-commerce", label: "Sistema E-Commerce" },
    { value: "soporte", label: "Soporte Técnico" },
  ]

  const serviceOptions = dynamicServiceOptions.length > 0 ? dynamicServiceOptions : legacyOptions

  // Función para formatear el mensaje de WhatsApp
  const formatWhatsAppMessage = (data: FormValues) => {
    const mapDynamic: Record<string, string> = {}
    serviceOptions.forEach((o) => (mapDynamic[o.value] = o.label))
    mapDynamic["otro"] = "Otro"
    const servicioTexto = mapDynamic[data.servicio] || data.servicio

    return `¡Hola! Me gustaría contactar con ustedes.

  *Mis datos:*
  • Nombre: ${data.nombre}
  • Email: ${data.email}
  • Teléfono: ${data.telefono}
  ${data.empresa ? `• Empresa: ${data.empresa}` : ""}

  *Servicio de interés:* ${servicioTexto}

  *Mensaje:*
  ${data.mensaje}

  Quedo atento a su respuesta. ¡Gracias!`
  }

  // Función para enviar por WhatsApp
  const handleWhatsAppSubmit = () => {
    const formData = form.getValues()
    
    // Validar el formulario antes de enviar
    form.trigger().then((isValid) => {
      if (isValid) {
        const message = formatWhatsAppMessage(formData)
        const encodedMessage = encodeURIComponent(message)
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
        
        // Abrir WhatsApp en una nueva ventana
        window.open(whatsappUrl, '_blank')
        
        // Mostrar toast de confirmación
        toast({
          title: "Redirigiendo a WhatsApp",
          description: "Se abrirá WhatsApp con tu mensaje preparado.",
        })
      } else {
        toast({
          title: "Formulario incompleto",
          description: "Por favor, completa todos los campos obligatorios antes de enviar por WhatsApp.",
          variant: "destructive",
        })
      }
    })
  }

  // Función para enviar el formulario
  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)

    try {
      // Verificar si reCAPTCHA está cargado
      if (!isLoaded) {
        throw new Error("reCAPTCHA no está disponible. Por favor, recarga la página.")
      }

      // Obtener token de reCAPTCHA
      const recaptchaToken = await executeRecaptcha("contact_form")

      // Enviar datos a nuestra API
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          recaptchaToken,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al enviar el formulario")
      }

      // Mostrar animación de éxito
      setShowSuccess(true)
      
      // Mostrar mensaje de éxito en toast
      toast({
        title: "Formulario enviado",
        description: "Nos pondremos en contacto contigo pronto.",
      })

      // Resetear el formulario después de 3 segundos
      setTimeout(() => {
        form.reset()
        setShowSuccess(false)
      }, 3000)
    } catch (error) {
      // Mostrar mensaje de error
      toast({
        title: "Error al enviar",
        description:
          error instanceof Error ? error.message : "Hubo un problema al enviar tu mensaje. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full border border-border bg-card text-card-foreground shadow-sm dark:border-border dark:bg-card dark:text-card-foreground relative overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold">Contáctanos</CardTitle>
        <CardDescription>Completa el formulario y nos pondremos en contacto contigo lo antes posible.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">
                      Nombre completo <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tu nombre"
                        {...field}
                        className="bg-background border-input focus-visible:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">
                      Email <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        {...field}
                        className="bg-background border-input focus-visible:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">
                      Teléfono <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+123 456 7890"
                        {...field}
                        className="bg-background border-input focus-visible:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="empresa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Empresa</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nombre de tu empresa"
                        {...field}
                        className="bg-background border-input focus-visible:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="servicio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Servicio de interés</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="bg-background border-input focus-visible:ring-primary">
                        <SelectValue placeholder="Selecciona un servicio" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border max-h-72">
                        {serviceOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mensaje"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Mensaje <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Cuéntanos sobre tu proyecto o necesidad..."
                      className="min-h-[120px] bg-background border-input focus-visible:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-xs text-muted-foreground text-center mt-2">
              Al enviar, acepto los{" "}
              <Link 
                href="/terms-of-service" 
                target="_blank" 
                className="underline hover:text-primary"
              >
                Términos y Condiciones
              </Link>
              {", "}
              <Link 
                href="/privacy-policy" 
                target="_blank" 
                className="underline hover:text-primary"
              >
                Política de Privacidad
              </Link>
              {" y "}
              <Link
                href="https://policies.google.com/privacy"
                target="_blank"
                className="underline hover:text-primary"
              >
                reCAPTCHA
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar mensaje
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleWhatsAppSubmit}
                className="flex-1 bg-green-700 hover:bg-green-700/90 hover:text-primary-foreground text-primary-foreground"
                disabled={isSubmitting}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Enviar por WhatsApp
              </Button>
            </div>
          </form>
        </Form>
        
        {/* Animación de éxito */}
        <AnimatePresence>
          {showSuccess && <SuccessAnimation />}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}