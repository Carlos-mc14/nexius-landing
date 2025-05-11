"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, LayoutDashboard, Newspaper, Users, FolderKanban, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface DashboardNavProps {
  className?: string
}

export function DashboardNav({ className }: DashboardNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
      pattern: /^\/dashboard$/,
    },
    {
      title: "Página de inicio",
      href: "/dashboard/homepage",
      icon: <Home className="mr-2 h-4 w-4" />,
      pattern: /^\/dashboard\/homepage/,
    },
    {
      title: "Proyectos",
      href: "/dashboard/projects",
      icon: <FolderKanban className="mr-2 h-4 w-4" />,
      pattern: /^\/dashboard\/projects/,
    },
    {
      title: "Blog",
      href: "/dashboard/blog",
      icon: <Newspaper className="mr-2 h-4 w-4" />,
      pattern: /^\/dashboard\/blog/,
    },
    {
      title: "Equipo",
      href: "/dashboard/team",
      icon: <Users className="mr-2 h-4 w-4" />,
      pattern: /^\/dashboard\/team/,
    },
    {
      title: "Usuarios",
      href: "/dashboard/users",
      icon: <Users className="mr-2 h-4 w-4" />,
      pattern: /^\/dashboard\/users/,
    },
    {
      title: "SEO",
      href: "/dashboard/seo",
      icon: <Search className="mr-2 h-4 w-4" />,
      pattern: /^\/dashboard\/seo/,
    },
  ]

  return (
    <nav className={cn("flex flex-col space-y-1", className)}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            item.pattern.test(pathname) ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
            "justify-start",
          )}
        >
          {item.icon}
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
