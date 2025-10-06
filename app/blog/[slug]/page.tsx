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
import { getSeoConfig } from "@/lib/seo"
import { buildPageMetadataOverrides } from "@/lib/seo-utils"

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata(props: BlogPostPageProps): Promise<Metadata> {
  const params = await props.params;
  const post = await getBlogPostBySlug(params.slug)

  const seoConfig = await getSeoConfig()

  if (!post) {
    return buildPageMetadataOverrides(seoConfig, {
      title: "Artículo no encontrado",
      description: "El artículo que estás buscando no existe o ha sido eliminado.",
    }) as Metadata
  }

  const overrides = buildPageMetadataOverrides(seoConfig, {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    image: post.coverImage,
    path: `/blog/${params.slug}`,
  })

  return {
    ...(overrides as Metadata),
    openGraph: {
      ...(overrides as any).openGraph,
      images: [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }],
    },
  }
}

export default async function BlogPostPage(props: BlogPostPageProps) {
  const params = await props.params;
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
      <section className="w-full py-8 md:py-16 bg-background">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
            {/* Main Content */}
            <article className="flex-1 space-y-8">
              {/* Back to Blog */}
              <Link href="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al blog
              </Link>

              {/* Article Card Container */}
              <Card className="overflow-hidden border-2">
                <CardContent className="p-0">
                  {/* Cover Image */}
                  <div className="relative aspect-video w-full overflow-hidden">
                    <Image
                      src={post.coverImage || "/placeholder.svg?height=720&width=1280"}
                      alt={post.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>

                  {/* Author Info */}
                  <div className="flex items-center gap-4 p-6 pb-0">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-border">
                      <Image
                        src={post.author.image || "/placeholder.svg?height=40&width=40"}
                        alt={post.author.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold">{post.author.name}</p>
                      <p className="text-sm text-muted-foreground">Autor</p>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Article Content - Fixed to use MarkdownContent component */}
                  <div className="px-6 pb-8">
                    <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-primary prose-img:rounded-lg">
                      <MarkdownContent content={post.content} />
                    </div>
                  </div>

                  <Separator />

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="px-6 py-6 space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Etiquetas</h3>
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag, index) => (
                          <Link key={index} href={`/blog/etiqueta/${tag.toLowerCase()}`}>
                            <Badge variant="secondary" className="text-sm hover:bg-primary hover:text-primary-foreground transition-colors">
                              #{tag}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Social Sharing */}
                  <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Bookmark className="h-4 w-4" />
                        <span className="hidden sm:inline">Guardar</span>
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Share2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Compartir</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </article>

            {/* Sidebar - Sticky */}
            <aside className="w-full md:w-80 lg:w-96 flex-shrink-0">
              <div className="md:sticky md:top-20 space-y-6">
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
                        <Badge variant="secondary" className="text-sm hover:bg-primary hover:text-primary-foreground transition-colors">
                          {post.category}
                        </Badge>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}