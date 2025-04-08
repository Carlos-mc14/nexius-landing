import { ObjectId } from "mongodb"
import type { TeamMember } from "@/types/team"
import { connectToDatabase, getWithCache, invalidateCache } from "./db"

const COLLECTION = "teamMembers"
const CACHE_KEY_PREFIX = "team:"
const CACHE_KEY_ALL = `${CACHE_KEY_PREFIX}all`

// Get all team members
export async function getTeamMembers(): Promise<TeamMember[]> {
  return getWithCache(
    CACHE_KEY_ALL,
    async () => {
      const { db } = await connectToDatabase()
      const teamMembers = await db
        .collection(COLLECTION)
        .find({ deleted: { $ne: true } })
        .toArray()

      return teamMembers.map(({ _id, ...member }) => ({
        id: _id.toString(),
        ...member,
      })) as TeamMember[]
    },
    3600, // Cache for 1 hour
  )
}

// Get a team member by ID
export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
  const cacheKey = `${CACHE_KEY_PREFIX}id:${id}`

  return getWithCache(
    cacheKey,
    async () => {
      try {
        const { db } = await connectToDatabase()
        const member = await db.collection(COLLECTION).findOne({
          $or: [{ _id: new ObjectId(id) }, { id: id }],
          deleted: { $ne: true },
        })

        if (!member) return null

        const { _id, ...rest } = member
        return { id: _id.toString(), ...rest } as TeamMember
      } catch (error) {
        console.error(`Error fetching team member with ID ${id}:`, error)
        return null
      }
    },
    3600, // Cache for 1 hour
  )
}

// Get a team member by public ID
export async function getTeamMemberByPublicId(publicId: string): Promise<TeamMember | null> {
  const cacheKey = `${CACHE_KEY_PREFIX}publicId:${publicId}`

  return getWithCache(
    cacheKey,
    async () => {
      try {
        const { db } = await connectToDatabase()
        const member = await db.collection(COLLECTION).findOne({
          publicId: publicId,
          deleted: { $ne: true },
        })

        if (!member) return null

        const { _id, ...rest } = member
        return { id: _id.toString(), ...rest } as TeamMember
      } catch (error) {
        console.error(`Error fetching team member with public ID ${publicId}:`, error)
        return null
      }
    },
    3600, // Cache for 1 hour
  )
}

// Create a new team member
export async function createTeamMember(data: Partial<TeamMember>): Promise<TeamMember> {
  try {
    const { db } = await connectToDatabase()

    // Check if publicId is already in use
    const existingMember = await db.collection(COLLECTION).findOne({
      publicId: data.publicId,
      deleted: { $ne: true },
    })

    if (existingMember) {
      throw new Error(`El ID público '${data.publicId}' ya está en uso`)
    }

    const now = new Date()
    const memberData = {
      ...data,
      createdAt: now,
      updatedAt: now,
      deleted: false,
    }

    const result = await db.collection(COLLECTION).insertOne(memberData)

    // Invalidate cache
    await invalidateCache(CACHE_KEY_ALL)

    const { insertedId } = result
    return { id: insertedId.toString(), ...memberData } as TeamMember
  } catch (error) {
    console.error("Error creating team member:", error)
    throw error
  }
}

// Update a team member
export async function updateTeamMember(id: string, data: Partial<TeamMember>): Promise<TeamMember> {
  try {
    const { db } = await connectToDatabase()

    // Check if publicId is already in use by another member
    if (data.publicId) {
      const existingMember = await db.collection(COLLECTION).findOne({
        publicId: data.publicId,
        _id: { $ne: new ObjectId(id) },
        deleted: { $ne: true },
      })

      if (existingMember) {
        throw new Error(`El ID público '${data.publicId}' ya está en uso`)
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
      throw new Error(`No se encontró el miembro con ID ${id}`)
    }

    // Invalidate cache
    await invalidateCache(CACHE_KEY_ALL)
    await invalidateCache(`${CACHE_KEY_PREFIX}id:${id}`)
    if (result.publicId) {
      await invalidateCache(`${CACHE_KEY_PREFIX}publicId:${result.publicId}`)
    }

    const { _id, ...rest } = result
    return { id: _id.toString(), ...rest } as TeamMember
  } catch (error) {
    console.error(`Error updating team member with ID ${id}:`, error)
    throw error
  }
}

// Delete a team member (soft delete)
export async function deleteTeamMember(id: string): Promise<void> {
  try {
    const { db } = await connectToDatabase()

    // Get the member first to get the publicId for cache invalidation
    const member = await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) })

    if (!member) {
      throw new Error(`No se encontró el miembro con ID ${id}`)
    }

    // Soft delete
    await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          deleted: true,
          updatedAt: new Date(),
          // Append a timestamp to publicId to free it up for reuse
          publicId: `${member.publicId}_deleted_${Date.now()}`,
        },
      },
    )

    // Invalidate cache
    await invalidateCache(CACHE_KEY_ALL)
    await invalidateCache(`${CACHE_KEY_PREFIX}id:${id}`)
    if (member.publicId) {
      await invalidateCache(`${CACHE_KEY_PREFIX}publicId:${member.publicId}`)
    }
  } catch (error) {
    console.error(`Error deleting team member with ID ${id}:`, error)
    throw error
  }
}
