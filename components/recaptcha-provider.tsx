'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import Script from 'next/script'

// Definir el tipo para el contexto
type RecaptchaContextType = {
  executeRecaptcha: (action: string) => Promise<string>
  isLoaded: boolean
}

// Crear el contexto
const RecaptchaContext = createContext<RecaptchaContextType | undefined>(undefined)

// Declarar el tipo para window.grecaptcha
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

export function RecaptchaProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false)
  useEffect(() => {
    if (window.grecaptcha) {
      window.grecaptcha.ready(() => {
        setIsLoaded(true)
      })
    }
  }, [])
  
  // Función para ejecutar reCAPTCHA
  const executeRecaptcha = async (action: string): Promise<string> => {
    if (!isLoaded || !window.grecaptcha) {
      throw new Error('reCAPTCHA no está cargado')
    }

    try {
      // Asegurarse de que grecaptcha esté listo
      return new Promise((resolve) => {
        window.grecaptcha.ready(async () => {
          const token = await window.grecaptcha.execute(
            process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
            { action }
          )
          resolve(token)
        })
      })
    } catch (error) {
      console.error('Error al ejecutar reCAPTCHA:', error)
      throw error
    }
  }

  // Manejar la carga del script de reCAPTCHA
  const handleRecaptchaLoad = () => {
    window.grecaptcha.ready(() => {
      setIsLoaded(true)
    })
  }

  return (
    <RecaptchaContext.Provider value={{ executeRecaptcha, isLoaded }}>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
        onLoad={handleRecaptchaLoad}
        strategy="afterInteractive"
      />
      {children}
    </RecaptchaContext.Provider>
  )
}

// Hook personalizado para usar reCAPTCHA
export function useRecaptcha() {
  const context = useContext(RecaptchaContext)
  if (context === undefined) {
    throw new Error('useRecaptcha debe usarse dentro de un RecaptchaProvider')
  }
  return context
}