export interface TransactionProduct {
  name: string
  quantity?: number
  unitPrice?: number
  unit_price?: number
  code?: string
  description?: string
}

export type TransactionRecord = {
  _id: string
  timestamp: number
  date?: string
  transactionType?: string
  amount: number
  currency?: string
  contactName?: string
  contactPhone?: string
  contactEmail?: string
  contactDocument?: string
  productName?: string
  products?: TransactionProduct[]
  // Yape / mobile payment specific enrichment
  yapeCode?: string // confirmation code extracted from notification
  payerNormalizedName?: string // normalized uppercase no-accents
  licenseId?: string // direct link if inferred
  licenseKey?: string
  message?: string
  notificationTitle?: string
  notificationText?: string
  notificationBigText?: string
  packageName?: string
  deviceId?: string
  appVersion?: string
  createdAt?: string
  updatedAt?: string
}
