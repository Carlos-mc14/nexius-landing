import React from "react"
import { findTransactions } from "@/lib/transactions"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"

export default async function Page() {
  const list = await findTransactions(50)

  const typeColor = (type: string) => {
    if (!type) return 'secondary'
    if (type.toLowerCase().includes('payment')) return 'default'
    if (type.toLowerCase().includes('license')) return 'outline'
    return 'secondary'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Transacciones</h1>
        <p className="text-muted-foreground text-sm">Listado de transacciones recibidas por la API y procesos internos.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-4 w-4" /> Últimas ({list.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Array.isArray(list) && list.length > 0 ? (
            <div className="space-y-4">
              {list.map((t: any) => (
                <div key={t._id} className="rounded-lg border p-4 bg-background/60 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-medium leading-none break-all">{t.contactName || t.notificationTitle || t._id}</div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant={typeColor(t.transactionType) as any}>{t.transactionType || '—'}</Badge>
                        {t.amount && <span>{t.amount} {t.currency}</span>}
                        {t.licenseKey && <span className="font-mono">Lic: {t.licenseKey}</span>}
                        {t.licenseId && <span className="font-mono">ID: {t.licenseId}</span>}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">{new Date(t.timestamp || 0).toLocaleString()}</div>
                  </div>
                  <details className="mt-3 group">
                    <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                      <span className="group-open:rotate-90 transition-transform">▶</span>
                      Ver detalles JSON
                    </summary>
                    <ScrollArea className="mt-2 max-h-96 rounded-md border bg-muted/30 p-3">
                      <pre className="text-[10px] leading-relaxed">{JSON.stringify(t, null, 2)}</pre>
                    </ScrollArea>
                  </details>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No hay transacciones registradas.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
