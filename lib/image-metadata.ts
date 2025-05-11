import { connectToDatabase } from "./db"
import { ObjectId } from "mongodb"

const COLLECTION = "image_metadata"

export interface ImageMetadata {
  id: string
  url: string
  name: string
  altText: string
  description?: string
  folder: string
  width?: number
  height?: number
  size?: number
  createdAt: Date
  updatedAt: Date
}

// Save image metadata
export async function saveImageMetadata(
  data: Omit<ImageMetadata, "id" | "createdAt" | "updatedAt">,
): Promise<ImageMetadata> {
  try {
    const { db } = await connectToDatabase()

    const now = new Date()
    const metadataDoc = {
      ...data,
      createdAt: now,
      updatedAt: now,
    }

    const result = await db.collection(COLLECTION).insertOne(metadataDoc)

    return {
      id: result.insertedId.toString(),
      ...metadataDoc,
    } as ImageMetadata
  } catch (error) {
    console.error("Error saving image metadata:", error)
    throw error
  }
}

// Get image metadata by URL
export async function getImageMetadataByUrl(url: string): Promise<ImageMetadata | null> {
  try {
    const { db } = await connectToDatabase()

    const metadata = await db.collection(COLLECTION).findOne({ url })

    if (!metadata) return null

    const { _id, ...rest } = metadata
    return {
      id: _id.toString(),
      ...rest,
    } as ImageMetadata
  } catch (error) {
    console.error(`Error fetching image metadata for URL ${url}:`, error)
    return null
  }
}

// Get all image metadata
export async function getAllImageMetadata(folder?: string): Promise<ImageMetadata[]> {
  try {
    const { db } = await connectToDatabase()

    const query = folder ? { folder } : {}

    const metadata = await db.collection(COLLECTION).find(query).sort({ createdAt: -1 }).toArray()

    return metadata.map(({ _id, ...rest }) => ({
      id: _id.toString(),
      ...rest,
    })) as ImageMetadata[]
  } catch (error) {
    console.error("Error fetching all image metadata:", error)
    return []
  }
}

// Update image metadata
export async function updateImageMetadata(id: string, data: Partial<ImageMetadata>): Promise<ImageMetadata | null> {
  try {
    const { db } = await connectToDatabase()

    const updateData = {
      ...data,
      updatedAt: new Date(),
    }

    const result = await db
      .collection(COLLECTION)
      .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updateData }, { returnDocument: "after" })

    if (!result) return null

    const { _id, ...rest } = result
    return {
      id: _id.toString(),
      ...rest,
    } as ImageMetadata
  } catch (error) {
    console.error(`Error updating image metadata with ID ${id}:`, error)
    return null
  }
}

// Delete image metadata
export async function deleteImageMetadata(id: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()

    const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) })

    return result.deletedCount > 0
  } catch (error) {
    console.error(`Error deleting image metadata with ID ${id}:`, error)
    return false
  }
}
