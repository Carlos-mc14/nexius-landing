"use client"

import type { SeoConfig } from "./seo"

// Obtener la configuración SEO
export async function getSeoConfig(): Promise<SeoConfig> {
  try {
    const response = await fetch("/api/seo")

    if (!response.ok) {
      throw new Error("Error al obtener la configuración SEO")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching SEO config:", error)
    throw error
  }
}

// Actualizar la configuración SEO
export async function updateSeoConfig(data: Partial<SeoConfig>): Promise<SeoConfig> {
  try {
    const response = await fetch("/api/seo", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error al actualizar la configuración SEO")
    }

    return await response.json()
  } catch (error) {
    console.error("Error updating SEO config:", error)
    throw error
  }
}
