import React from "react"
import { findTransactions } from "@/lib/transactions"

export default async function Page() {
  const list = await findTransactions(50)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Transactions (Dashboard)</h1>
      <p className="text-sm text-muted-foreground mb-4">Listado de transacciones recibidas por la API.</p>
      <div className="space-y-4">
        {Array.isArray(list) && list.length > 0 ? (
          list.map((t: any) => (
            <div key={t._id} className="border rounded p-3 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{t.contactName || t.notificationTitle || t._id}</div>
                  <div className="text-xs text-gray-500">{t.transactionType} • {t.amount} {t.currency}</div>
                </div>
                <div className="text-xs text-gray-400">{new Date(t.timestamp || 0).toLocaleString()}</div>
              </div>
              <pre className="mt-2 text-xs bg-gray-50 p-2 overflow-auto">{JSON.stringify(t, null, 2)}</pre>
            </div>
          ))
        ) : (
          <div>No transactions found</div>
        )}
      </div>
    </div>
  )
}
