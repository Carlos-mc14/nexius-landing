// Validar que las variables de entorno necesarias estén definidas
const validateCloudflareEnv = () => {
    const requiredVars = ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ZONE_ID", "CLOUDFLARE_ACCOUNT_ID"]
    const missingVars = requiredVars.filter((varName) => !process.env[varName])
  
    if (missingVars.length > 0) {
      console.warn(`⚠️ Variables de entorno faltantes para Cloudflare: ${missingVars.join(", ")}`)
      return false
    }
    return true
  }
  
  // Función para obtener analíticas desde Cloudflare
  export async function getCloudflareAnalytics() {
    try {
      // En desarrollo o si faltan variables, usar datos simulados
      if (process.env.NODE_ENV === "development" || !validateCloudflareEnv()) {
        console.info("🔍 Usando datos simulados para Cloudflare")
        return getMockCloudflareAnalytics()
      }
  
      // Aquí iría la implementación real con la API de Cloudflare
      // Por ahora, devolvemos datos simulados
      return getMockCloudflareAnalytics()
    } catch (error) {
      console.error("Error fetching Cloudflare analytics:", error)
      return getMockCloudflareAnalytics()
    }
  }
  
  // Función auxiliar para calcular el cambio porcentual
  function calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return 0
    return Number.parseFloat((((current - previous) / previous) * 100).toFixed(1))
  }
  
  // Función auxiliar para formatear fechas
  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return `${date.getDate()} ${date.toLocaleString("default", { month: "short" })}`
  }
  
  // Datos simulados para el ejemplo o desarrollo
  function getMockCloudflareAnalytics() {
    return {
      visitors: {
        total: 12458,
        change: 8.3,
      },
      pageviews: {
        total: 35721,
        change: 12.7,
      },
      bounceRate: {
        rate: 42.5,
        change: -3.2,
      },
      trafficByDay: {
        labels: [
          "1 Nov",
          "2 Nov",
          "3 Nov",
          "4 Nov",
          "5 Nov",
          "6 Nov",
          "7 Nov",
          "8 Nov",
          "9 Nov",
          "10 Nov",
          "11 Nov",
          "12 Nov",
          "13 Nov",
          "14 Nov",
          "15 Nov",
          "16 Nov",
          "17 Nov",
          "18 Nov",
          "19 Nov",
          "20 Nov",
          "21 Nov",
          "22 Nov",
          "23 Nov",
          "24 Nov",
          "25 Nov",
          "26 Nov",
          "27 Nov",
          "28 Nov",
          "29 Nov",
          "30 Nov",
        ],
        values: [
          320, 350, 410, 450, 470, 380, 360, 390, 420, 450, 480, 520, 540, 500, 480, 460, 430, 410, 390, 410, 430, 450,
          470, 490, 510, 530, 550, 570, 590, 610,
        ],
      },
      topPages: {
        labels: ["/", "/servicios", "/portafolio", "/equipo", "/contacto"],
        values: [15200, 8500, 6300, 3200, 2500],
      },
      deviceDistribution: {
        labels: ["Móvil", "Desktop", "Tablet"],
        values: [65, 30, 5],
        colors: ["#4f46e5", "#10b981", "#f59e0b"],
      },
      trafficSources: {
        labels: ["Orgánico", "Directo", "Redes Sociales", "Referral", "Email"],
        values: [45, 25, 15, 10, 5],
        colors: ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
      },
      countries: {
        labels: ["Perú", "México", "Colombia", "España", "Chile"],
        values: [7500, 2100, 1400, 850, 600],
      },
    }
  }
  
  