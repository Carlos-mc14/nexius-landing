"use client"

import { useEffect, useState } from "react"
import { marked } from "marked"

interface MarkdownContentProps {
  content: string
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const [html, setHtml] = useState<string>("")

  useEffect(() => {
    // Configurar marked para que genere HTML seguro
    marked.setOptions({
      breaks: true,
      gfm: true,
    })

    try {
      const parsedHtml = marked.parse(content || "")
      setHtml(parsedHtml.toString())
    } catch (error) {
      console.error("Error parsing markdown:", error)
      setHtml("<p>Error al procesar el contenido</p>")
    }
  }, [content])

  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
