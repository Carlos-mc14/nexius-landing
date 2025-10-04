import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { SectionHeader } from "./section-header"
import { StaggerContainer, StaggerItem, FadeIn } from "./motion-wrapper"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  coverImage?: string
  featured?: boolean
  publishedAt?: string | Date
  createdAt?: string | Date
}

export function BlogLatestSection({ posts, meta }: { posts: BlogPost[]; meta?: { badge?: string; title?: string; description?: string } }) {
  if (!posts || posts.length === 0) return null
  return (
    <section id="blog" className="w-full py-16 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <SectionHeader
          badge={meta?.badge || "Blog"}
          title={meta?.title || "Últimas publicaciones"}
          description={meta?.description || "Artículos técnicos, tutoriales y noticias sobre tecnología y desarrollo de software."}
        />
        <StaggerContainer className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <StaggerItem key={post.id}>
              <Card className="overflow-hidden flex flex-col">
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={post.coverImage || "/placeholder.svg?height=400&width=600"}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform hover:scale-105 duration-300"
                  />
                  {post.featured && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary">Destacado</Badge>
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <CardTitle className="line-clamp-1">{post.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(
                          typeof (post.publishedAt || post.createdAt) === "string"
                            ? (post.publishedAt || post.createdAt) as string
                            : ((post.publishedAt || post.createdAt) as Date).toString()
                        )}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2 flex-grow">
                  <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link href={`/blog/${post.slug}`} className="w-full">
                    <Button variant="outline" className="w-full group bg-transparent">
                      Leer artículo
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
        <FadeIn className="flex justify-center mt-10">
          <Link href="/blog">
            <Button variant="outline" size="lg" className="group bg-transparent">
              Ver todos los artículos
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </Link>
        </FadeIn>
      </div>
    </section>
  )
}
