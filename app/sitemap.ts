import type { MetadataRoute } from "next"
import { getFeaturedProjects} from "@/lib/projects"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

  // Rutas estáticas
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 2,
    },
    {
      url: `${baseUrl}/equipo`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 3,
    },
  ] as MetadataRoute.Sitemap

  try {
    // Obtener productos para rutas dinámicas
    const projects = await getFeaturedProjects()

    const projectRoutes = projects.map((project) => ({
      url: `${baseUrl}/portafolio/${project.slug}`,
      lastModified: project.updatedAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    }))

    return [...routes, ...projectRoutes]
  } catch (error) {
    console.error("Error generating sitemap:", error)
    return routes
  }
}
