"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { getStore } from "@netlify/blobs"
import { uploadToNetlifyBlob } from "@/lib/netlify-blob-client"
import { toast } from "@/components/ui/use-toast"

// Estado de la configuración
enum ConfigStatus {
  UNKNOWN = "unknown",
  CHECKING = "checking",
  CONFIGURED = "configured",
  NOT_CONFIGURED = "not_configured",
  ERROR = "error",
}

export function NetlifyBlobConfig() {
  const [status, setStatus] = useState<ConfigStatus>(ConfigStatus.UNKNOWN)
  const [isUploading, setIsUploading] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  // Verificar configuración al cargar
  useEffect(() => {
    checkConfiguration()
  }, [])

  // Comprobar si Netlify Blob está configurado correctamente
  async function checkConfiguration() {
    setStatus(ConfigStatus.CHECKING)
    try {
      // Intentar obtener un store para verificar configuración
      const store = getStore("config-test")
      // Intentar un ping básico
      await store.get("ping-test")
      
      setStatus(ConfigStatus.CONFIGURED)
      setErrorMessage("")
    } catch (error) {
      console.error("Error checking Netlify Blob configuration:", error)
      setStatus(ConfigStatus.NOT_CONFIGURED)
      setErrorMessage(error instanceof Error ? error.message : String(error))
    }
  }

  // Guardar API key en las variables de entorno de Netlify
  async function saveApiKey() {
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Por favor, introduce una API key válida",
        variant: "destructive",
      })
      return
    }

    try {
      // Aquí normalmente enviaríamos la API key al servidor para configurarla
      // como variable de entorno en Netlify
      toast({
        title: "Información",
        description: "Para configurar la API key de Netlify Blob, debes agregarla como variable de entorno NETLIFY_BLOBS_KEY en tu plataforma de despliegue.",
      })
      
      // Verificar configuración después de intentar guardar
      await checkConfiguration()
    } catch (error) {
      console.error("Error saving API key:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la API key. Verifica tus permisos.",
        variant: "destructive",
      })
    }
  }

  // Probar la subida de un archivo de prueba
  async function testUpload() {
    setIsUploading(true)
    try {
      // Crear un archivo de prueba
      const testData = "Test file content from " + new Date().toISOString()
      const testFile = new File([testData], "test-file.txt", {
        type: "text/plain",
      })
      
      // Subir el archivo de prueba
      const url = await uploadToNetlifyBlob(testFile, {
        folder: "tests",
        filename: `test-${Date.now()}.txt`,
      })
      
      toast({
        title: "Prueba exitosa",
        description: `Archivo subido correctamente: ${url}`,
      })
    } catch (error) {
      console.error("Error testing upload:", error)
      toast({
        title: "Error en la prueba",
        description: `No se pudo subir el archivo de prueba: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Netlify Blob</CardTitle>
        <CardDescription>
          Configure el almacenamiento de Netlify Blob para las imágenes del proyecto
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium">Estado:</div>
          <div className="flex items-center">
            {status === ConfigStatus.CHECKING && (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Verificando configuración...</span>
              </>
            )}
            {status === ConfigStatus.CONFIGURED && (
              <>
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Configurado correctamente</span>
              </>
            )}
            {status === ConfigStatus.NOT_CONFIGURED && (
              <>
                <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
                <span className="text-sm text-amber-600">No configurado</span>
              </>
            )}
            {status === ConfigStatus.ERROR && (
              <>
                <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">Error de configuración</span>
              </>
            )}
          </div>
        </div>

        {status !== ConfigStatus.CONFIGURED && (
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key de Netlify Blob</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Ingresa tu API key de Netlify Blob"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Puedes obtener tu API key en la configuración de tu sitio en Netlify.
            </p>
            {errorMessage && (
              <p className="text-xs text-red-500">{errorMessage}</p>
            )}
          </div>
        )}

        {status === ConfigStatus.CONFIGURED && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Configuración exitosa</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Netlify Blob está configurado correctamente y listo para ser utilizado para el almacenamiento de imágenes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {status !== ConfigStatus.CONFIGURED ? (
          <>
            <Button variant="outline" onClick={checkConfiguration}>
              Verificar configuración
            </Button>
            <Button onClick={saveApiKey}>Guardar API Key</Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={checkConfiguration}>
              Verificar de nuevo
            </Button>
            <Button onClick={testUpload} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Probando...
                </>
              ) : (
                "Probar subida"
              )}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}