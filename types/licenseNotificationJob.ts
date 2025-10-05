export interface LicenseJobLicenseLine {
  licenseId: string
  service: string
  notifyType: string
  amount: number
  lateFee: number
  lineTotal: number
  endDate: string
  updateStatus?: boolean
  newStatus?: string
}

export interface LicenseNotificationJob {
  _id?: string
  rucOrDni: string
  companyName: string
  phoneNumber?: string
  email?: string
  licenseIds: string[]
  licenses: LicenseJobLicenseLine[]
  severity: string
  severityScore: number
  totalBase: number
  totalLate: number
  totalDue: number
  message: string
  status: 'pending' | 'sent' | 'failed'
  attempts: number
  hash: string
  scheduledAt?: string | null
  sentAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface LicenseNotificationLog {
  _id?: string
  jobId?: string
  rucOrDni: string
  licenseIds: string[]
  severity: string
  totalDue: number
  messageLength: number
  conversationId?: string
  sentAt: string
  createdAt?: string
}
