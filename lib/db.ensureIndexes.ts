import { connectToDatabase } from "./db"

/**
 * Create recommended indexes for collections. This function is safe to call during
 * deployment/startup and will create indexes if they do not exist.
 * Set ENSURE_INDEXES=true in env to run this automatically if desired.
 */
export async function ensureIndexes() {
  try {
    const { db } = await connectToDatabase()

    // Transactions: index on timestamp and deviceId for queries, and unique on _id is implicit when ObjectId used
    await db.collection("transactions").createIndex({ timestamp: -1 })
    await db.collection("transactions").createIndex({ deviceId: 1 })

    // Users: index on email unique
    await db.collection("users").createIndex({ email: 1 }, { unique: true })

    // Licenses: index on domain and licenseKey
    await db.collection("licenses").createIndex({ domain: 1 })
    await db.collection("licenses").createIndex({ licenseKey: 1 })

    // Images/metadata: index by folder and createdAt
    await db.collection("images").createIndex({ folder: 1 })
    await db.collection("images").createIndex({ createdAt: -1 })

    return true
  } catch (error) {
    console.error("Error creating indexes:", error)
    return false
  }
}
