// Client-side functions for promotions

// Create a new promotion
export async function createPromotion(data: any): Promise<any> {
  try {
    const response = await fetch("/api/promotions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error creating promotion")
    }

    return response.json()
  } catch (error) {
    console.error("Error creating promotion:", error)
    throw error
  }
}

// Update a promotion
export async function updatePromotion(id: string, data: any): Promise<any> {
  try {
    const response = await fetch(`/api/promotions/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error updating promotion")
    }

    return response.json()
  } catch (error) {
    console.error(`Error updating promotion with ID ${id}:`, error)
    throw error
  }
}

// Delete a promotion
export async function deletePromotion(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/promotions/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error deleting promotion")
    }
  } catch (error) {
    console.error(`Error deleting promotion with ID ${id}:`, error)
    throw error
  }
}

// Get promotions
export async function getPromotions(): Promise<any[]> {
  try {
    const response = await fetch("/api/promotions")

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error fetching promotions")
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching promotions:", error)
    throw error
  }
}

// Get promotion by ID
export async function getPromotionById(id: string): Promise<any> {
  try {
    const response = await fetch(`/api/promotions/${id}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error fetching promotion")
    }

    return response.json()
  } catch (error) {
    console.error(`Error fetching promotion with ID ${id}:`, error)
    throw error
  }
}

// Generate WhatsApp message for promotion
export function generateWhatsAppMessage(promotion: any): string {
  const message = `¡Hola! Me interesa la promoción "${promotion.title}" (ID: ${promotion.promotionId}). 

${promotion.description}

¿Podrían darme más información?`

  return encodeURIComponent(message)
}

// Generate WhatsApp URL
export function generateWhatsAppURL(promotion: any, phoneNumber = "+51973648613"): string {
  const message = generateWhatsAppMessage(promotion)
  return `https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}?text=${message}`
}

// Helper functions to avoid server-side imports in client components
// Helper function to check if promotion is valid (within date range and has stock)
export function isPromotionValid(promotion: any): boolean {
  const now = new Date()
  const startDate = new Date(promotion.startDate)
  const endDate = new Date(promotion.endDate)

  return promotion.status === "active" && now >= startDate && now <= endDate && promotion.stock > 0
}

// Helper function to get time remaining for a promotion
export function getTimeRemaining(endDate: string | Date): {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
} {
  const end = new Date(endDate).getTime()
  const now = new Date().getTime()
  const total = end - now

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
  }

  const days = Math.floor(total / (1000 * 60 * 60 * 24))
  const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((total % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds, total }
}
