export type BillingFrequency = "monthly" | "annual"

export type PaymentStatus = "paid" | "pending" | "overdue" | "cancelled"

export type PaymentMethod = "transfer" | "yape" | "plin" | "card" | "cash" | "other"

export interface LicenseRecord {
  _id?: string
  licenseKey: string
  userId?: string
  // RUC or DNI
  rucOrDni?: string
  companyName: string
  amount: number
  currency?: string
  frequency: BillingFrequency
  domain?: string
  serviceType?: string
  // payment status and method
  status?: PaymentStatus
  paymentMethod?: PaymentMethod | string
  // dates
  startDate?: string // ISO
  endDate?: string // ISO
  // auto-renewal
  autoRenew?: boolean
  nextPaymentDue?: string
  paidAt?: string
  gracePeriodDays?: number
  notes?: string
  createdAt?: string
  updatedAt?: string
}
