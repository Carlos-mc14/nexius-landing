"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { TeamMember } from "@/types/team"
import { createTeamMember, updateTeamMember } from "@/lib/team-client"
import { TechnologySelector } from "./technology-selector"
import { ImageUpload } from "../image-upload"
import { GalleryUpload } from "../gallery-upload"

const teamMemberFormSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  position: z.string().min(2, { message: "El cargo debe tener al menos 2 caracteres" }),
  publicId: z
    .string()
    .min(2, { message: "El ID público debe tener al menos 2 caracteres" })
    .regex(/^[a-z0-9-]+$/, { message: "El ID público solo puede contener letras minúsculas, números y guiones" }),
  bio: z.string().min(10, { message: "La biografía debe tener al menos 10 caracteres" }),
  longBio: z.string().optional(),
  email: z.string().email({ message: "Ingrese un email válido" }).optional().or(z.literal("")),
  image: z.string().min(1, { message: "La imagen es requerida" }),
  active: z.boolean().default(true),
  showSpotify: z.boolean().default(false),
  spotifyUserId: z.string().optional(),
  showTechnologies: z.boolean().default(false),
  showGallery: z.boolean().default(false),
  technologies: z
    .array(
      z.object({
        name: z.string(),
        icon: z.string(),
      }),
    )
    .optional(),
  galleryImages: z.array(z.string()).optional(),
  links: z
    .object({
      portfolio: z.string().url({ message: "Ingrese una URL válida" }).optional().or(z.literal("")),
      linkedin: z.string().url({ message: "Ingrese una URL válida" }).optional().or(z.literal("")),
      twitter: z.string().url({ message: "Ingrese una URL válida" }).optional().or(z.literal("")),
      instagram: z.string().url({ message: "Ingrese una URL válida" }).optional().or(z.literal("")),
      github: z.string().url({ message: "Ingrese una URL válida" }).optional().or(z.literal("")),
    })
    .optional(),
})

type TeamMemberFormValues = z.infer<typeof teamMemberFormSchema>

interface TeamMemberFormProps {
  initialData?: TeamMember
}

export function TeamMemberForm({ initialData }: TeamMemberFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!initialData

  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          showSpotify: initialData.profileOptions?.showSpotify || false,
          spotifyUserId: initialData.profileOptions?.spotifyUserId || "",
          showTechnologies: initialData.profileOptions?.showTechnologies || false,
          showGallery: initialData.profileOptions?.showGallery || false,
          galleryImages: initialData.profileOptions?.galleryImages || [],
        }
      : {
          name: "",
          position: "",
          publicId: "",
          bio: "",
          longBio: "",
          email: "",
          image: "",
          active: true,
          showSpotify: false,
          spotifyUserId: "",
          showTechnologies: false,
          showGallery: false,
          technologies: [],
          galleryImages: [],
          links: {
            portfolio: "",
            linkedin: "",
            twitter: "",
            instagram: "",
            github: "",
          },
        },
  })

  async function onSubmit(data: TeamMemberFormValues) {
    setIsLoading(true)
    try {
      // Transform form data to match the TeamMember structure
      const teamMemberData: Partial<TeamMember> = {
        ...data,
        profileOptions: {
          showSpotify: data.showSpotify,
          spotifyUserId: data.spotifyUserId,
          showTechnologies: data.showTechnologies,
          showGallery: data.showGallery,
          galleryImages: data.galleryImages,
        },
      }
      /*
      // Remove fields that are not part of the TeamMember structure
      delete teamMemberData.showSpotify
      delete teamMemberData.spotifyUserId
      delete teamMemberData.showTechnologies
      delete teamMemberData.showGallery
      delete teamMemberData.galleryImages*/

      if (isEditing) {
        await updateTeamMember(initialData.id, teamMemberData)
        toast({
          title: "Perfil actualizado",
          description: "El perfil del miembro ha sido actualizado correctamente.",
        })
      } else {
        await createTeamMember(teamMemberData)
        toast({
          title: "Miembro creado",
          description: "El nuevo miembro ha sido creado correctamente.",
        })
        router.push("/dashboard/team")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: isEditing
          ? "No se pudo actualizar el perfil. Intenta nuevamente."
          : "No se pudo crear el miembro. Intenta nuevamente.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList>
            <TabsTrigger value="basic">Información Básica</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="social">Redes Sociales</TabsTrigger>
            <TabsTrigger value="technologies">Tecnologías</TabsTrigger>
            <TabsTrigger value="gallery">Galería</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del miembro" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Desarrollador Frontend" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="publicId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Público</FormLabel>
                    <FormControl>
                      <Input placeholder="nombre-apellido" {...field} disabled={isLoading || isEditing} />
                    </FormControl>
                    <FormDescription>
                      Este ID se usará en la URL del perfil público (ej: /equipo/miembro/nombre-apellido)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (opcional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@ejemplo.com" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 col-span-2">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Activo</FormLabel>
                      <FormDescription>Determina si este miembro se muestra en la página de equipo.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagen de perfil</FormLabel>
                  <FormControl>
                    <ImageUpload value={field.value} onChange={field.onChange} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografía corta</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Breve descripción para la tarjeta de equipo"
                      className="min-h-[80px]"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Esta biografía corta se mostrará en la tarjeta del miembro en la página de equipo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="longBio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografía completa (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Biografía detallada para la página de perfil"
                      className="min-h-[200px]"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Esta biografía completa se mostrará en la página de perfil individual del miembro.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="showSpotify"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Mostrar Spotify</FormLabel>
                    <FormDescription>
                      Muestra la canción actual o última reproducida de Spotify en el perfil.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("showSpotify") && (
              <FormField
                control={form.control}
                name="spotifyUserId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID de usuario de Spotify</FormLabel>
                    <FormControl>
                      <Input placeholder="ID de Spotify" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>
                      ID de usuario de Spotify para mostrar la música que está escuchando.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <FormField
              control={form.control}
              name="links.portfolio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sitio web / Portafolio</FormLabel>
                  <FormControl>
                    <Input placeholder="https://ejemplo.com" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="links.linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn</FormLabel>
                  <FormControl>
                    <Input placeholder="https://linkedin.com/in/username" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="links.github"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub</FormLabel>
                  <FormControl>
                    <Input placeholder="https://github.com/username" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="links.twitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter</FormLabel>
                  <FormControl>
                    <Input placeholder="https://twitter.com/username" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="links.instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <Input placeholder="https://instagram.com/username" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="technologies" className="space-y-6">
            <FormField
              control={form.control}
              name="showTechnologies"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Mostrar Tecnologías</FormLabel>
                    <FormDescription>Muestra la sección de tecnologías en el perfil del miembro.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("showTechnologies") && (
              <FormField
                control={form.control}
                name="technologies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tecnologías</FormLabel>
                    <FormControl>
                      <TechnologySelector value={field.value || []} onChange={field.onChange} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>Selecciona las tecnologías que domina este miembro del equipo.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <FormField
              control={form.control}
              name="showGallery"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Mostrar Galería</FormLabel>
                    <FormDescription>Muestra una galería de imágenes en el perfil del miembro.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("showGallery") && (
              <FormField
                control={form.control}
                name="galleryImages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imágenes de la Galería</FormLabel>
                    <FormControl>
                      <GalleryUpload value={field.value || []} onChange={field.onChange} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>Sube imágenes para la galería del perfil (máximo 6 imágenes).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </TabsContent>
        </Tabs>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Guardando..." : "Creando..."}
            </>
          ) : isEditing ? (
            "Guardar cambios"
          ) : (
            "Crear miembro"
          )}
        </Button>
      </form>
    </Form>
  )
}
