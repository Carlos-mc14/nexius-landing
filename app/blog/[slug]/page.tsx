import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { getBlogPostBySlug, getBlogPosts } from "@/lib/blog"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, Clock, Share2, Bookmark, ThumbsUp } from "lucide-react"
import { MarkdownContent } from "@/components/markdown-content"
import type { Metadata } from "next"

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug)

  if (!post) {
    return {
      title: "Artículo no encontrado",
      description: "El artículo que estás buscando no existe o ha sido eliminado.",
    }
  }

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  // Obtener posts relacionados (misma categoría o tags similares)
  const allPosts = await getBlogPosts({ status: "published" })
  const relatedPosts = allPosts
    .filter((p) => p.id !== post.id && (p.category === post.category || p.tags.some((tag) => post.tags.includes(tag))))
    .slice(0, 3)

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2 max-w-3xl">
              <div className="flex justify-center gap-2 mb-4">
                {post.category && (
                  <Badge variant="secondary" className="text-sm">
                    {post.category}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                {post.title}
              </h1>
              <p className="max-w-[700px] text-gray-300 md:text-xl">{post.excerpt}</p>
              <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime} min de lectura</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 space-y-8">
              {/* Back to Blog */}
              <Link href="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al blog
              </Link>

              {/* Cover Image */}
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                <Image
                  src={post.coverImage || "/placeholder.svg?height=720&width=1280"}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-4">
                <div className="relative h-10 w-10 rounded-full overflow-hidden">
                  <Image
                    src={post.author.image || "/placeholder.svg?height=40&width=40"}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">{post.author.name}</p>
                  <p className="text-sm text-muted-foreground">Autor</p>
                </div>
              </div>

              {/* Article Content - Fixed to use MarkdownContent component */}
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <MarkdownContent content={post.content} />
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Etiquetas</h2>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <Link key={index} href={`/blog/etiqueta/${tag.toLowerCase()}`}>
                        <Badge variant="outline" className="text-sm">
                          {tag}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Sharing */}
              <div className="flex items-center justify-between border-t border-b py-4">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ThumbsUp className="h-4 w-4" />
                    <span>Me gusta</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Bookmark className="h-4 w-4" />
                    <span>Guardar</span>
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-full md:w-1/3 space-y-6">
              {/* Related Posts */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Artículos relacionados</h3>
                  <Separator />

                  {relatedPosts.length > 0 ? (
                    <div className="space-y-4">
                      {relatedPosts.map((relatedPost) => (
                        <div key={relatedPost.id} className="flex gap-4">
                          <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
                            <Image
                              src={
                                relatedPost.coverImage ||
                                `/placeholder.svg?height=64&width=64&text=${
                                  encodeURIComponent(relatedPost.title.charAt(0)) || "/placeholder.svg"
                                }`
                              }
                              alt={relatedPost.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <Link
                              href={`/blog/${relatedPost.slug}`}
                              className="font-medium hover:text-primary line-clamp-2"
                            >
                              {relatedPost.title}
                            </Link>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(relatedPost.publishedAt || relatedPost.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No hay artículos relacionados.</p>
                  )}

                  <div className="pt-2">
                    <Link href="/blog">
                      <Button variant="outline" className="w-full">
                        Ver todos los artículos
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Categorías</h3>
                  <Separator />
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/blog/categoria/${post.category.toLowerCase()}`}>
                      <Badge variant="secondary" className="text-sm">
                        {post.category}
                      </Badge>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
