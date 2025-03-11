"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"
import Script from "next/script"

type RecaptchaContextType = {
  executeRecaptcha: (action: string) => Promise<string>
  isLoaded: boolean
}

const RecaptchaContext = createContext<RecaptchaContextType | undefined>(undefined)

export function RecaptchaProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false)

  const executeRecaptcha = async (action: string): Promise<string> => {
    if (!isLoaded || !window.grecaptcha) {
      throw new Error("reCAPTCHA no está cargado")
    }

    try {
      const token = await window.grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, { action })
      return token
    } catch (error) {
      console.error("Error al ejecutar reCAPTCHA:", error)
      throw error
    }
  }

  const handleRecaptchaLoad = () => {
    setIsLoaded(true)
  }

  return (
    <RecaptchaContext.Provider value={{ executeRecaptcha, isLoaded }}>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
        onLoad={handleRecaptchaLoad}
      />
      {children}
    </RecaptchaContext.Provider>
  )
}

export function useRecaptcha() {
  const context = useContext(RecaptchaContext)
  if (context === undefined) {
    throw new Error("useRecaptcha debe usarse dentro de un RecaptchaProvider")
  }
  return context
}

