// Authentication functions for the client

// Login
export async function login(email: string, password: string) {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })
  
      const data = await response.json()
  
      if (!response.ok) {
        return {
          success: false,
          error: data.error || "Error al iniciar sesión",
        }
      }
  
      return {
        success: true,
        user: data.user,
      }
    } catch (error) {
      console.error("Error in login:", error)
      return {
        success: false,
        error: "Error de conexión",
      }
    }
  }
  
  // Logout
  export async function logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
      return true
    } catch (error) {
      console.error("Error in logout:", error)
      return false
    }
  }
  
  // Check session
  export async function checkSession() {
    try {
      const response = await fetch("/api/auth/session")
      const data = await response.json()
  
      return {
        authenticated: data.authenticated,
        user: data.user,
      }
    } catch (error) {
      console.error("Error checking session:", error)
      return {
        authenticated: false,
      }
    }
  }
  
  // Get current user with permissions
  export async function getCurrentUser() {
    try {
      const response = await fetch("/api/auth/me")
      const data = await response.json()
  
      if (!data.authenticated) {
        return null
      }
  
      return data.user
    } catch (error) {
      console.error("Error getting current user:", error)
      return null
    }
  }
  
  // Check if user has permission
  export async function hasPermission(permission: string): Promise<boolean> {
    try {
      const response = await fetch("/api/permissions/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ permission }),
      })
  
      if (!response.ok) {
        return false
      }
  
      const data = await response.json()
      return data.hasPermission
    } catch (error) {
      console.error("Error checking permission:", error)
      return false
    }
  }
  
  // Change password
  export async function changePassword(currentPassword: string, newPassword: string) {
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
  
      const data = await response.json()
  
      if (!response.ok) {
        throw new Error(data.error || "Error al cambiar la contraseña")
      }
  
      return true
    } catch (error) {
      console.error("Error changing password:", error)
      throw error
    }
  }
  