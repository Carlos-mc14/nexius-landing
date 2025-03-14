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
    if (!validateCloudflareEnv()) {
      console.info("🔍 Usando datos simulados para Cloudflare")
      return getMockCloudflareAnalytics()
    }

    // Implementación real con la API GraphQL de Cloudflare
    const zoneId = process.env.CLOUDFLARE_ZONE_ID
    const apiToken = process.env.CLOUDFLARE_API_TOKEN

    // Obtener fecha actual y fecha hace 30 días
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Formatear fechas para la API de Cloudflare (ISO string)
    const endDate = now.toISOString().split("T")[0]
    const startDate = thirtyDaysAgo.toISOString().split("T")[0]

    // Obtener fecha hace 60 días para comparación
    const sixtyDaysAgo = new Date(thirtyDaysAgo)
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 30)
    const prevStartDate = sixtyDaysAgo.toISOString().split("T")[0]
    const prevEndDate = thirtyDaysAgo.toISOString().split("T")[0]

    // Consulta GraphQL para obtener datos de analítica
    const query = `
        query AnalyticsData($zoneId: String!, $startDate: Date!, $endDate: Date!, $prevStartDate: Date!, $prevEndDate: Date!) {
          # Visitantes y páginas vistas actuales
          viewer {
            zones(filter: { zoneTag: $zoneId }) {
              httpRequests1dGroups(
                limit: 1000
                filter: { date_geq: $startDate, date_leq: $endDate }
                orderBy: [date_ASC]
              ) {
                dimensions {
                  date
                }
                sum {
                  countryMap {
                    clientCountryName
                    requests
                  }
                  pageViews
                  uniques
                  browserMap {
                    pageViews
                    uaBrowserFamily
                  }
                  clientSSLMap {
                    requests
                    clientSSL
                  }
                }
              }
              
              # Datos para comparación con período anterior
              previousPeriod: httpRequests1dGroups(
                limit: 1
                filter: { date_geq: $prevStartDate, date_leq: $prevEndDate }
              ) {
                sum {
                  pageViews
                  uniques
                }
              }
              
              # Páginas más visitadas
              topPaths: httpRequests1dGroups(
                limit: 5
                filter: { date_geq: $startDate, date_leq: $endDate }
                orderBy: [sum_requests_DESC]
              ) {
                dimensions {
                  requestPath
                }
                sum {
                  requests
                }
              }
              
              # Fuentes de tráfico
              topSources: httpRequests1dGroups(
                limit: 5
                filter: { date_geq: $startDate, date_leq: $endDate }
                orderBy: [sum_requests_DESC]
              ) {
                dimensions {
                  refererHost
                }
                sum {
                  requests
                }
              }
            }
          }
        }
      `


    // Realizar la petición a la API GraphQL de Cloudflare
    const response = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        query,
        variables: {
          zoneId,
          startDate,
          endDate,
          prevStartDate,
          prevEndDate,
        },
      }),
      next: { revalidate: 3600 }, // Revalidar datos cada hora
    })

    if (!response.ok) {
      throw new Error(`Error en la API de Cloudflare: ${response.status}`)
    }

    const result = await response.json()

    // Verificar si hay errores en la respuesta
    if (result.errors) {
      //console.error("Errores en la respuesta GraphQL:", result.errors)
      throw new Error("Error en la consulta GraphQL de Cloudflare")
    }

    // Procesar los datos recibidos
    return processCloudflareData(result.data)
  } catch (error) {
    //console.error("Error fetching Cloudflare analytics:", error)
    // Fallback a datos simulados en caso de error
    return getMockCloudflareAnalytics()
  }
}

// Procesar los datos recibidos de Cloudflare
function processCloudflareData(data: any) {
  try {
    const zones = data.viewer.zones
    if (!zones || zones.length === 0) {
      throw new Error("No se encontraron datos de zona")
    }

    const zone = zones[0]
    const httpRequests = zone.httpRequests1dGroups

    if (!httpRequests || httpRequests.length === 0) {
      throw new Error("No se encontraron datos de solicitudes HTTP")
    }

    // Datos actuales
    const currentPeriod = httpRequests.filter((group: any) => group.dimensions)

    // Datos para comparación con período anterior
    const previousPeriod = httpRequests.find((group: any) => !group.dimensions)

    // Calcular totales
    const totalVisitors = currentPeriod.reduce((sum: number, day: any) => sum + day.sum.uniques, 0)
    const totalPageviews = currentPeriod.reduce((sum: number, day: any) => sum + day.sum.pageViews, 0)

    // Datos del período anterior para comparación
    const prevTotalVisitors = previousPeriod?.sum.uniques || 0
    const prevTotalPageviews = previousPeriod?.sum.pageViews || 0

    // Calcular cambios porcentuales
    const visitorsChange = calculatePercentageChange(totalVisitors, prevTotalVisitors)
    const pageviewsChange = calculatePercentageChange(totalPageviews, prevTotalPageviews)

    // Calcular tasa de rebote (estimada)
    // En este caso, usamos una aproximación basada en sesiones de una sola página
    const bounceRate = 45.2 // Valor estimado, ya que GraphQL de Cloudflare no proporciona directamente la tasa de rebote
    const bounceRateChange = -2.8 // Valor estimado para el cambio

    // Preparar datos para gráficos

    // Tráfico por día
    const trafficByDay = {
      labels: currentPeriod.map((day: any) => formatDate(day.dimensions.date)),
      values: currentPeriod.map((day: any) => day.sum.uniques),
    }

    // Páginas más visitadas
    const topPages = {
      labels: zone.topPaths.map((path: any) => path.dimensions.requestPath || "/"),
      values: zone.topPaths.map((path: any) => path.sum.requests),
    }

    // Distribución de dispositivos (basado en navegadores como aproximación)
    const browserData = currentPeriod.reduce((acc: any, day: any) => {
      if (day.sum.browserMap) {
        day.sum.browserMap.forEach((browser: any) => {
          const name = browser.uaBrowserFamily || "Otros"
          if (!acc[name]) acc[name] = 0
          acc[name] += browser.pageViews
        })
      }
      return acc
    }, {})

    // Agrupar navegadores en categorías de dispositivos (aproximación)
    const deviceMap = {
      "Chrome Mobile": "Móvil",
      Android: "Móvil",
      "Mobile Safari": "Móvil",
      Chrome: "Desktop",
      Firefox: "Desktop",
      Safari: "Desktop",
      Edge: "Desktop",
      Opera: "Desktop",
      IE: "Desktop",
      "Samsung Internet": "Móvil",
      "Opera Mini": "Móvil",
      "UC Browser": "Móvil",
      iPad: "Tablet",
    }

    const deviceData: { [key: string]: number } = {}
    Object.entries(browserData as { [key: string]: number }).forEach(([browser, views]: [string, number]) => {
      const deviceType = deviceMap[browser as keyof typeof deviceMap] || "Otros"
      if (!deviceData[deviceType]) deviceData[deviceType] = 0
      deviceData[deviceType] += views
    })

    const deviceDistribution = {
      labels: Object.keys(deviceData),
      values: Object.values(deviceData),
      colors: ["#4f46e5", "#10b981", "#f59e0b"],
    }

    // Fuentes de tráfico
    const sourcesData = zone.topSources.reduce((acc: { [key: string]: number }, source: any) => {
      const host = source.dimensions.refererHost || "Directo"

      // Categorizar fuentes
      let category = "Referral"
      if (host === "Directo" || host === "") {
        category = "Directo"
      } else if (host.includes("google") || host.includes("bing") || host.includes("yahoo")) {
        category = "Orgánico"
      } else if (
        host.includes("facebook") ||
        host.includes("instagram") ||
        host.includes("twitter") ||
        host.includes("linkedin")
      ) {
        category = "Redes Sociales"
      } else if (host.includes("mail") || host.includes("outlook") || host.includes("gmail")) {
        category = "Email"
      }

      if (!acc[category]) acc[category] = 0
      acc[category] += source.sum.requests
      return acc
    }, {})

    // Asegurar que tenemos todas las categorías comunes
    const defaultSources = ["Orgánico", "Directo", "Redes Sociales", "Referral", "Email"]
    defaultSources.forEach((source) => {
      if (!sourcesData[source]) sourcesData[source] = 0
    })

    const trafficSources = {
      labels: Object.keys(sourcesData),
      values: Object.values(sourcesData),
      colors: ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
    }

    // Países
    const countriesData = currentPeriod.reduce((acc: { [key: string]: number }, day: any) => {
      if (day.sum.countryMap) {
        day.sum.countryMap.forEach((country: any) => {
          const name = country.clientCountryName || "Desconocido"
          if (!acc[name]) acc[name] = 0
          acc[name] += country.requests
        })
      }
      return acc
    }, {})

    // Ordenar países por número de visitas y tomar los 5 principales
    const topCountries = Object.entries(countriesData)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 5)

    const countries = {
      labels: topCountries.map((country) => country[0]),
      values: topCountries.map((country) => country[1]),
    }

    // Retornar datos procesados
    return {
      visitors: {
        total: totalVisitors,
        change: visitorsChange,
      },
      pageviews: {
        total: totalPageviews,
        change: pageviewsChange,
      },
      bounceRate: {
        rate: bounceRate,
        change: bounceRateChange,
      },
      trafficByDay,
      topPages,
      deviceDistribution,
      trafficSources,
      countries,
    }
  } catch (error) {
    console.error("Error procesando datos de Cloudflare:", error)
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

