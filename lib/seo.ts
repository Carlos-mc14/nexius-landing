import { connectToDatabase, getWithCache, invalidateCache } from "./db"

const COLLECTION = "seo"
const CACHE_KEY = "seo:config"

export interface SeoConfig {
  title: string
  description: string
  keywords: string
  ogImage: string
  favicon: string
  themeColor: string
  twitterHandle: string
  siteUrl: string
  googleAnalyticsId?: string
  facebookAppId?: string
  additionalMetaTags?: { name: string; content: string }[]
}

// Obtener la configuración SEO
export async function getSeoConfig(): Promise<SeoConfig> {
  return getWithCache(
    CACHE_KEY,
    async () => {
      const { db } = await connectToDatabase()
      const config = await db.collection(COLLECTION).findOne({ id: "main" })

      if (!config) {
        return getDefaultSeoConfig()
      }

      // Convertir el documento a SeoConfig con un casting seguro
      return {
        title: config.title || "",
        description: config.description || "",
        keywords: config.keywords || "",
        ogImage: config.ogImage || "",
        favicon: config.favicon || "",
        themeColor: config.themeColor || "",
        twitterHandle: config.twitterHandle || "",
        siteUrl: config.siteUrl || "",
        googleAnalyticsId: config.googleAnalyticsId || "",
        facebookAppId: config.facebookAppId || "",
        additionalMetaTags: config.additionalMetaTags || [],
      } as SeoConfig
    },
    60, // Cache for 1 minute
  )
}

// Actualizar la configuración SEO
export async function updateSeoConfig(data: Partial<SeoConfig>): Promise<SeoConfig> {
  try {
    const { db } = await connectToDatabase()

    const updateData = {
      ...data,
      id: "main", // Aseguramos que siempre tenga el ID correcto
      updatedAt: new Date(),
    }

    const result = await db
      .collection(COLLECTION)
      .findOneAndUpdate({ id: "main" }, { $set: updateData }, { upsert: true, returnDocument: "after" })

    // Invalidar caché
    await invalidateCache(CACHE_KEY)

    // Convertir el resultado a SeoConfig con un casting seguro
    const config = result?.value || result || {}

    return {
      title: config.title || "",
      description: config.description || "",
      keywords: config.keywords || "",
      ogImage: config.ogImage || "",
      favicon: config.favicon || "",
      themeColor: config.themeColor || "",
      twitterHandle: config.twitterHandle || "",
      siteUrl: config.siteUrl || "",
      googleAnalyticsId: config.googleAnalyticsId || "",
      facebookAppId: config.facebookAppId || "",
      additionalMetaTags: config.additionalMetaTags || [],
    } as SeoConfig
  } catch (error) {
    console.error("Error updating SEO config:", error)
    throw error
  }
}

// Configuración SEO por defecto
function getDefaultSeoConfig(): SeoConfig {
  return {
    title: "Nexius | Soluciones Digitales",
    description:
      "Desarrollamos software a medida, sitios web y sistemas especializados para restaurantes, hoteles y más.",
    keywords:
      "desarrollo web, software a medida, sistemas para restaurantes, sistemas para hoteles, aplicaciones móviles",
    ogImage: "/images/og-image.jpg",
    favicon: "/favicon.ico",
    themeColor: "#000000",
    twitterHandle: "@nexiuslat",
    siteUrl: "https://nexius.lat",
    googleAnalyticsId: "",
    facebookAppId: "",
    additionalMetaTags: [],
  }
}
