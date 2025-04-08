import { NextResponse } from "next/server"
import { deleteSession, getSession } from "@/lib/auth"

export async function POST() {
  try {
    const session = await getSession()
    const userId = session?.user.id

    const cookie = await deleteSession(userId)

    return NextResponse.json(
      { success: true },
      {
        status: 200,
        headers: {
          "Set-Cookie": cookie,
        },
      },
    )
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { success: true }, // Still return success even if there's an error
      {
        status: 200,
        headers: {
          "Set-Cookie": `auth-token=; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
        },
      },
    )
  }
}
