// Team member types

export interface TeamMember {
  id: string
  name: string
  position: string
  publicId: string
  bio: string
  longBio?: string
  email?: string
  image: string
  active: boolean
  technologies?: { name: string; icon: string }[] // Changed from IconType to string
  links: {
    portfolio?: string
    linkedin?: string
    twitter?: string
    instagram?: string
    github?: string
    [key: string]: string | undefined
  }
  profileOptions: {
    showSpotify: boolean
    spotifyUserId?: string
    showTechnologies: boolean
    showGallery?: boolean
    galleryImages?: string[]
  }
}
