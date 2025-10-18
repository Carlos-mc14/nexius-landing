export type BillingFrequency = "monthly" | "annual"

export type PaymentStatus = "paid" | "pending" | "overdue" | "cancelled"

export type PaymentMethod = "transfer" | "yape" | "plin" | "card" | "cash" | "other"

// Scheduling modes for automatic next payment calculations
// manual: uses startDate/endDate logic + frequency as before
// monthly_first: always due the 1st day of each month
// annual_jan5: always due every January 5th
export type ScheduleMode = "manual" | "monthly_first" | "annual_jan5"

export interface LicensePaymentRecord {
  _id?: string
  amount: number
  currency?: string
  paidAt: string // ISO date when the payment was confirmed
  method?: PaymentMethod | string
  // Optional coverage window this payment corresponds to
  periodStart?: string
  periodEnd?: string
  notes?: string
  createdAt?: string
  transactionId?: string
  // Portion of the payment that covered accumulated late fees (if any)
  lateFeePortion?: number
}

export type LicenseChargeType = "proration" | "late_fee"

export interface LicenseChargeRecord {
  _id?: string
  type: LicenseChargeType
  periodKey: string
  amount: number
  description?: string
  appliedAt: string
  periodStart?: string
  periodEnd?: string
  metadata?: Record<string, any>
}

export interface LicenseRecord {
  _id?: string
  licenseKey: string
  userId?: string
  // RUC or DNI
  rucOrDni?: string
  companyName: string
  // Contact information
  phoneNumber?: string
  email?: string
  amount: number
  currency?: string
  frequency: BillingFrequency
  domain?: string
  serviceType?: string
  // payment status and method
  status?: PaymentStatus
  paymentMethod?: PaymentMethod | string
  // Scheduling mode (optional, defaults to manual)
  scheduleMode?: ScheduleMode
  // dates
  startDate?: string // ISO
  endDate?: string // ISO
  // auto-renewal
  autoRenew?: boolean
  nextPaymentDue?: string
  paidAt?: string
  gracePeriodDays?: number
  notes?: string
  // Payment history (embedded for now)
  paymentHistory?: LicensePaymentRecord[]
  lastTransactionId?: string
  // Payment intent (for external mobile payment confirmation flows)
  currentPaymentCode?: string // short alphanumeric code user sends back or appears in Yape notification
  currentPaymentCodeExpiresAt?: string
  paymentVerificationState?: 'idle' | 'awaiting' | 'verifying' | 'verified'
  createdAt?: string
  updatedAt?: string
  // Late fee handling
  lateFeeAmount?: number
  lateFeePercentage?: number
  outstandingBalance?: number
  chargesHistory?: LicenseChargeRecord[]
  // Snapshot of current proration when schedule is automatic
  proratedAmountDue?: number
  proratedDays?: number
  billingCycleDays?: number
}
