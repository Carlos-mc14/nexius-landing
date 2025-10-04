import { ReactNode } from "react"
import { FadeIn } from "./motion-wrapper"

interface SectionHeaderProps {
  badge?: string
  title: string
  description?: string
  align?: "center" | "left"
  className?: string
}

export function SectionHeader({ badge, title, description, align = "center", className }: SectionHeaderProps) {
  const alignment = align === "center" ? "items-center text-center" : "items-start text-left"
  return (
    <FadeIn>
      <div className={`flex flex-col justify-center space-y-4 mb-12 ${alignment} ${className || ""}`.trim()}>
        {badge && (
          <div className="text-slate-700 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm backdrop-blur-sm dark:border-primary/30 dark:bg-primary/20 dark:text-slate-200">
            <span className="font-medium">{badge}</span>
          </div>
        )}
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{title}</h2>
        {description && <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">{description}</p>}
      </div>
    </FadeIn>
  )
}
