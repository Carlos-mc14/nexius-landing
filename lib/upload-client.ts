// Client-side functions for file uploads

export async function uploadImage(file: File, folder: string): Promise<string> {
  try {
    // Create a FormData object to send the file
    const formData = new FormData()
    formData.append("file", file)

    // Send the file to our API endpoint
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      // Try to parse error as JSON
      const text = await response.text()
      let errorMessage

      try {
        const errorData = JSON.parse(text)
        errorMessage = errorData.error || "Error uploading image"
      } catch (e) {
        errorMessage = `Server error: ${response.status}. Response was not JSON.`
        console.error("Non-JSON response:", text.substring(0, 200) + "...")
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()
    return data.url
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}
