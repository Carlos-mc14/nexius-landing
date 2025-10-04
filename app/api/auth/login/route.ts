import { NextResponse } from "next/server"
import { authenticateUser, createSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
  const { safeParseJson } = await import("@/lib/requestUtils")
  const parsed = await safeParseJson(request)
  if (!parsed.ok) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  const body = parsed.body
  const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    const user = await authenticateUser(email, password)

    if (!user) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const session = await createSession(user.id)

    return NextResponse.json(
      { success: true, user },
      {
        status: 200,
        headers: {
          "Set-Cookie": session.cookie,
        },
      },
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
