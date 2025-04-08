// Functions for permission checking
import { getUserById } from "./users"

// Define permission types
export type Permission =
  | "homepage:edit"
  | "team:manage"
  | "team:add"
  | "team:edit"
  | "team:delete"
  | "users:manage"
  | "users:add"
  | "users:edit"
  | "users:delete"
  | "profile:edit"

// Role-based permissions
const rolePermissions: Record<string, Permission[]> = {
  admin: [
    "homepage:edit",
    "team:manage",
    "team:add",
    "team:edit",
    "team:delete",
    "users:manage",
    "users:add",
    "users:edit",
    "users:delete",
    "profile:edit",
  ],
  editor: ["homepage:edit", "team:manage", "team:add", "team:edit", "profile:edit"],
  member: ["profile:edit"],
}

// Check if a user has a specific permission
export async function checkPermission(userId: string, permission: Permission): Promise<boolean> {
  try {
    // Obtener el usuario de la base de datos
    const user = await getUserById(userId)

    if (!user) {
      console.error(`Usuario con ID ${userId} no encontrado`)
      return false
    }

    // Verificar si el usuario está activo
    if (!user.active) {
      console.error(`Usuario con ID ${userId} no está activo`)
      return false
    }

    // Obtener los permisos del rol del usuario
    const userRole = user.role

    // Si el usuario es administrador, tiene todos los permisos
    if (userRole === "admin") {
      return true
    }

    // Verificar si el rol existe en nuestro mapa de permisos
    if (!rolePermissions[userRole]) {
      console.error(`Rol '${userRole}' no encontrado en el mapa de permisos`)
      return false
    }

    // Verificar si el rol tiene el permiso solicitado
    return rolePermissions[userRole].includes(permission)
  } catch (error) {
    console.error("Error al verificar permisos:", error)
    return false
  }
}

// Función para obtener todos los permisos de un usuario
export async function getUserPermissions(userId: string): Promise<Permission[]> {
  try {
    const user = await getUserById(userId)

    if (!user || !user.active) {
      return []
    }

    // Si el usuario es administrador, devolver todos los permisos posibles
    if (user.role === "admin") {
      return Object.values(rolePermissions).flat() as Permission[]
    }

    // Devolver los permisos del rol del usuario
    return rolePermissions[user.role] || []
  } catch (error) {
    console.error("Error al obtener permisos del usuario:", error)
    return []
  }
}
