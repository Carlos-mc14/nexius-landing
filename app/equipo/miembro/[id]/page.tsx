import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Github, Globe, Linkedin, Twitter, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getTeamMemberByPublicId } from "@/lib/team"
import { getDisplayTrackForUser } from "@/lib/spotify"
import SpotifyTrackPlayer from "@/components/spotify-track"
import TechStack from "@/components/tech-stack"

// Disable caching for this page to always show the latest content
export const revalidate = 0

interface MemberProfilePageProps {
  params: {
    id: string
  }
}

export default async function MemberProfilePage({ params }: MemberProfilePageProps) {
  const { id } = await params
  const member = await getTeamMemberByPublicId(id)

  if (!member) {
    notFound()
  }

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                {member.name}
              </h1>
              <p className="max-w-[700px] text-gray-300 md:text-xl">{member.position}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-1/3 space-y-6">
              {/* Profile Image */}
              <div className="relative aspect-square overflow-hidden rounded-xl">
                <Image
                  src={member.image || "/placeholder.svg?height=400&width=400"}
                  alt={member.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Spotify Track - Only show if enabled for this member */}
              {member.profileOptions?.showSpotify && (
                <Suspense fallback={<SpotifyTrackSkeleton />}>
                  <SpotifyTrackSection userId={member.profileOptions.spotifyUserId} />
                </Suspense>
              )}

              {/* Gallery - Only show if enabled for this member */}
              {member.profileOptions?.showGallery &&
                member.profileOptions.galleryImages &&
                member.profileOptions.galleryImages.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Galería de Trabajos</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {member.profileOptions.galleryImages.map((image, index) => (
                          <div key={index} className="relative aspect-video rounded-md overflow-hidden">
                            <Image
                              src={image || "/placeholder.svg?height=300&width=400"}
                              alt={`Trabajo de ${member.name} ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Social Links */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Contacto</h3>
                  <div className="flex flex-wrap gap-2">
                    {member.links.portfolio && (
                      <Link href={member.links.portfolio} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Globe className="h-4 w-4" />
                          <span>Portafolio</span>
                        </Button>
                      </Link>
                    )}
                    {member.links.linkedin && (
                      <Link href={member.links.linkedin} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Linkedin className="h-4 w-4" />
                          <span>LinkedIn</span>
                        </Button>
                      </Link>
                    )}
                    {member.links.twitter && (
                      <Link href={member.links.twitter} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Twitter className="h-4 w-4" />
                          <span>Twitter</span>
                        </Button>
                      </Link>
                    )}
                    {member.links.instagram && (
                      <Link href={member.links.instagram} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Instagram className="h-4 w-4" />
                          <span>Instagram</span>
                        </Button>
                      </Link>
                    )}
                    {member.links.github && (
                      <Link href={member.links.github} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Github className="h-4 w-4" />
                          <span>GitHub</span>
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="w-full md:w-2/3 space-y-8">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Sobre mí</h2>
                  <div className="prose max-w-none">
                    {member.longBio ? (
                      member.longBio.split("\n\n").map((paragraph, index) => (
                        <p key={index} className="mb-4 text-muted-foreground">
                          {paragraph}
                        </p>
                      ))
                    ) : (
                      <p className="text-muted-foreground">{member.bio}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Tech Stack - Only show if enabled for this member */}
              {member.profileOptions?.showTechnologies && member.technologies && member.technologies.length > 0 && (
                <TechStack technologies={member.technologies} />
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

// Server Component to fetch Spotify data for a specific user
async function SpotifyTrackSection({ userId }: { userId?: string }) {
  const track = await getDisplayTrackForUser(userId)
  return <SpotifyTrackPlayer track={track} />
}

// Loading skeleton for Spotify track
function SpotifyTrackSkeleton() {
  return (
    <Card className="w-full">
      <CardContent className="p-4 flex items-center">
        <Skeleton className="h-16 w-16 rounded-md mr-4" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full ml-4" />
      </CardContent>
    </Card>
  )
}
