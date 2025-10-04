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
  recaptchaToken: z.string().min(1, "Token de reCAPTCHA requerido"),
})

// Configurar rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(2000, "12 h"), // 2 solicitudes cada 12 horas por IP
})

// Verificar token de reCAPTCHA
async function verifyRecaptcha(token: string) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY
  
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    })
    
    const data = await response.json()
    
    return {
      success: data.success,
      score: data.score, // Puntuación entre 0.0 y 1.0
      action: data.action,
      hostname: data.hostname,
      errorCodes: data['error-codes'],
    }
  } catch (error) {
    console.error('Error al verificar reCAPTCHA:', error)
    return { success: false, score: 0, errorCodes: ['recaptcha-verify-failed'] }
  }
}
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
  const { safeParseJson } = await import('@/lib/requestUtils')
  const parsed = await safeParseJson(request)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const result = contactSchema.safeParse(parsed.body)

    if (!result.success) {
      return NextResponse.json(
        { error: "Datos de formulario inválidos", details: result.error.format() },
        { status: 400 },
      )
    }

    const { nombre, email, telefono, empresa, servicio, mensaje, recaptchaToken } = result.data

    // Verificar reCAPTCHA
    const recaptchaResult = await verifyRecaptcha(recaptchaToken)
    
    if (!recaptchaResult.success) {
      return NextResponse.json(
        { 
          error: 'Verificación de seguridad fallida', 
          details: recaptchaResult.errorCodes 
        },
        { status: 400 }
      )
    }
    
    // Verificar puntuación de reCAPTCHA (0.0 a 1.0, donde 1.0 es muy probablemente un humano)
    if (recaptchaResult.score < 0.8) {
      return NextResponse.json(
        { error: 'La verificación de seguridad indica actividad sospechosa. Por favor, intenta nuevamente.' },
        { status: 400 }
      )
    }

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
