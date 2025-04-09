import { ObjectId } from "mongodb"
import { connectToDatabase, getWithCache, invalidateCache } from "./db"

const COLLECTION = "projects"
const CACHE_KEY_PREFIX = "project:"
const CACHE_KEY_ALL = `${CACHE_KEY_PREFIX}all`

// Actualizar la interfaz Project para incluir múltiples imágenes
export interface Project {
  id: string
  name: string
  description: string
  image: string // Imagen principal
  gallery: string[] // Array de imágenes adicionales
  status: string
  category: string
  tags: string[]
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
export async function getProjectById(id: string): Promise<Project | null> {
  const cacheKey = `${CACHE_KEY_PREFIX}id:${id}`

  return getWithCache(
    cacheKey,
    async () => {
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
    },
    60, // Cache for 1 minute
  )
}

// Corregir la función createProject para manejar correctamente el _id
export async function createProject(data: Partial<Project>): Promise<Project> {
  try {
    const { db } = await connectToDatabase()

    const now = new Date()
    const projectData: any = {
      ...data,
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

// Corregir la función updateProject para manejar correctamente el _id
export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  try {
    const { db } = await connectToDatabase()

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
    await invalidateCache(`${CACHE_KEY_PREFIX}featured:*`)
    await invalidateCache(`${CACHE_KEY_PREFIX}completed:*`)
  } catch (error) {
    console.error(`Error deleting project with ID ${id}:`, error)
    throw error
  }
}
