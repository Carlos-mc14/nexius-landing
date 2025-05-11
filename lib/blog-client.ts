// Client-side functions for blog posts

// Create a new blog post
export async function createBlogPost(data: any): Promise<any> {
  try {
    const response = await fetch("/api/blog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error creating blog post")
    }

    return response.json()
  } catch (error) {
    console.error("Error creating blog post:", error)
    throw error
  }
}

// Update a blog post
export async function updateBlogPost(id: string, data: any): Promise<any> {
  try {
    const response = await fetch(`/api/blog/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error updating blog post")
    }

    return response.json()
  } catch (error) {
    console.error(`Error updating blog post with ID ${id}:`, error)
    throw error
  }
}

// Delete a blog post
export async function deleteBlogPost(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/blog/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error deleting blog post")
    }
  } catch (error) {
    console.error(`Error deleting blog post with ID ${id}:`, error)
    throw error
  }
}

// Get blog posts
export async function getBlogPosts(): Promise<any[]> {
  try {
    const response = await fetch("/api/blog")

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error fetching blog posts")
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    throw error
  }
}

// Get blog post by ID
export async function getBlogPostById(id: string): Promise<any> {
  try {
    const response = await fetch(`/api/blog/${id}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error fetching blog post")
    }

    return response.json()
  } catch (error) {
    console.error(`Error fetching blog post with ID ${id}:`, error)
    throw error
  }
}
