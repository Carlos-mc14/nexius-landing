import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Importar SendGrid al inicio del archivo
import sgMail from "@sendgrid/mail"

// Esquema de validación
const contactSchema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  telefono: z.string().min(6),
  empresa: z.string().min(2),
  servicio: z.string().min(1),
  mensaje: z.string().min(10),
})

// Configurar rate limiting
// Nota: Necesitarás configurar Upstash Redis o usar otra solución
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(2, "12 h"), // 3 solicitudes por hora por IP
})

export async function POST(request: NextRequest) {
  try {
    // Obtener la IP del cliente para rate limiting
    const ip = request.headers.get("x-forwarded-for") || "anonymous"

    // Verificar rate limit
    const { success, limit, reset, remaining } = await ratelimit.limit(ip)

    if (!success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intenta más tarde." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        },
      )
    }

    // Obtener y validar los datos
    const body = await request.json()
    const result = contactSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: "Datos de formulario inválidos", details: result.error.format() },
        { status: 400 },
      )
    }

    const { nombre, email, telefono, empresa, servicio, mensaje } = result.data

    // Y en la función POST, reemplaza el comentario de SendGrid con:

    // Configurar SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || "")

    // Email para el equipo
    const msgTeam = {
      to: "contacto@nexius.lat", // Cambia esto a tu email real
      from: "no-reply@nexius.lat", // Cambia esto a un email verificado en SendGrid
      subject: `Nuevo contacto: ${nombre} de ${empresa}`,
      text: `
        Nombre: ${nombre}
        Email: ${email}
        Teléfono: ${telefono}
        Empresa: ${empresa}
        Servicio: ${servicio}
        Mensaje: ${mensaje}
      `,
      html: `
        <h2>Nuevo contacto desde el sitio web</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${telefono}</p>
        <p><strong>Empresa:</strong> ${empresa}</p>
        <p><strong>Servicio:</strong> ${servicio}</p>
        <p><strong>Mensaje:</strong> ${mensaje}</p>
      `,
    }

    // Email de confirmación para el cliente
    const msgClient = {
      to: email,
      from: "no-reply@nexius.lat", // Cambia esto a un email verificado en SendGrid
      subject: "📩 ¡Hemos recibido tu solicitud! - Nexius Team",
      text: `
        Hola ${nombre},
        
        Gracias por comunicarte con Nexius. Hemos recibido tu mensaje y nuestro equipo lo revisará a la brevedad.
        
        Si necesitas asistencia adicional, puedes contactarnos en cualquier momento a contacto@nexius.lat.
        
        Atentamente,
        El equipo de Nexius
      `,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
          <h2 style="color: #0056b3; text-align: center;">¡Hemos recibido tu mensaje!</h2>
          <p>Hola <strong>${nombre}</strong>,</p>
          <p>Gracias por comunicarte con <strong>Nexius</strong>. Hemos recibido tu mensaje y nuestro equipo lo revisará a la brevedad.</p>
          <p>Si necesitas asistencia adicional, no dudes en escribirnos a <a href="mailto:contacto@nexius.lat" style="color: #0056b3; text-decoration: none;">contacto@nexius.lat</a>.</p>
          <hr style="border: none; border-top: 1px solid #ddd;">
        </div>
      `,
    }

    try {
      await Promise.all([sgMail.send(msgTeam), sgMail.send(msgClient)])

      return NextResponse.json({ success: true })
    } catch (emailError) {
      console.error("Error al enviar emails:", emailError)
      return NextResponse.json({ error: "Something went wrong. (1)" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error en el servidor:", error)
    return NextResponse.json({ error: "Something went wrong. (2)" }, { status: 500 })
  }
}

