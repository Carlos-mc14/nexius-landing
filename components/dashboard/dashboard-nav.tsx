"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Settings, User, Home, UserCog } from "lucide-react"
import { useEffect, useState } from "react"
import { hasPermission } from "@/lib/auth-client"

interface DashboardNavProps {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()
  const [canEditHomepage, setCanEditHomepage] = useState(false)
  const [canManageTeam, setCanManageTeam] = useState(false)
  const [canManageUsers, setCanManageUsers] = useState(false)

  // Verificar permisos al cargar el componente
  useEffect(() => {
    async function checkPermissions() {
      const [homepageEdit, teamManage, usersManage] = await Promise.all([
        hasPermission("homepage:edit"),
        hasPermission("team:manage"),
        hasPermission("users:manage"),
      ])

      setCanEditHomepage(homepageEdit)
      setCanManageTeam(teamManage)
      setCanManageUsers(usersManage)
    }

    checkPermissions()
  }, [])

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Página Principal",
      href: "/dashboard/homepage",
      icon: Home,
      requiresPermission: canEditHomepage,
    },
    {
      title: "Equipo",
      href: "/dashboard/team",
      icon: Users,
      requiresPermission: canManageTeam,
    },
    {
      title: "Usuarios",
      href: "/dashboard/users",
      icon: UserCog,
      requiresPermission: canManageUsers,
    },
    {
      title: "Mi Perfil",
      href: "/dashboard/profile",
      icon: User,
    },
    {
      title: "Configuración",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  return (
    <nav className="grid items-start gap-2">
      {navItems.map((item) => {
        // Skip items that require permissions the user doesn't have
        if (item.hasOwnProperty("requiresPermission") && !item.requiresPermission) return null

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}
