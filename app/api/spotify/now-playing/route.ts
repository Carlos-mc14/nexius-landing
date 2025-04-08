import { NextResponse } from "next/server"
import { getDisplayTrack, getDisplayTrackForUser } from "@/lib/spotify"

export const dynamic = "force-dynamic"
export const revalidate = 210 // Disable caching for this route

export async function GET(request: Request) {
  try {
    // Get the userId from the query string if provided
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    // Get the track for the specified user or the default user
    const track = userId ? await getDisplayTrackForUser(userId) : await getDisplayTrack()

    return NextResponse.json({
      track,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error en API de Spotify:", error)
    return NextResponse.json(
      {
        error: "Error al obtener datos de Spotify",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

