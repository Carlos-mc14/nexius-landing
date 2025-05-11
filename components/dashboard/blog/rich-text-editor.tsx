"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  ImageIcon,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Quote,
} from "lucide-react"
import { ImageUploadModal } from "@/components/dashboard/image-upload-modal"
import { marked } from "marked" // Importamos marked para procesar Markdown

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function RichTextEditor({ value, onChange, disabled }: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("edit")
  const [showImageModal, setShowImageModal] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string>("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Configurar marked para que genere HTML seguro
  useEffect(() => {
    marked.setOptions({
      breaks: true,
      gfm: true,
    })
  }, [])

  // Actualizar la vista previa cuando cambia el valor o la pestaña activa
  useEffect(() => {
    if (activeTab === "preview") {
      const parseMarkdown = async () => {
        try {
          const html = await marked.parse(value || "")
          setPreviewHtml(html)
        } catch (error) {
          console.error("Error parsing markdown:", error)
          setPreviewHtml("<p>Error al procesar el Markdown</p>")
        }
      }
      parseMarkdown()
    }
  }, [value, activeTab])

  // Handle toolbar button clicks
  const handleToolbarAction = (action: string) => {
    if (disabled) return
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    let newText = value

    switch (action) {
      case "bold":
        newText = value.substring(0, start) + `**${selectedText}**` + value.substring(end)
        break
      case "italic":
        newText = value.substring(0, start) + `*${selectedText}*` + value.substring(end)
        break
      case "h1":
        newText = value.substring(0, start) + `# ${selectedText}` + value.substring(end)
        break
      case "h2":
        newText = value.substring(0, start) + `## ${selectedText}` + value.substring(end)
        break
      case "h3":
        newText = value.substring(0, start) + `### ${selectedText}` + value.substring(end)
        break
      case "ul":
        newText = value.substring(0, start) + `- ${selectedText}` + value.substring(end)
        break
      case "ol":
        newText = value.substring(0, start) + `1. ${selectedText}` + value.substring(end)
        break
      case "quote":
        newText = value.substring(0, start) + `> ${selectedText}` + value.substring(end)
        break
      case "code":
        newText = value.substring(0, start) + `\`\`\`\n${selectedText}\n\`\`\`` + value.substring(end)
        break
      case "link":
        const url = prompt("Ingresa la URL:", "https://")
        if (url) {
          newText = value.substring(0, start) + `[${selectedText || "Enlace"}](${url})` + value.substring(end)
        }
        break
      case "image":
        setShowImageModal(true)
        return
    }

    onChange(newText)

    // Set focus back to textarea
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start, end)
    }, 0)
  }

  const handleImageInsert = (imageUrl: string, altText: string) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const imageMarkdown = `![${altText}](${imageUrl})`

    const newText = value.substring(0, start) + imageMarkdown + value.substring(start)
    onChange(newText)

    setShowImageModal(false)
  }

  return (
    <div className="border rounded-md">
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
        <Button type="button" variant="ghost" size="sm" onClick={() => handleToolbarAction("bold")} disabled={disabled}>
          <Bold className="h-4 w-4" />
          <span className="sr-only">Negrita</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleToolbarAction("italic")}
          disabled={disabled}
        >
          <Italic className="h-4 w-4" />
          <span className="sr-only">Cursiva</span>
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => handleToolbarAction("h1")} disabled={disabled}>
          <Heading1 className="h-4 w-4" />
          <span className="sr-only">Encabezado 1</span>
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => handleToolbarAction("h2")} disabled={disabled}>
          <Heading2 className="h-4 w-4" />
          <span className="sr-only">Encabezado 2</span>
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => handleToolbarAction("h3")} disabled={disabled}>
          <Heading3 className="h-4 w-4" />
          <span className="sr-only">Encabezado 3</span>
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => handleToolbarAction("ul")} disabled={disabled}>
          <List className="h-4 w-4" />
          <span className="sr-only">Lista</span>
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => handleToolbarAction("ol")} disabled={disabled}>
          <ListOrdered className="h-4 w-4" />
          <span className="sr-only">Lista numerada</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleToolbarAction("quote")}
          disabled={disabled}
        >
          <Quote className="h-4 w-4" />
          <span className="sr-only">Cita</span>
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => handleToolbarAction("code")} disabled={disabled}>
          <Code className="h-4 w-4" />
          <span className="sr-only">Código</span>
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => handleToolbarAction("link")} disabled={disabled}>
          <Link className="h-4 w-4" />
          <span className="sr-only">Enlace</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleToolbarAction("image")}
          disabled={disabled}
        >
          <ImageIcon className="h-4 w-4" />
          <span className="sr-only">Imagen</span>
        </Button>
      </div>

      <Tabs defaultValue="edit" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center px-4 py-2 border-b">
          <TabsList>
            <TabsTrigger value="edit">Editar</TabsTrigger>
            <TabsTrigger value="preview">Vista previa</TabsTrigger>
          </TabsList>
          <div className="text-xs text-muted-foreground">Markdown</div>
        </div>

        <TabsContent value="edit" className="p-0 m-0">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-full min-h-[300px] p-4 font-mono text-sm resize-y focus:outline-none focus:ring-0 border-0"
            placeholder="Escribe el contenido del artículo usando Markdown..."
          />
        </TabsContent>

        <TabsContent value="preview" className="p-0 m-0">
          <div
            className="w-full min-h-[300px] p-4 prose prose-slate dark:prose-invert max-w-none overflow-auto"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </TabsContent>
      </Tabs>

      {showImageModal && (
        <ImageUploadModal onClose={() => setShowImageModal(false)} onInsert={handleImageInsert} folder="blog" />
      )}
    </div>
  )
}
