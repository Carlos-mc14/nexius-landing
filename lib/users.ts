import { ObjectId } from "mongodb"
import { connectToDatabase, getWithCache, invalidateCache } from "./db"
import { hashPassword } from "./auth"

const COLLECTION = "users"
const CACHE_KEY_PREFIX = "user:"
const CACHE_KEY_ALL = `${CACHE_KEY_PREFIX}all`

export interface User {
  id: string
  name: string
  email: string
  role: string
  active: boolean
  teamMemberId?: string
  image?: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
  deleted?: boolean
}

// Get all users
export async function getUsers(): Promise<Omit<User, "passwordHash">[]> {
  return getWithCache(
    CACHE_KEY_ALL,
    async () => {
      const { db } = await connectToDatabase()
      const users = await db
        .collection(COLLECTION)
        .find({ deleted: { $ne: true } })
        .toArray()

      return users.map(({ _id, passwordHash, name, email, role, active, teamMemberId, image, createdAt, updatedAt, deleted }) => ({
        id: _id.toString(),
        name,
        email,
        role,
        active,
        teamMemberId,
        image,
        createdAt,
        updatedAt,
        deleted,
      }))
    },
    3600, // Cache for 1 hour
  )
}

// Get a user by ID
export async function getUserById(id: string): Promise<User | null> {
  const cacheKey = `${CACHE_KEY_PREFIX}id:${id}`

  return getWithCache(
    cacheKey,
    async () => {
      try {
        const { db } = await connectToDatabase()
        const user = await db.collection(COLLECTION).findOne({
          $or: [{ _id: new ObjectId(id) }, { id: id }],
          deleted: { $ne: true },
        })

        if (!user) return null

        const { _id, ...rest } = user
        return { id: _id.toString(), ...rest } as User
      } catch (error) {
        console.error(`Error fetching user with ID ${id}:`, error)
        return null
      }
    },
    3600, // Cache for 1 hour
  )
}

// Get a user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const cacheKey = `${CACHE_KEY_PREFIX}email:${email}`

  return getWithCache(
    cacheKey,
    async () => {
      try {
        const { db } = await connectToDatabase()
        const user = await db.collection(COLLECTION).findOne({
          email: email.toLowerCase(),
          deleted: { $ne: true },
        })

        if (!user) return null

        const { _id, ...rest } = user
        return { id: _id.toString(), ...rest } as User
      } catch (error) {
        console.error(`Error fetching user with email ${email}:`, error)
        return null
      }
    },
    3600, // Cache for 1 hour
  )
}

// Create a new user
export async function createUser(data: {
  name: string
  email: string
  password: string
  role: string
  active?: boolean
  teamMemberId?: string
  image?: string
}): Promise<Omit<User, "passwordHash">> {
  try {
    const { db } = await connectToDatabase()

    // Check if email is already in use
    const existingUser = await db.collection(COLLECTION).findOne({
      email: data.email.toLowerCase(),
      deleted: { $ne: true },
    })

    if (existingUser) {
      throw new Error(`El email '${data.email}' ya está en uso`)
    }

    const now = new Date()
    const passwordHash = await hashPassword(data.password)

    const userData = {
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role,
      active: data.active ?? true,
      teamMemberId: data.teamMemberId,
      image: data.image,
      createdAt: now,
      updatedAt: now,
      deleted: false,
    }

    const result = await db.collection(COLLECTION).insertOne(userData)

    // Invalidate cache
    await invalidateCache(CACHE_KEY_ALL)

    const { passwordHash: _, ...userWithoutPassword } = userData
    return { id: result.insertedId.toString(), ...userWithoutPassword } as Omit<User, "passwordHash">
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

// Update a user
export async function updateUser(
  id: string,
  data: {
    name?: string
    email?: string
    password?: string
    role?: string
    active?: boolean
    teamMemberId?: string
    image?: string
  },
): Promise<Omit<User, "passwordHash">> {
  try {
    const { db } = await connectToDatabase()

    // Check if email is already in use by another user
    if (data.email) {
      const existingUser = await db.collection(COLLECTION).findOne({
        email: data.email.toLowerCase(),
        _id: { $ne: new ObjectId(id) },
        deleted: { $ne: true },
      })

      if (existingUser) {
        throw new Error(`El email '${data.email}' ya está en uso`)
      }
    }

    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    }

    // If email is provided, convert to lowercase
    if (data.email) {
      updateData.email = data.email.toLowerCase()
    }

    // If password is provided, hash it
    if (data.password) {
      updateData.passwordHash = await hashPassword(data.password)
      delete updateData.password
    } else {
      delete updateData.password
    }

    const result = await db
      .collection(COLLECTION)
      .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updateData }, { returnDocument: "after" })

    if (!result) {
      throw new Error(`No se encontró el usuario con ID ${id}`)
    }

    // Invalidate cache
    await invalidateCache(CACHE_KEY_ALL)
    await invalidateCache(`${CACHE_KEY_PREFIX}id:${id}`)
    if (result.email) {
      await invalidateCache(`${CACHE_KEY_PREFIX}email:${result.email}`)
    }

    const { _id, passwordHash, ...rest } = result
    return { id: _id.toString(), ...rest } as Omit<User, "passwordHash">
  } catch (error) {
    console.error(`Error updating user with ID ${id}:`, error)
    throw error
  }
}

// Delete a user (soft delete)
export async function deleteUser(id: string): Promise<void> {
  try {
    const { db } = await connectToDatabase()

    // Get the user first to get the email for cache invalidation
    const user = await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) })

    if (!user) {
      throw new Error(`No se encontró el usuario con ID ${id}`)
    }

    // Soft delete
    await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          deleted: true,
          updatedAt: new Date(),
          // Append a timestamp to email to free it up for reuse
          email: `${user.email}_deleted_${Date.now()}`,
        },
      },
    )

    // Invalidate cache
    await invalidateCache(CACHE_KEY_ALL)
    await invalidateCache(`${CACHE_KEY_PREFIX}id:${id}`)
    if (user.email) {
      await invalidateCache(`${CACHE_KEY_PREFIX}email:${user.email}`)
    }
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error)
    throw error
  }
}
