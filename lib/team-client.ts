import type { TeamMember } from "@/types/team"

// Create a new team member
export async function createTeamMember(data: Partial<TeamMember>): Promise<TeamMember> {
  try {
    const response = await fetch("/api/team", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error creating team member")
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating team member:", error)
    throw error
  }
}

// Update a team member
export async function updateTeamMember(id: string, data: Partial<TeamMember>): Promise<TeamMember> {
  try {
    const response = await fetch(`/api/team/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error updating team member")
    }

    return await response.json()
  } catch (error) {
    console.error("Error updating team member:", error)
    throw error
  }
}

// Delete a team member
export async function deleteTeamMember(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/team/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error deleting team member")
    }
  } catch (error) {
    console.error("Error deleting team member:", error)
    throw error
  }
}
