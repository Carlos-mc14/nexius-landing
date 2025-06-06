import type React from "react"
import { WhatsAppProvider } from "@/components/whatsapp/whatsapp-provider"

export default function WhatsAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WhatsAppProvider>
      <div className="space-y-6">{children}</div>
    </WhatsAppProvider>
  )
}
