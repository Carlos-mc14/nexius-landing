import type React from "react"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { getSession } from "@/lib/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verify authentication
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-background border-r border-border flex-shrink-0">
        <div className="flex flex-col w-full">
          <div className="p-4 border-b border-border">
            <h1 className="text-xl font-bold">NEXIUS Dashboard</h1>
          </div>
          <div className="flex-1 overflow-auto">
            <DashboardNav />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader user={session.user} />
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-6">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              }
            >
              {children}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}
