// Client-side functions for user management

export async function createUser(data: any): Promise<any> {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error creating user")
      }
  
      return await response.json()
    } catch (error) {
      console.error("Error creating user:", error)
      throw error
    }
  }
  
  export async function updateUser(id: string, data: any): Promise<any> {
    try {
      console.log("Updating user with ID:", id, "Data:", data)
  
      const response = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
  
      // Log the response status
      console.log("Response status:", response.status)
  
      // Check if response is not ok
      if (!response.ok) {
        // Try to parse error as JSON, but handle case where it's not JSON
        const text = await response.text()
        let errorMessage
  
        try {
          const errorData = JSON.parse(text)
          errorMessage = errorData.error || "Error updating user"
        } catch (e) {
          // If parsing fails, use the text directly (might be HTML)
          errorMessage = `Server error: ${response.status}. Response was not JSON.`
          console.error("Non-JSON response:", text.substring(0, 200) + "...")
        }
  
        throw new Error(errorMessage)
      }
  
      return await response.json()
    } catch (error) {
      console.error("Error updating user:", error)
      throw error
    }
  }
  
  export async function deleteUser(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      })
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error deleting user")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      throw error
    }
  }
  