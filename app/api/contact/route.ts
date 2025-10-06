import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

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
    console.log("🚀 Iniciando procesamiento de formulario de contacto...")
    
    // Verificar variables de entorno críticas
    const missingEnvVars = []
    if (!process.env.BREVO_API_KEY) missingEnvVars.push("BREVO_API_KEY")
    if (!process.env.RECAPTCHA_SECRET_KEY) missingEnvVars.push("RECAPTCHA_SECRET_KEY")
    if (!process.env.UPSTASH_REDIS_REST_URL) missingEnvVars.push("UPSTASH_REDIS_REST_URL")
    if (!process.env.UPSTASH_REDIS_REST_TOKEN) missingEnvVars.push("UPSTASH_REDIS_REST_TOKEN")
    
    if (missingEnvVars.length > 0) {
      console.error("❌ Variables de entorno faltantes:", missingEnvVars.join(", "))
      return NextResponse.json(
        { error: "Configuración del servidor incompleta. Por favor contacta al administrador." },
        { status: 500 }
      )
    }
    
    // Obtener la IP del cliente para rate limiting
    const ip = request.headers.get("x-forwarded-for") || "anonymous"
    console.log("📍 IP del cliente:", ip)

    // Verificar rate limit
    const { success, limit, reset, remaining } = await ratelimit.limit(ip)
    console.log("⏱️ Rate limit - Success:", success, "Remaining:", remaining)

    if (!success) {
      console.warn("⚠️ Rate limit excedido para IP:", ip)
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
    console.log("📥 Parseando datos del request...")
    const { safeParseJson } = await import('@/lib/requestUtils')
    const parsed = await safeParseJson(request)
    
    if (!parsed.ok) {
      console.error("❌ Error al parsear JSON:", parsed.error)
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    
    console.log("✅ Datos parseados correctamente")
    const result = contactSchema.safeParse(parsed.body)

    if (!result.success) {
      console.error("❌ Validación de esquema fallida:", result.error.format())
      return NextResponse.json(
        { error: "Datos de formulario inválidos", details: result.error.format() },
        { status: 400 },
      )
    }

    const { nombre, email, telefono, empresa, servicio, mensaje, recaptchaToken } = result.data
    console.log("👤 Procesando contacto de:", nombre, email)

    // Verificar reCAPTCHA
    console.log("🔐 Verificando reCAPTCHA...")
    const recaptchaResult = await verifyRecaptcha(recaptchaToken)
    console.log("🔐 Resultado reCAPTCHA:", { success: recaptchaResult.success, score: recaptchaResult.score })
    
    if (!recaptchaResult.success) {
      console.error("❌ Verificación de reCAPTCHA fallida:", recaptchaResult.errorCodes)
      return NextResponse.json(
        { 
          error: 'Verificación de seguridad fallida', 
          details: recaptchaResult.errorCodes 
        },
        { status: 400 }
      )
    }
    
    // Verificar puntuación de reCAPTCHA (0.0 a 1.0, donde 1.0 es muy probablemente un humano)
    if (recaptchaResult.score < 0.5) {
      console.warn("⚠️ Score de reCAPTCHA bajo:", recaptchaResult.score)
      return NextResponse.json(
        { error: 'La verificación de seguridad indica actividad sospechosa. Por favor, intenta nuevamente.' },
        { status: 400 }
      )
    }

    console.log("📧 Preparando emails con Brevo...")

    // Preparar datos para Brevo API
    const brevoApiKey = process.env.BREVO_API_KEY
    const senderEmail = process.env.BREVO_SENDER_EMAIL || "no-reply@nexius.lat"
    const senderName = process.env.BREVO_SENDER_NAME || "Nexius Team"

    // Email para el equipo
    const emailToTeam = {
      sender: { email: senderEmail, name: senderName },
      to: [{ email: "contacto@nexius.lat", name: "Equipo Nexius" }],
      subject: `Nuevo contacto: ${nombre} de ${empresa}`,
      textContent: `
Nombre: ${nombre}
Email: ${email}
Teléfono: ${telefono}
Empresa: ${empresa}
Servicio: ${servicio}
Mensaje: ${mensaje}
      `,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0056b3;">Nuevo contacto desde el sitio web</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <p><strong>Nombre:</strong> ${nombre}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Teléfono:</strong> ${telefono}</p>
            <p><strong>Empresa:</strong> ${empresa}</p>
            <p><strong>Servicio:</strong> ${servicio}</p>
            <p><strong>Mensaje:</strong></p>
            <p style="background-color: white; padding: 15px; border-left: 3px solid #0056b3;">${mensaje}</p>
          </div>
        </div>
      `,
    }

    // Email de confirmación para el cliente
    const emailToClient = {
      sender: { email: senderEmail, name: senderName },
      to: [{ email: email, name: nombre }],
      subject: "📩 ¡Hemos recibido tu solicitud! - Nexius Team",
      textContent: `
Hola ${nombre},

Gracias por comunicarte con Nexius. Hemos recibido tu mensaje y nuestro equipo lo revisará a la brevedad.

Si necesitas asistencia adicional, puedes contactarnos en cualquier momento a contacto@nexius.lat.

Atentamente,
El equipo de Nexius
      `,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
          <h2 style="color: #0056b3; text-align: center;">¡Hemos recibido tu mensaje!</h2>
          <p>Hola <strong>${nombre}</strong>,</p>
          <p>Gracias por comunicarte con <strong>Nexius</strong>. Hemos recibido tu mensaje y nuestro equipo lo revisará a la brevedad.</p>
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>📋 Resumen de tu solicitud:</strong></p>
            <p><strong>Servicio:</strong> ${servicio}</p>
            <p><strong>Empresa:</strong> ${empresa}</p>
          </div>
          <p>Si necesitas asistencia adicional, no dudes en escribirnos a <a href="mailto:contacto@nexius.lat" style="color: #0056b3; text-decoration: none;">contacto@nexius.lat</a>.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">Este es un correo automático, por favor no respondas a este mensaje.</p>
        </div>
      `,
    }

    try {
      console.log("📤 Enviando emails con Brevo...")
      
      // Enviar email al equipo
      const responseTeam = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": brevoApiKey!,
          "content-type": "application/json",
        },
        body: JSON.stringify(emailToTeam),
      })

      if (!responseTeam.ok) {
        const errorTeam = await responseTeam.json()
        console.error("❌ Error al enviar email al equipo:", errorTeam)
        throw new Error(`Error enviando email al equipo: ${errorTeam.message || responseTeam.statusText}`)
      }

      console.log("✅ Email enviado al equipo exitosamente")

      // Enviar email de confirmación al cliente
      const responseClient = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": brevoApiKey!,
          "content-type": "application/json",
        },
        body: JSON.stringify(emailToClient),
      })

      if (!responseClient.ok) {
        const errorClient = await responseClient.json()
        console.error("❌ Error al enviar email al cliente:", errorClient)
        // No lanzamos error aquí para que al menos el equipo reciba el email
        console.warn("⚠️ Email al equipo enviado, pero falló el email de confirmación al cliente")
      } else {
        console.log("✅ Email de confirmación enviado al cliente exitosamente")
      }

      return NextResponse.json({ success: true })
    } catch (emailError: any) {
      console.error("❌ Error al enviar emails:", emailError)
      console.error("Detalles del error:", {
        message: emailError?.message,
        code: emailError?.code,
      })
      
      return NextResponse.json({ 
        error: "Error al enviar el correo. Por favor verifica tu configuración de Brevo.",
        details: emailError?.message 
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error("❌ Error general en el servidor:", error)
    console.error("Stack trace:", error?.stack)
    
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 })
  }
}
