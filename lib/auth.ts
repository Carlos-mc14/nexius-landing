import { cookies } from "next/headers"
import { jwtVerify, SignJWT } from "jose"
import bcrypt from "bcryptjs"
import { getUserById, getUserByEmail } from "./users"
import { connectToDatabase } from "./db"

// Types
interface Session {
  user: {
    id: string
    name: string
    email: string
    role: string
    teamMemberId?: string
    image?: string
  }
}

// Function to hash passwords
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Function to verify passwords
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Function to authenticate a user
export async function authenticateUser(email: string, password: string) {
  try {
    const user = await getUserByEmail(email)

    if (!user) {
      return null
    }

    if (!user.active) {
      return null
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash)

    if (!isPasswordValid) {
      return null
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      teamMemberId: user.teamMemberId,
      image: user.image,
    }
  } catch (error) {
    console.error("Error authenticating user:", error)
    return null
  }
}

// Function to create a session
export async function createSession(userId: string) {
  try {
    const user = await getUserById(userId)

    if (!user) {
      throw new Error("User not found")
    }

    // Create JWT token
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "nexius-secret-key")
    const expiresIn = 60 * 60 * 24 * 7 // 7 days in seconds

    const token = await new SignJWT({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      teamMemberId: user.teamMemberId,
      image: user.image,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret)

    // Configure cookie
    const expires = new Date()
    expires.setSeconds(expires.getSeconds() + expiresIn)

    const cookieValue = `auth-token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${expires.toUTCString()}`

    // Log login activity
    await logUserActivity(user.id, "login")

    return {
      token,
      cookie: cookieValue,
    }
  } catch (error) {
    console.error("Error creating session:", error)
    throw error
  }
}

// Function to get the current session
export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = cookies()
    const token = (await cookieStore).get("auth-token")?.value

    if (!token) {
      return null
    }

    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "nexius-secret-key")

    try {
      const { payload } = await jwtVerify(token, secret)

      return {
        user: {
          id: payload.id as string,
          name: payload.name as string,
          email: payload.email as string,
          role: payload.role as string,
          teamMemberId: payload.teamMemberId as string | undefined,
          image: payload.image as string | undefined,
        },
      }
    } catch (verifyError) {
      // Invalid or expired token
      console.error("Error verifying token:", verifyError)
      return null
    }
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

// Function to delete the session
export async function deleteSession(userId?: string): Promise<string> {
  // Log logout activity if userId is provided
  if (userId) {
    await logUserActivity(userId, "logout")
  }

  // Configure cookie with expiration in the past to delete it
  return `auth-token=; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

// Function to log user activity
async function logUserActivity(userId: string, action: string) {
  try {
    const { db } = await connectToDatabase()

    await db.collection("userActivities").insertOne({
      userId,
      action,
      createdAt: new Date(),
      ip: "unknown", // In a real app, you would get this from the request
      userAgent: "unknown", // In a real app, you would get this from the request
    })
  } catch (error) {
    console.error("Error logging user activity:", error)
    // Don't throw, just log the error
  }
}
