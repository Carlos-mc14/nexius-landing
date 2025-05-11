import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Calendar, Clock, Search, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getBlogPosts, getBlogCategories, getBlogTags } from "@/lib/blog"
import { formatDate } from "@/lib/utils"

export const revalidate = 0 // Disable caching for this page

export default async function BlogPage() {
  // Fetch blog posts, categories and tags
  const posts = await getBlogPosts({ status: "published" })
  const categories = await getBlogCategories()
  const tags = await getBlogTags()

  // Get featured posts
  const featuredPosts = posts.filter((post) => post.featured).slice(0, 1)
  const regularPosts = posts.filter((post) => !post.featured)

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Blog de Nexius
              </h1>
              <p className="max-w-[700px] text-gray-300 md:text-xl">
                Artículos, tutoriales y noticias sobre desarrollo de software y tecnología
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="w-full py-8 border-b">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Buscar artículos..." className="w-full pl-8" />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 5).map((category) => (
                <Link key={category} href={`/blog/categoria/${category.toLowerCase()}`}>
                  <Badge variant="outline" className="hover:bg-muted">
                    {category}
                  </Badge>
                </Link>
              ))}
              {categories.length > 5 && (
                <Badge variant="outline" className="hover:bg-muted">
                  +{categories.length - 5} más
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post Section */}
      {featuredPosts.length > 0 && (
        <section className="w-full py-12">
          <div className="container px-4 md:px-6">
            <h2 className="text-2xl font-bold tracking-tight mb-6">Artículo Destacado</h2>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="col-span-1 lg:col-span-5 overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                    <div className="col-span-1 lg:col-span-3 relative aspect-video lg:aspect-auto lg:h-full">
                      <Image
                        src={
                          post.coverImage ||
                          `/placeholder.svg?height=600&width=800&text=${encodeURIComponent(post.title)}`
                        }
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="col-span-1 lg:col-span-2 flex flex-col p-6">
                      <CardHeader className="p-0 pb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>{post.category}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(post.publishedAt || post.createdAt)}
                          </span>
                        </div>
                        <CardTitle className="text-2xl lg:text-3xl mb-2">{post.title}</CardTitle>
                        <CardDescription className="text-base">{post.excerpt}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0 flex-grow">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <Clock className="h-4 w-4" />
                          <span>{post.readTime} min de lectura</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="p-0 pt-4">
                        <Link href={`/blog/${post.slug}`} className="w-full">
                          <Button className="w-full">
                            Leer artículo completo <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </CardFooter>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts Section */}
      <section className="w-full py-12 bg-muted/30">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Todos los Artículos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden flex flex-col h-full">
                <div className="relative aspect-video">
                  <Image
                    src={
                      post.coverImage || `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(post.title)}`
                    }
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                  {post.category && (
                    <div className="absolute top-2 right-2">
                      <Badge>{post.category}</Badge>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <Clock className="h-4 w-4" />
                    <span>{post.readTime} min</span>
                  </div>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/blog/${post.slug}`} className="w-full">
                    <Button variant="outline" className="w-full group">
                      Leer artículo completo
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          {regularPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay artículos publicados aún.</p>
            </div>
          )}
        </div>
      </section>

      {/* Tags Section */}
      <section className="w-full py-12">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Explorar por Etiquetas</h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link key={tag} href={`/blog/etiqueta/${tag.toLowerCase()}`}>
                <Badge variant="secondary" className="text-sm py-1 px-3">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="w-full py-12 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight">Suscríbete a nuestro Newsletter</h2>
            <p className="text-primary-foreground/80">
              Recibe las últimas actualizaciones, artículos y recursos directamente en tu bandeja de entrada.
            </p>
            <div className="flex w-full max-w-md flex-col sm:flex-row gap-2">
              <Input type="email" placeholder="tu@email.com" className="bg-primary-foreground text-foreground" />
              <Button variant="secondary">Suscribirse</Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
