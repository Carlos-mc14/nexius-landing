"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Eye, Clock, Calendar } from "lucide-react"
import { deleteBlogPost, getBlogPosts } from "@/lib/blog-client"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export const dynamic = "force-dynamic"

export default function BlogDashboardPage() {
  const [allPosts, setAllPosts] = useState<any[]>([])
  const [publishedPosts, setPublishedPosts] = useState<any[]>([])
  const [draftPosts, setDraftPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const posts = await getBlogPosts()
        setAllPosts(posts)
        setPublishedPosts(posts.filter((post) => post.status === "published"))
        setDraftPosts(posts.filter((post) => post.status === "draft"))
      } catch (err) {
        console.error("Error fetching blog posts:", err)
        setError("No se pudieron cargar los artículos del blog")
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold tracking-tight">Error</h3>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => router.refresh()}>Intentar de nuevo</Button>
      </div>
    )
  }

  const handlePostDeleted = (deletedPostId: string) => {
    setAllPosts((prevPosts) => prevPosts.filter((post) => post.id !== deletedPostId))
    setPublishedPosts((prevPosts) => prevPosts.filter((post) => post.id !== deletedPostId))
    setDraftPosts((prevPosts) => prevPosts.filter((post) => post.id !== deletedPostId))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Gestión del Blog</h3>
          <p className="text-muted-foreground">Administra los artículos del blog.</p>
        </div>
        <Link href="/dashboard/blog/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo artículo
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Todos ({allPosts.length})</TabsTrigger>
          <TabsTrigger value="published">Publicados ({publishedPosts.length})</TabsTrigger>
          <TabsTrigger value="drafts">Borradores ({draftPosts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {allPosts.map((post) => (
              <BlogPostCard key={post.id} post={post} onDeleted={handlePostDeleted} />
            ))}

            {allPosts.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No hay artículos disponibles.</p>
                <Link href="/dashboard/blog/new" className="mt-4 inline-block">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear nuevo artículo
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="published" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {publishedPosts.map((post) => (
              <BlogPostCard key={post.id} post={post} onDeleted={handlePostDeleted} />
            ))}

            {publishedPosts.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No hay artículos publicados.</p>
                <Link href="/dashboard/blog/new" className="mt-4 inline-block">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear nuevo artículo
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {draftPosts.map((post) => (
              <BlogPostCard key={post.id} post={post} onDeleted={handlePostDeleted} />
            ))}

            {draftPosts.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No hay borradores disponibles.</p>
                <Link href="/dashboard/blog/new" className="mt-4 inline-block">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear nuevo artículo
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BlogPostCard({ post, onDeleted }: { post: any; onDeleted: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteBlogPost(post.id)
      toast({
        title: "Artículo eliminado",
        description: `El artículo "${post.title}" ha sido eliminado correctamente.`,
      })
      onDeleted(post.id)
    } catch (error) {
      console.error("Error al eliminar el artículo:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el artículo. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setOpen(false)
    }
  }

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="aspect-video relative">
        <Image
          src={post.coverImage || `/placeholder.svg?height=300&width=400&text=${encodeURIComponent(post.title)}`}
          alt={post.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge variant={post.status === "published" ? "secondary" : "outline"}>
            {post.status === "published" ? "Publicado" : "Borrador"}
          </Badge>
        </div>
      </div>
      <CardHeader>
        <div className="space-y-1">
          {post.category && (
            <Badge variant="outline" className="mb-2">
              {post.category}
            </Badge>
          )}
          <CardTitle className="line-clamp-2">{post.title}</CardTitle>
          <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{post.readTime} min</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Link href={`/dashboard/blog/${post.id}`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </Link>
          <Link href={`/blog/${post.slug}`} target="_blank">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              Ver
            </Button>
          </Link>
        </div>
        <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Eliminar</span>
        </Button>
      </CardFooter>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el artículo "{post.title}" y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
