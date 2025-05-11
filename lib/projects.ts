import { ObjectId } from "mongodb"
import { connectToDatabase, getWithCache, invalidateCache } from "./db"
import { cache } from "react"
import { slugify } from "./utils"

const COLLECTION = "projects"
const CACHE_KEY_PREFIX = "project:"
const CACHE_KEY_ALL = `${CACHE_KEY_PREFIX}all`

// Actualizar la interfaz Project para incluir múltiples imágenes y slug
export interface Project {
  id: string
  name: string
  slug: string
  description: string
  fullDescription?: string
  image: string // Imagen principal
  gallery: string[] // Array de imágenes adicionales
  status: string
  category: string
  tags: string[]
  useCases?: { title: string; description: string }[]
  demoUrl?: string
  repoUrl?: string
  featured: boolean
  completionDate?: string | Date
  createdAt: Date
  updatedAt: Date
  deleted?: boolean
}

// Get all projects
export async function getProjects(): Promise<Project[]> {
  return getWithCache(
    CACHE_KEY_ALL,
    async () => {
      const { db } = await connectToDatabase()
      const projects = await db
        .collection(COLLECTION)
        .find({ deleted: { $ne: true } })
        .sort({ featured: -1, completionDate: -1, createdAt: -1 })
        .toArray()

      return projects.map(({ _id, ...project }) => ({
        id: _id.toString(),
        ...project,
        // Asegurar que slug exista
        slug: project.slug || slugify(project.name),
        // Asegurar que gallery sea un array
        gallery: project.gallery || [],
        // Verificar el tipo de completionDate antes de llamar a toISOString()
        completionDate: project.completionDate
          ? project.completionDate instanceof Date
            ? project.completionDate.toISOString()
            : project.completionDate
          : undefined,
      })) as Project[]
    },
    60, // Cache for 1 minute
  )
}

// Get featured projects
export async function getFeaturedProjects(limit = 6): Promise<Project[]> {
  const cacheKey = `${CACHE_KEY_PREFIX}featured:${limit}`

  return getWithCache(
    cacheKey,
    async () => {
      const { db } = await connectToDatabase()
      const projects = await db
        .collection(COLLECTION)
        .find({ featured: true, deleted: { $ne: true } })
        .sort({ completionDate: -1, createdAt: -1 })
        .limit(limit)
        .toArray()

      return projects.map(({ _id, ...project }) => ({
        id: _id.toString(),
        ...project,
        // Asegurar que slug exista
        slug: project.slug || slugify(project.name),
        // Asegurar que gallery sea un array
        gallery: project.gallery || [],
        // Verificar el tipo de completionDate antes de llamar a toISOString()
        completionDate: project.completionDate
          ? project.completionDate instanceof Date
            ? project.completionDate.toISOString()
            : project.completionDate
          : undefined,
      })) as Project[]
    },
    60, // Cache for 1 minute
  )
}

// Get completed projects
export async function getCompletedProjects(limit = 6): Promise<Project[]> {
  const cacheKey = `${CACHE_KEY_PREFIX}completed:${limit}`

  return getWithCache(
    cacheKey,
    async () => {
      const { db } = await connectToDatabase()
      const projects = await db
        .collection(COLLECTION)
        .find({ status: "Completado", deleted: { $ne: true } })
        .sort({ completionDate: -1, createdAt: -1 })
        .limit(limit)
        .toArray()

      return projects.map(({ _id, ...project }) => ({
        id: _id.toString(),
        ...project,
        // Asegurar que slug exista
        slug: project.slug || slugify(project.name),
        // Asegurar que gallery sea un array
        gallery: project.gallery || [],
        // Verificar el tipo de completionDate antes de llamar a toISOString()
        completionDate: project.completionDate
          ? project.completionDate instanceof Date
            ? project.completionDate.toISOString()
            : project.completionDate
          : undefined,
      })) as Project[]
    },
    60, // Cache for 1 minute
  )
}

// Get a project by ID
export const getProjectById = cache(async (id: string) => {
  try {
    const { db } = await connectToDatabase()
    const project = await db.collection(COLLECTION).findOne({
      $or: [{ _id: new ObjectId(id) }, { id: id }],
      deleted: { $ne: true },
    })

    if (!project) return null

    const { _id, ...rest } = project
    return {
      id: _id.toString(),
      ...rest,
      // Asegurar que slug exista
      slug: rest.slug || slugify(rest.name),
      // Asegurar que gallery sea un array
      gallery: rest.gallery || [],
      // Verificar el tipo de completionDate antes de llamar a toISOString()
      completionDate: rest.completionDate
        ? rest.completionDate instanceof Date
          ? rest.completionDate.toISOString()
          : rest.completionDate
        : undefined,
    } as Project
  } catch (error) {
    console.error(`Error fetching project with ID ${id}:`, error)
    return null
  }
})

// Obtener proyecto por slug
export const getProjectBySlug = cache(async (slug: string) => {
  try {
    const { db } = await connectToDatabase()
    const project = await db.collection(COLLECTION).findOne({
      slug: slug,
      deleted: { $ne: true },
    })

    if (!project) return null

    const { _id, ...rest } = project
    return {
      id: _id.toString(),
      ...rest,
      // Asegurar que gallery sea un array
      gallery: rest.gallery || [],
      // Verificar el tipo de completionDate antes de llamar a toISOString()
      completionDate: rest.completionDate
        ? rest.completionDate instanceof Date
          ? rest.completionDate.toISOString()
          : rest.completionDate
        : undefined,
    } as Project
  } catch (error) {
    console.error(`Error fetching project with slug ${slug}:`, error)
    return null
  }
})

// Corregir la función createProject para manejar correctamente el _id y generar slug
export async function createProject(data: Partial<Project>): Promise<Project> {
  try {
    const { db } = await connectToDatabase()

    const now = new Date()

    // Generar slug si no existe
    const slug = data.slug || slugify(data.name || "proyecto")

    // Verificar si el slug ya existe
    const existingProject = await db.collection(COLLECTION).findOne({
      slug: slug,
      deleted: { $ne: true },
    })

    // Si el slug existe, añadir un identificador único
    const finalSlug = existingProject ? `${slug}-${Math.floor(Math.random() * 1000)}` : slug

    const projectData: any = {
      ...data,
      slug: finalSlug,
      gallery: data.gallery || [],
      featured: data.featured || false,
      status: data.status || "En Progreso",
      tags: data.tags || [],
      createdAt: now,
      updatedAt: now,
      deleted: false,
    }

    const result = await db.collection(COLLECTION).insertOne(projectData)

    // Invalidate cache
    await invalidateCache(CACHE_KEY_ALL)
    await invalidateCache(`${CACHE_KEY_PREFIX}featured:*`)
    await invalidateCache(`${CACHE_KEY_PREFIX}completed:*`)

    return {
      id: result.insertedId.toString(),
      ...projectData,
      // Asegurarse de que no haya un _id en el objeto retornado
      _id: undefined,
    } as Project
  } catch (error) {
    console.error("Error creating project:", error)
    throw error
  }
}

// Corregir la función updateProject para manejar correctamente el _id y actualizar slug si es necesario
export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  try {
    const { db } = await connectToDatabase()

    // Si el nombre cambia y no se proporciona un slug, regenerar el slug
    if (data.name && !data.slug) {
      data.slug = slugify(data.name)

      // Verificar si el nuevo slug ya existe (excluyendo el proyecto actual)
      const existingProject = await db.collection(COLLECTION).findOne({
        slug: data.slug,
        _id: { $ne: new ObjectId(id) },
        deleted: { $ne: true },
      })

      // Si el slug existe, añadir un identificador único
      if (existingProject) {
        data.slug = `${data.slug}-${Math.floor(Math.random() * 1000)}`
      }
    }

    const updateData = {
      ...data,
      updatedAt: new Date(),
    }

    // Remove id from update data if present
    delete updateData.id

    const result = await db
      .collection(COLLECTION)
      .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updateData }, { returnDocument: "after" })

    if (!result) {
      throw new Error(`No se encontró el proyecto con ID ${id}`)
    }

    // Invalidate cache
    await invalidateCache(CACHE_KEY_ALL)
    await invalidateCache(`${CACHE_KEY_PREFIX}id:${id}`)
    await invalidateCache(`${CACHE_KEY_PREFIX}slug:${result.slug}`)
    await invalidateCache(`${CACHE_KEY_PREFIX}featured:*`)
    await invalidateCache(`${CACHE_KEY_PREFIX}completed:*`)

    // Convertir _id a id y eliminar _id
    const { _id, ...rest } = result
    return {
      id: _id.toString(),
      ...rest,
      // Asegurar que gallery sea un array
      gallery: rest.gallery || [],
    } as Project
  } catch (error) {
    console.error(`Error updating project with ID ${id}:`, error)
    throw error
  }
}

// Delete a project (soft delete)
export async function deleteProject(id: string): Promise<void> {
  try {
    const { db } = await connectToDatabase()

    // Obtener el proyecto para conocer su slug antes de eliminarlo
    const project = await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) })

    await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          deleted: true,
          updatedAt: new Date(),
        },
      },
    )

    // Invalidate cache
    await invalidateCache(CACHE_KEY_ALL)
    await invalidateCache(`${CACHE_KEY_PREFIX}id:${id}`)
    if (project && project.slug) {
      await invalidateCache(`${CACHE_KEY_PREFIX}slug:${project.slug}`)
    }
    await invalidateCache(`${CACHE_KEY_PREFIX}featured:*`)
    await invalidateCache(`${CACHE_KEY_PREFIX}completed:*`)
  } catch (error) {
    console.error(`Error deleting project with ID ${id}:`, error)
    throw error
  }
}
