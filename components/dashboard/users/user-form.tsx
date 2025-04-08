"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { ImageUpload } from "../image-upload"
import { createUser, updateUser } from "@/lib/users-client"
import type { Role } from "@/lib/roles"

const userFormSchema = z
  .object({
    name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
    email: z.string().email({ message: "Ingrese un email válido" }),
    password: z
      .string()
      .min(6, { message: "La contraseña debe tener al menos 6 caracteres" })
      .optional()
      .or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
    role: z.string({ required_error: "Seleccione un rol" }),
    active: z.boolean().default(true),
    image: z.string().optional(),
    teamMemberId: z.string().optional().or(z.literal("")),
  })
  .refine((data) => !data.password || data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

type UserFormValues = z.infer<typeof userFormSchema>

interface UserFormProps {
  initialData?: {
    id: string
    name: string
    email: string
    role: string
    active: boolean
    image?: string
    teamMemberId?: string
  }
  roles: Role[]
}

export function UserForm({ initialData, roles }: UserFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const isEditing = !!initialData

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          password: "",
          confirmPassword: "",
        }
      : {
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "member",
          active: true,
          image: "",
          teamMemberId: "",
        },
  })

  async function onSubmit(data: UserFormValues) {
    setIsLoading(true)
    try {
      console.log("Submitting form data:", data)

      if (isEditing) {
        await updateUser(initialData.id, data)
        toast({
          title: "Usuario actualizado",
          description: "El usuario ha sido actualizado correctamente.",
        })
      } else {
        await createUser(data)
        toast({
          title: "Usuario creado",
          description: "El nuevo usuario ha sido creado correctamente.",
        })
        router.push("/dashboard/users")
      }
    } catch (error) {
      console.error("Form submission error:", error)

      toast({
        title: "Error",
        description: isEditing
          ? "No se pudo actualizar el usuario. Intenta nuevamente."
          : "No se pudo crear el usuario. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre completo</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del usuario" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="usuario@ejemplo.com" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isEditing ? "Nueva contraseña (opcional)" : "Contraseña"}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...field}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
                    </Button>
                  </div>
                </FormControl>
                {isEditing && (
                  <FormDescription>Deja este campo en blanco para mantener la contraseña actual.</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isEditing ? "Confirmar nueva contraseña" : "Confirmar contraseña"}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...field}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">
                        {showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>El rol determina los permisos que tendrá el usuario en el sistema.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="teamMemberId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID de miembro del equipo (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="ID del miembro asociado" {...field} disabled={isLoading} />
                </FormControl>
                <FormDescription>
                  Si este usuario corresponde a un miembro del equipo, ingresa su ID para vincularlo.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Activo</FormLabel>
                <FormDescription>Determina si este usuario puede iniciar sesión en el sistema.</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagen de perfil (opcional)</FormLabel>
              <FormControl>
                <ImageUpload value={field.value || ""} onChange={field.onChange} disabled={isLoading} />
              </FormControl>
              <FormDescription>Imagen que se mostrará en el perfil del usuario.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Guardando..." : "Creando..."}
            </>
          ) : isEditing ? (
            "Guardar cambios"
          ) : (
            "Crear usuario"
          )}
        </Button>
      </form>
    </Form>
  )
}
