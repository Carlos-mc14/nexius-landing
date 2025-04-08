import { MongoClient, ServerApiVersion } from "mongodb"
import { Redis } from "@upstash/redis"

// MongoDB connection
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/nexius"
const dbName = process.env.MONGODB_DB_NAME || "nexius"

// Redis connection
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

// Connection pool
let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

// Connection options
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 10, // Maximum number of connections in the pool
  minPoolSize: 5, // Minimum number of connections in the pool
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  connectTimeoutMS: 10000, // Timeout for initial connection
}

// Cache TTL in seconds
const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 1 day
}

// Function to connect to MongoDB
export async function connectToDatabase() {
  // If we already have a client, return it
  if (client && clientPromise) {
    return { client, db: client.db(dbName) }
  }

  // If we're in development mode, create a new client for each request
  /*if (process.env.NODE_ENV === "development") {
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
    const promiseClient = await clientPromise
    return { client: promiseClient, db: promiseClient.db(dbName) }
  }*/

  // In production, reuse the client
  if (!client) {
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }

  const promiseClient = await clientPromise
  // Add a non-null assertion to fix the TypeScript error
  return { client: promiseClient!, db: promiseClient!.db(dbName) }
}

// Function to get data with cache
export async function getWithCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM,
): Promise<T> {
  try {
    // Try to get data from cache
    const cachedData = await redis.get<T>(key)

    if (cachedData) {
      //console.log(`Cache hit for key: ${key}`)
      return cachedData
    }

    // If not in cache, fetch data
    //console.log(`Cache miss for key: ${key}`)
    const data = await fetchFn()

    // Store in cache
    await redis.set(key, data, { ex: ttl })

    return data
  } catch (error) {
    //console.error(`Error in getWithCache for key ${key}:`, error)
    // If cache fails, fall back to direct fetch
    return fetchFn()
  }
}

// Function to invalidate cache
export async function invalidateCache(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch (error) {
    //console.error(`Error invalidating cache for key ${key}:`, error)
  }
}

// Function to invalidate multiple cache keys with a pattern
export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    //console.error(`Error invalidating cache pattern ${pattern}:`, error)
  }
}

// Function to close database connection
export async function closeDatabaseConnection(): Promise<void> {
  if (client) {
    await client.close()
    client = null
    clientPromise = null
  }
}

// Register cleanup handler for graceful shutdown
if (process.env.NODE_ENV === "production") {
  process.on("SIGTERM", async () => {
    //console.log("SIGTERM received, closing database connections")
    await closeDatabaseConnection()
    process.exit(0)
  })

  process.on("SIGINT", async () => {
    //console.log("SIGINT received, closing database connections")
    await closeDatabaseConnection()
    process.exit(0)
  })
}
