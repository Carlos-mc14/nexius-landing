import { NextResponse } from "next/server"

export function getServerApiKey() {
  return process.env.NEXIUS_API_KEY || ""
}

export function requireApiKey(provided?: string | null) {
  const serverKey = getServerApiKey()
  if (!serverKey) return { ok: false, status: 500, body: { error: "Server API key not configured" } }
  if (!provided || provided !== serverKey) return { ok: false, status: 401, body: { error: "Unauthorized" } }
  return { ok: true }
}

export function requireApiKeyFromHeaders(headers: Headers) {
  const provided = headers.get("x-api-key") || headers.get("authorization")?.replace(/^Bearer\s+/i, "")
  return requireApiKey(provided)
}
