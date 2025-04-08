// Client-side functions for homepage content management

export async function updateHomepageSection(section: string, data: any) {
  try {
    console.log(`Updating homepage section: ${section}`, data)

    const response = await fetch(`/api/homepage/${section}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    console.log(`Response status for ${section}:`, response.status)

    if (!response.ok) {
      // Try to parse error as JSON, but handle case where it's not JSON
      const text = await response.text()
      let errorMessage

      try {
        const errorData = JSON.parse(text)
        errorMessage = errorData.error || `Error updating ${section} section`
      } catch (e) {
        // If parsing fails, use the text directly (might be HTML)
        errorMessage = `Server error: ${response.status}. Response was not JSON.`
        console.error("Non-JSON response:", text.substring(0, 200) + "...")
      }

      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error updating ${section} section:`, error)
    throw error
  }
}
