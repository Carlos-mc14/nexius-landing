function maskSensitiveKeys(obj: any, depth = 0): any {
  if (obj == null || depth > 5) return obj
  if (Array.isArray(obj)) return obj.map((v) => maskSensitiveKeys(v, depth + 1))
  if (typeof obj === 'object') {
    const out: any = {}
    for (const k of Object.keys(obj)) {
      const lower = k.toLowerCase()
      if (/(password|pass|token|secret|api[_-]?key|apikey|card|cvv|ssn|dob|email)/i.test(lower)) {
        out[k] = '***REDACTED***'
      } else {
        out[k] = maskSensitiveKeys(obj[k], depth + 1)
      }
    }
    return out
  }
  if (typeof obj === 'string') {
    if (obj.length > 200) return obj.slice(0, 200) + '...'
  }
  return obj
}

export async function safeParseJson(request: Request) {
  try {
    const body = await request.json()
    return { ok: true, body }
  } catch (err) {
    // attempt to read raw body for diagnostics but avoid leaking secrets in production
    try {
      const raw = await request.text()
      const isDev = process.env.NODE_ENV !== 'production' || process.env.DEBUG_REQUESTS === 'true'

      if (isDev) {
        // full raw body only in development/debug mode
        console.error('JSON parse failed. Raw body:', raw)
      } else {
        // try to parse and mask common sensitive keys, otherwise log truncated length
        try {
          const parsed = JSON.parse(raw)
          const masked = maskSensitiveKeys(parsed)
          console.error('JSON parse failed. Masked body preview:', JSON.stringify(masked))
        } catch (e) {
          console.error('JSON parse failed. Raw body length:', raw.length)
        }
      }
    } catch (e) {
      console.error('JSON parse failed and raw body could not be read:', e)
    }
    return { ok: false, error: 'Invalid JSON' }
  }
}
