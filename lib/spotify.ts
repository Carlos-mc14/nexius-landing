// Spotify API integration
// This uses the Spotify Web API with refresh token flow for server-side requests

// Validate that the necessary environment variables are defined
const validateSpotifyEnv = () => {
  const requiredVars = ["SPOTIFY_CLIENT_ID", "SPOTIFY_CLIENT_SECRET", "SPOTIFY_REFRESH_TOKEN"]
  const missingVars = requiredVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    console.warn(`⚠️ Variables de entorno faltantes para Spotify: ${missingVars.join(", ")}`)
    return false
  }
  return true
}

// Types for Spotify API responses
interface SpotifyImage {
  url: string
  height: number
  width: number
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: { name: string }[]
  album: {
    name: string
    images: SpotifyImage[]
  }
  external_urls: {
    spotify: string
  }
  preview_url: string | null
  is_playing?: boolean
}

// Get access token using the refresh token
async function getAccessToken(): Promise<string> {
  try {
    if (!validateSpotifyEnv()) {
      throw new Error("Missing Spotify environment variables")
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken!,
      }),
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Spotify API Error Response:", errorText)
      throw new Error(`Failed to get Spotify access token: ${response.status}. Details: ${errorText}`)
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error("Error getting Spotify access token:", error)
    throw error
  }
}

// Get the currently playing track
export async function getCurrentlyPlayingTrack(): Promise<SpotifyTrack | null> {
  try {
    if (!validateSpotifyEnv()) {
      console.info("🔍 Using mock data for Spotify (missing env vars)")
      return getMockCurrentTrack()
    }

    const accessToken = await getAccessToken()

    const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: 600 }, // Revalidate every 5 minutes
    })

    // If 204 No Content is returned, no track is currently playing
    if (response.status === 204) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Failed to get currently playing track: ${response.status}`)
    }

    const data = await response.json()

    // If no track is playing or it's not a track (could be a podcast)
    if (!data.is_playing || data.currently_playing_type !== "track") {
      return null
    }

    return {
      id: data.item.id,
      name: data.item.name,
      artists: data.item.artists,
      album: data.item.album,
      external_urls: data.item.external_urls,
      preview_url: data.item.preview_url,
      is_playing: data.is_playing,
    }
  } catch (error) {
    console.error("Error getting currently playing track:", error)
    return null
  }
}

// Get the last saved track (liked song)
export async function getLastSavedTrack(): Promise<SpotifyTrack | null> {
  try {
    if (!validateSpotifyEnv()) {
      console.info("🔍 Using mock data for Spotify (missing env vars)")
      return getMockLastSavedTrack()
    }

    const accessToken = await getAccessToken()

    const response = await fetch("https://api.spotify.com/v1/me/tracks?limit=1", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: 1800 }, // Revalidate every hour
    })

    if (!response.ok) {
      throw new Error(`Failed to get last saved track: ${response.status}`)
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return null
    }

    const track = data.items[0].track

    return {
      id: track.id,
      name: track.name,
      artists: track.artists,
      album: track.album,
      external_urls: track.external_urls,
      preview_url: track.preview_url,
    }
  } catch (error) {
    console.error("Error getting last saved track:", error)
    return null
  }
}

// Get the track to display (currently playing or last saved)
export async function getDisplayTrack(): Promise<SpotifyTrack | null> {
  try {
    // First try to get the currently playing track
    const currentTrack = await getCurrentlyPlayingTrack()

    // If there's a track currently playing, return it
    if (currentTrack) {
      return currentTrack
    }

    // Otherwise, return the last saved track
    return await getLastSavedTrack()
  } catch (error) {
    console.error("Error getting display track:", error)
    return null
  }
}

// Add a new function to get a track for a specific user
export async function getDisplayTrackForUser(userId?: string): Promise<SpotifyTrack | null> {
  try {
    // If no userId is provided or it doesn't match our implementation,
    // return the default track (which would be yours)
    if (!userId || userId === "carlos") {
      return await getDisplayTrack()
    }

    // For other users, we would implement specific logic here
    // For now, return null to indicate no track is available
    return null
  } catch (error) {
    console.error("Error getting display track for user:", error)
    return null
  }
}

// Mock data for development or when API fails
function getMockCurrentTrack(): SpotifyTrack {
  return {
    id: "4cOdK2wGLETKBW3PvgPWqT",
    name: "Never Gonna Give You Up",
    artists: [{ name: "Rick Astley" }],
    album: {
      name: "Whenever You Need Somebody",
      images: [
        {
          url: "https://i.scdn.co/image/ab67616d0000b273c5d40ebd5b7b26114b2e3476",
          height: 640,
          width: 640,
        },
      ],
    },
    external_urls: {
      spotify: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
    },
    preview_url: "https://p.scdn.co/mp3-preview/22bf10aff02db272f0a053dff5c0063d729df988",
    is_playing: true,
  }
}

function getMockLastSavedTrack(): SpotifyTrack {
  return {
    id: "6rqhFgbbKwnb9MLmUQDhG6",
    name: "Bohemian Rhapsody",
    artists: [{ name: "Queen" }],
    album: {
      name: "A Night At The Opera",
      images: [
        {
          url: "https://i.scdn.co/image/ab67616d0000b273c5d40ebd5b7b26114b2e3476",
          height: 640,
          width: 640,
        },
      ],
    },
    external_urls: {
      spotify: "https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6",
    },
    preview_url: "https://p.scdn.co/mp3-preview/22bf10aff02db272f0a053dff5c0063d729df988",
  }
}

