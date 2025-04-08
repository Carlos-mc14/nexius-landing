"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play, Pause, ExternalLink, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { SpotifyTrack } from "@/lib/spotify"

interface SpotifyTrackProps {
  track: SpotifyTrack | null
  userId?: string
}

export default function SpotifyTrackPlayer({ track: initialTrack, userId }: SpotifyTrackProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [track, setTrack] = useState<SpotifyTrack | null>(initialTrack)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Function to fetch the latest track data
  const fetchLatestTrack = async () => {
    try {
      setIsLoading(true)
      // Add userId to the API request if provided
      const url = userId ? `/api/spotify/now-playing?userId=${encodeURIComponent(userId)}` : "/api/spotify/now-playing"

      const response = await fetch(url, {
        cache: "no-store",
        next: { revalidate: 210 },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("API error response:", errorData)
        throw new Error(errorData.details || `API error: ${response.status}`)
      }

      const data = await response.json()

      // Only update if the track has changed
      if (data.track && (!track || data.track.id !== track.id || data.track.is_playing !== track.is_playing)) {
        setTrack(data.track)
        // Reset audio player when track changes
        if (isPlaying) {
          setIsPlaying(false)
          if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
          }
        }
      }

      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error refreshing track data"
      setError(errorMessage)
      //console.error("Error fetching track:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Set up interval to fetch data every 5 minutes
  useEffect(() => {
    // Fetch immediately on first render
    fetchLatestTrack()

    // Set up interval (5 minutes = 300000 ms)
    intervalRef.current = setInterval(fetchLatestTrack, 180000)

    // Clean up interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [userId]) // Add userId as a dependency

  // Reset audio player when track changes
  useEffect(() => {
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [track?.id])

  if (!track) {
    return (
      <Card className="w-full bg-gray-50 border-gray-200">
        <CardContent className="p-4 flex items-center justify-center h-24">
          <p className="text-gray-500 text-sm">No hay información de Spotify disponible</p>
        </CardContent>
      </Card>
    )
  }

  const togglePlay = () => {
    if (!audioRef.current || !track.preview_url) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error)
      })
    }

    setIsPlaying(!isPlaying)
  }

  const artistNames = track.artists.map((artist) => artist.name).join(", ")
  const albumImage = track.album.images[0]?.url || "/placeholder.svg?height=60&width=60"
  const statusText = track.is_playing ? "Escuchando ahora" : "Última canción que me gustó"

  return (
    <Card className="w-full overflow-hidden border-gray-200">
      <CardContent className="p-0">
        <div className="flex items-center p-4">
          <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden mr-4">
            <Image src={albumImage || "/placeholder.svg"} alt={track.album.name} fill className="object-cover" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs text-green-600 font-medium mb-1">{statusText}</p>
            <h4 className="text-sm font-semibold text-gray-900 truncate">{track.name}</h4>
            <p className="text-xs text-gray-500 truncate">{artistNames}</p>
            <p className="text-xs text-gray-400 truncate">{track.album.name}</p>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            {track.preview_url && (
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={togglePlay}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span className="sr-only">{isPlaying ? "Pausar" : "Reproducir"}</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={fetchLatestTrack}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              <span className="sr-only">Actualizar</span>
            </Button>

            <Link href={track.external_urls.spotify} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">Abrir en Spotify</span>
              </Button>
            </Link>
          </div>
        </div>

        {track.preview_url && (
          <audio ref={audioRef} src={track.preview_url} onEnded={() => setIsPlaying(false)} className="hidden" />
        )}
      </CardContent>
    </Card>
  )
}

