// Functions for role management

export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
}

export async function getRoles(): Promise<Role[]> {
  // In a real environment, this would fetch from a database
  // For now, we'll use mock data
  return [
    {
      id: "admin",
      name: "Administrador",
      description: "Acceso completo a todas las funcionalidades del sistema",
      permissions: [
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
    },
    {
      id: "editor",
      name: "Editor",
      description: "Puede editar contenido del sitio y gestionar el equipo",
      permissions: ["homepage:edit", "team:manage", "team:add", "team:edit", "profile:edit"],
    },
    {
      id: "member",
      name: "Miembro",
      description: "Acceso limitado a su propio perfil",
      permissions: ["profile:edit"],
    },
  ]
}
