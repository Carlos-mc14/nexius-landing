// Client-side functions for project management

export async function createProject(data: any): Promise<any> {
  try {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error creating project")
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating project:", error)
    throw error
  }
}

export async function updateProject(id: string, data: any): Promise<any> {
  try {
    const response = await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error updating project")
    }

    return await response.json()
  } catch (error) {
    console.error("Error updating project:", error)
    throw error
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/projects/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error deleting project")
    }
  } catch (error) {
    console.error("Error deleting project:", error)
    throw error
  }
}

export async function getProjectById(id: string): Promise<any> {
  try {
    const response = await fetch(`/api/projects/${id}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error fetching project")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching project:", error)
    throw error
  }
}
