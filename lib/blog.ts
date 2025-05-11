import { ObjectId } from "mongodb"
import { connectToDatabase, getWithCache, invalidateCache } from "./db"
import { slugify } from "./utils"

const COLLECTION = "blog_posts"
const CACHE_KEY_PREFIX = "blog:"
const CACHE_KEY_ALL = `${CACHE_KEY_PREFIX}all`

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage: string
  author: {
    id: string
    name: string
    image?: string
  }
  tags: string[]
  category: string
  publishedAt?: Date | string
  featured: boolean
  status: "draft" | "published"
  readTime: number
  seoTitle?: string
  seoDescription?: string
  createdAt: Date
  updatedAt: Date
  deleted?: boolean
}

// Get all blog posts
export async function getBlogPosts(
  options: {
    status?: "draft" | "published" | "all"
    limit?: number
    featured?: boolean
  } = {},
): Promise<BlogPost[]> {
  const { status = "published", limit, featured } = options
  const cacheKey = `${CACHE_KEY_ALL}:${status}:${limit || "all"}:${featured || "all"}`

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

      let cursor = db.collection(COLLECTION).find(query).sort({ publishedAt: -1, createdAt: -1 })

      if (limit) {
        cursor = cursor.limit(limit)
      }

      const posts = await cursor.toArray()

      return posts.map(({ _id, ...post }) => ({
        id: _id.toString(),
        ...post,
        // Ensure publishedAt is properly formatted
        publishedAt: post.publishedAt
          ? post.publishedAt instanceof Date
            ? post.publishedAt.toISOString()
            : post.publishedAt
          : undefined,
      })) as BlogPost[]
    },
    60, // Cache for 1 minute
  )
}

// Get featured blog posts
export async function getFeaturedBlogPosts(limit = 3): Promise<BlogPost[]> {
  return getBlogPosts({ status: "published", featured: true, limit })
}

// Get latest blog posts
export async function getLatestBlogPosts(limit = 3): Promise<BlogPost[]> {
  return getBlogPosts({ status: "published", limit })
}

// Get blog post by slug
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const cacheKey = `${CACHE_KEY_PREFIX}slug:${slug}`

  return getWithCache(
    cacheKey,
    async () => {
      try {
        const { db } = await connectToDatabase()
        const post = await db.collection(COLLECTION).findOne({
          slug,
          deleted: { $ne: true },
        })

        if (!post) return null

        const { _id, ...rest } = post
        return {
          id: _id.toString(),
          ...rest,
          // Ensure publishedAt is properly formatted
          publishedAt: rest.publishedAt
            ? rest.publishedAt instanceof Date
              ? rest.publishedAt.toISOString()
              : rest.publishedAt
            : undefined,
        } as BlogPost
      } catch (error) {
        console.error(`Error fetching blog post with slug ${slug}:`, error)
        return null
      }
    },
    60, // Cache for 1 minute
  )
}

// Get blog post by ID
export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const cacheKey = `${CACHE_KEY_PREFIX}id:${id}`

  return getWithCache(
    cacheKey,
    async () => {
      try {
        const { db } = await connectToDatabase()
        const post = await db.collection(COLLECTION).findOne({
          _id: new ObjectId(id),
          deleted: { $ne: true },
        })

        if (!post) return null

        const { _id, ...rest } = post
        return {
          id: _id.toString(),
          ...rest,
          // Ensure publishedAt is properly formatted
          publishedAt: rest.publishedAt
            ? rest.publishedAt instanceof Date
              ? rest.publishedAt.toISOString()
              : rest.publishedAt
            : undefined,
        } as BlogPost
      } catch (error) {
        console.error(`Error fetching blog post with ID ${id}:`, error)
        return null
      }
    },
    60, // Cache for 1 minute
  )
}

// Create a new blog post
export async function createBlogPost(data: Partial<BlogPost>): Promise<BlogPost> {
  try {
    const { db } = await connectToDatabase()

    const now = new Date()

    // Generate slug from title if not provided
    const slug = data.slug || slugify(data.title || "")

    // Check if slug already exists
    const existingPost = await db.collection(COLLECTION).findOne({
      slug,
      deleted: { $ne: true },
    })

    // If slug exists, append a unique identifier
    const finalSlug = existingPost ? `${slug}-${Math.floor(Math.random() * 1000)}` : slug

    const postData: any = {
      ...data,
      slug: finalSlug,
      tags: data.tags || [],
      featured: data.featured || false,
      status: data.status || "draft",
      readTime: data.readTime || calculateReadTime(data.content || ""),
      createdAt: now,
      updatedAt: now,
      deleted: false,
    }

    const result = await db.collection(COLLECTION).insertOne(postData)

    // Invalidate cache
    await invalidateCache(`${CACHE_KEY_PREFIX}*`)

    return {
      id: result.insertedId.toString(),
      ...postData,
      _id: undefined,
    } as BlogPost
  } catch (error) {
    console.error("Error creating blog post:", error)
    throw error
  }
}

// Update a blog post
export async function updateBlogPost(id: string, data: Partial<BlogPost>): Promise<BlogPost> {
  try {
    const { db } = await connectToDatabase()

    // If title is changed and slug is not provided, regenerate slug
    if (data.title && !data.slug) {
      data.slug = slugify(data.title)

      // Check if new slug already exists (excluding current post)
      const existingPost = await db.collection(COLLECTION).findOne({
        slug: data.slug,
        _id: { $ne: new ObjectId(id) },
        deleted: { $ne: true },
      })

      // If slug exists, append a unique identifier
      if (existingPost) {
        data.slug = `${data.slug}-${Math.floor(Math.random() * 1000)}`
      }
    }

    // Recalculate read time if content changed
    if (data.content) {
      data.readTime = calculateReadTime(data.content)
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
      throw new Error(`No se encontró el artículo con ID ${id}`)
    }

    // Invalidate cache
    await invalidateCache(`${CACHE_KEY_PREFIX}*`)

    // Convert _id to id and remove _id
    const { _id, ...rest } = result
    return {
      id: _id.toString(),
      ...rest,
    } as BlogPost
  } catch (error) {
    console.error(`Error updating blog post with ID ${id}:`, error)
    throw error
  }
}

// Delete a blog post (soft delete)
export async function deleteBlogPost(id: string): Promise<void> {
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
    console.error(`Error deleting blog post with ID ${id}:`, error)
    throw error
  }
}

// Helper function to calculate read time
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.trim().split(/\s+/).length
  const readTime = Math.ceil(wordCount / wordsPerMinute)
  return Math.max(1, readTime) // Minimum 1 minute read time
}

// Get blog categories
export async function getBlogCategories(): Promise<string[]> {
  const cacheKey = `${CACHE_KEY_PREFIX}categories`

  return getWithCache(
    cacheKey,
    async () => {
      const { db } = await connectToDatabase()

      // Usar aggregate en lugar de distinct para compatibilidad con API Version 1
      const categoriesResult = await db
        .collection(COLLECTION)
        .aggregate([
          { $match: { deleted: { $ne: true }, status: "published" } },
          { $group: { _id: "$category" } },
          { $project: { _id: 0, category: "$_id" } },
        ])
        .toArray()

      return categoriesResult.map((item) => item.category).filter(Boolean) as string[]
    },
    300, // Cache for 5 minutes
  )
}

// Get blog tags
export async function getBlogTags(): Promise<string[]> {
  const cacheKey = `${CACHE_KEY_PREFIX}tags`

  return getWithCache(
    cacheKey,
    async () => {
      const { db } = await connectToDatabase()
      const tags = await db
        .collection(COLLECTION)
        .aggregate([
          { $match: { deleted: { $ne: true }, status: "published" } },
          { $unwind: "$tags" },
          { $group: { _id: "$tags" } },
          { $project: { _id: 0, tag: "$_id" } },
        ])
        .toArray()

      return tags.map((t) => t.tag).filter(Boolean)
    },
    300, // Cache for 5 minutes
  )
}
