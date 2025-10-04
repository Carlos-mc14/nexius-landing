"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  Users,
  FolderOpen,
  Search,
  UserCheck,
  Percent,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Blog",
    href: "/dashboard/blog",
    icon: FileText,
  },
  {
    name: "Promociones",
    href: "/dashboard/promotions",
    icon: Percent,
  },
  {
    name: "Proyectos",
    href: "/dashboard/projects",
    icon: FolderOpen,
  },
  {
    name: "Equipo",
    href: "/dashboard/team",
    icon: Users,
  },
  {
    name: "Usuarios",
    href: "/dashboard/users",
    icon: UserCheck,
  },
  {
    name: "Homepage",
    href: "/dashboard/homepage",
    icon: LayoutDashboard,
  },
  {
    name: "SEO",
    href: "/dashboard/seo",
    icon: Search,
  },
  {
    name: "Transactions",
    href: "/dashboard/transactions",
    icon: FileText,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-2">
      {navigation.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

        return (
          <div key={item.name}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          </div>
        )
      })}
    </nav>
  )
}
