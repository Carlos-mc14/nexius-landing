import { ObjectId } from "mongodb"
import { connectToDatabase, getWithCache, invalidateCache } from "./db"
import { slugify } from "./utils"

const COLLECTION = "promotions"
const CACHE_KEY_PREFIX = "promotions:"
const CACHE_KEY_ALL = `${CACHE_KEY_PREFIX}all`

export interface Promotion {
  id: string
  title: string
  slug: string
  description: string
  startDate: Date | string
  endDate: Date | string
  promotionId: string // Unique ID for client identification
  stock: number
  status: "active" | "inactive"
  featured: boolean
  termsAndConditions?: string
  discountPercentage?: number
  originalPrice?: number
  discountedPrice?: number
  coverImage: string
  author: {
    id: string
    name: string
    image?: string
  }
  seoTitle?: string
  seoDescription?: string
  createdAt: Date
  updatedAt: Date
  deleted?: boolean
}

// Get all promotions
export async function getPromotions(
  options: {
    status?: "active" | "inactive" | "all"
    limit?: number
    featured?: boolean
    onlyValid?: boolean // Only promotions within date range
  } = {},
): Promise<Promotion[]> {
  const { status = "active", limit, featured, onlyValid = false } = options
  const cacheKey = `${CACHE_KEY_ALL}:${status}:${limit || "all"}:${featured || "all"}:${onlyValid}`

  return getWithCache(
    cacheKey,
    async () => {
      const { db } = await connectToDatabase()

      const query: any = { deleted: { $ne: true } }

      if (status !== "all") {
        query.status = status
      }

      if (featured !== undefined) {
        query.featured = featured
      }

      // Filter by date range if onlyValid is true
      if (onlyValid) {
        const now = new Date()
        query.startDate = { $lte: now }
        query.endDate = { $gte: now }
      }

      let cursor = db.collection(COLLECTION).find(query).sort({ endDate: 1, createdAt: -1 })

      if (limit) {
        cursor = cursor.limit(limit)
      }

      const promotions = await cursor.toArray()

      return promotions.map(({ _id, ...promotion }) => ({
        id: _id.toString(),
        ...promotion,
        // Ensure dates are properly formatted
        startDate: promotion.startDate instanceof Date ? promotion.startDate.toISOString() : promotion.startDate,
        endDate: promotion.endDate instanceof Date ? promotion.endDate.toISOString() : promotion.endDate,
      })) as Promotion[]
    },
    60, // Cache for 1 minute
  )
}

// Get active promotions (within date range)
export async function getActivePromotions(limit = 10): Promise<Promotion[]> {
  return getPromotions({ status: "active", onlyValid: true, limit })
}

// Get featured promotions
export async function getFeaturedPromotions(limit = 3): Promise<Promotion[]> {
  return getPromotions({ status: "active", featured: true, onlyValid: true, limit })
}

// Get promotion by slug
export async function getPromotionBySlug(slug: string): Promise<Promotion | null> {
  const cacheKey = `${CACHE_KEY_PREFIX}slug:${slug}`

  return getWithCache(
    cacheKey,
    async () => {
      try {
        const { db } = await connectToDatabase()
        const promotion = await db.collection(COLLECTION).findOne({
          slug,
          deleted: { $ne: true },
        })

        if (!promotion) return null

        const { _id, ...rest } = promotion
        return {
          id: _id.toString(),
          ...rest,
          // Ensure dates are properly formatted
          startDate: rest.startDate instanceof Date ? rest.startDate.toISOString() : rest.startDate,
          endDate: rest.endDate instanceof Date ? rest.endDate.toISOString() : rest.endDate,
        } as Promotion
      } catch (error) {
        console.error(`Error fetching promotion with slug ${slug}:`, error)
        return null
      }
    },
    60, // Cache for 1 minute
  )
}

// Get promotion by ID
export async function getPromotionById(id: string): Promise<Promotion | null> {
  const cacheKey = `${CACHE_KEY_PREFIX}id:${id}`

  return getWithCache(
    cacheKey,
    async () => {
      try {
        const { db } = await connectToDatabase()
        const promotion = await db.collection(COLLECTION).findOne({
          _id: new ObjectId(id),
          deleted: { $ne: true },
        })

        if (!promotion) return null

        const { _id, ...rest } = promotion
        return {
          id: _id.toString(),
          ...rest,
          // Ensure dates are properly formatted
          startDate: rest.startDate instanceof Date ? rest.startDate.toISOString() : rest.startDate,
          endDate: rest.endDate instanceof Date ? rest.endDate.toISOString() : rest.endDate,
        } as Promotion
      } catch (error) {
        console.error(`Error fetching promotion with ID ${id}:`, error)
        return null
      }
    },
    60, // Cache for 1 minute
  )
}

// Create a new promotion
export async function createPromotion(data: Partial<Promotion>): Promise<Promotion> {
  try {
    const { db } = await connectToDatabase()

    const now = new Date()

    // Generate slug from title if not provided
    const slug = data.slug || slugify(data.title || "")

    // Check if slug already exists
    const existingPromotion = await db.collection(COLLECTION).findOne({
      slug,
      deleted: { $ne: true },
    })

    // If slug exists, append a unique identifier
    const finalSlug = existingPromotion ? `${slug}-${Math.floor(Math.random() * 1000)}` : slug

    // Generate unique promotion ID if not provided
    const promotionId = data.promotionId || `PROMO-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    const promotionData: any = {
      ...data,
      slug: finalSlug,
      promotionId,
      featured: data.featured || false,
      status: data.status || "active",
      stock: data.stock || 0,
      // Convert date strings to Date objects
      startDate: data.startDate ? new Date(data.startDate) : now,
      endDate: data.endDate ? new Date(data.endDate) : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
      createdAt: now,
      updatedAt: now,
      deleted: false,
    }

    const result = await db.collection(COLLECTION).insertOne(promotionData)

    // Invalidate cache
    await invalidateCache(`${CACHE_KEY_PREFIX}*`)

    return {
      id: result.insertedId.toString(),
      ...promotionData,
      // Convert dates back to ISO strings for consistency
      startDate: promotionData.startDate.toISOString(),
      endDate: promotionData.endDate.toISOString(),
      _id: undefined,
    } as Promotion
  } catch (error) {
    console.error("Error creating promotion:", error)
    throw error
  }
}

// Update a promotion
export async function updatePromotion(id: string, data: Partial<Promotion>): Promise<Promotion> {
  try {
    const { db } = await connectToDatabase()

    // If title is changed and slug is not provided, regenerate slug
    if (data.title && !data.slug) {
      data.slug = slugify(data.title)

      // Check if new slug already exists (excluding current promotion)
      const existingPromotion = await db.collection(COLLECTION).findOne({
        slug: data.slug,
        _id: { $ne: new ObjectId(id) },
        deleted: { $ne: true },
      })

      // If slug exists, append a unique identifier
      if (existingPromotion) {
        data.slug = `${data.slug}-${Math.floor(Math.random() * 1000)}`
      }
    }

    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    }

    // Convert date strings to Date objects if provided
    if (data.startDate) {
      updateData.startDate = new Date(data.startDate)
    }
    if (data.endDate) {
      updateData.endDate = new Date(data.endDate)
    }

    // Remove id from update data if present
    delete updateData.id

    const result = await db
      .collection(COLLECTION)
      .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updateData }, { returnDocument: "after" })

    if (!result) {
      throw new Error(`No se encontró la promoción con ID ${id}`)
    }

    // Invalidate cache
    await invalidateCache(`${CACHE_KEY_PREFIX}*`)

    // Convert _id to id and remove _id
    const { _id, ...rest } = result
    return {
      id: _id.toString(),
      ...rest,
      // Convert dates back to ISO strings for consistency
      startDate: rest.startDate instanceof Date ? rest.startDate.toISOString() : rest.startDate,
      endDate: rest.endDate instanceof Date ? rest.endDate.toISOString() : rest.endDate,
    } as Promotion
  } catch (error) {
    console.error(`Error updating promotion with ID ${id}:`, error)
    throw error
  }
}

// Delete a promotion (soft delete)
export async function deletePromotion(id: string): Promise<void> {
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
    await invalidateCache(`${CACHE_KEY_PREFIX}*`)
  } catch (error) {
    console.error(`Error deleting promotion with ID ${id}:`, error)
    throw error
  }
}

// Helper function to check if promotion is valid (within date range and has stock)
export function isPromotionValid(promotion: Promotion): boolean {
  const now = new Date()
  const startDate = new Date(promotion.startDate)
  const endDate = new Date(promotion.endDate)

  return promotion.status === "active" && now >= startDate && now <= endDate && promotion.stock > 0
}

// Helper function to get time remaining for a promotion
export function getTimeRemaining(endDate: string | Date): {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
} {
  const end = new Date(endDate).getTime()
  const now = new Date().getTime()
  const total = end - now

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
  }

  const days = Math.floor(total / (1000 * 60 * 60 * 24))
  const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((total % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds, total }
}
