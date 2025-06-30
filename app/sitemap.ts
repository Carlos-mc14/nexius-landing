import type { MetadataRoute } from "next"
import { getFeaturedProjects, getProjects } from "@/lib/projects"
import { getBlogPosts } from "@/lib/blog"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

  // Rutas estáticas
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/equipo`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ] as MetadataRoute.Sitemap

  
  // Obtener productos para rutas dinámicas
  try {
    // Obtener proyectos destacados
    const projects = await getFeaturedProjects()

    const projectRoutes = projects.map((project) => ({
      url: `${baseUrl}/portafolio/${project.slug}`,
      lastModified: project.updatedAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))

    // Obtener post de los blogs
    const blogs = await getBlogPosts()

    const blogRoutes = blogs.map((blog) => ({
      url: `${baseUrl}/portafolio/${blog.slug}`,
      lastModified: blog.updatedAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))


    return [...routes, ...projectRoutes, ...blogRoutes]
  } catch (error) {
    console.error("Error generating sitemap:", error)
    return routes
  }
}
