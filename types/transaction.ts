export type TransactionRecord = {
  _id: string
  timestamp: number
  date?: string
  transactionType?: string
  amount: number
  currency?: string
  contactName?: string
  contactPhone?: string
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
