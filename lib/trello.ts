// Función para obtener proyectos desde Trello
export async function getTrelloProjects() {
  try {
    // Obtener variables de entorno
    const apiKey = process.env.TRELLO_API_KEY
    const token = process.env.TRELLO_TOKEN
    const boardId = process.env.TRELLO_BOARD_ID

    // Verificar nuevamente que todas las variables estén disponibles
    if (!apiKey || !token || !boardId) {
      console.warn("Something went wrong with Trello API")
    }

    // Realizar la petición a la API de Trello
    const response = await fetch(
      `https://api.trello.com/1/boards/${boardId}/cards?key=${apiKey}&token=${token}&fields=name,desc,due,labels,idMembers&members=true&member_fields=fullName,initials&checklists=all`,
      { next: { revalidate: 3600 } }, // Revalidar datos cada hora
    )

    if (!response.ok) {
      throw new Error(`Error en la API de Trello: ${response.status}`)
    }

    const cards = await response.json()

    // Transformar los datos de Trello al formato que espera nuestra aplicación
    return cards.map((card: any) => {
      // Calcular el progreso basado en checklists completados
      let totalItems = 0
      let completedItems = 0

      if (card.checklists && card.checklists.length > 0) {
        card.checklists.forEach((checklist: any) => {
          if (checklist.checkItems && checklist.checkItems.length > 0) {
            totalItems += checklist.checkItems.length
            completedItems += checklist.checkItems.filter((item: any) => item.state === "complete").length
          }
        })
      }

      const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

      // Determinar el estado basado en etiquetas, fecha de vencimiento o progreso de checklist
      let status = "En Progreso"

      // Verificar si tiene etiqueta de completado
      const hasCompletedLabel =
        card.labels &&
        card.labels.some(
          (label: any) =>
            label.name.toLowerCase().includes("completado") ||
            label.name.toLowerCase().includes("completo") ||
            label.name.toLowerCase().includes("completed") ||
            label.name.toLowerCase() === "done",
        )

      // Verificar si todos los elementos de checklist están completados
      //const hasAllChecklistItemsComplete = totalItems > 0 && completedItems === totalItems

      // Marcar como completado si tiene etiqueta de completado o todos los items de checklist están completos
      //if (hasCompletedLabel || hasAllChecklistItemsComplete) {
      if (hasCompletedLabel) {
        status = "Completado"
      } else if (card.due && new Date(card.due) < new Date()) {
        status = "Retrasado"
      }

      // Extraer URLs de repositorio y demo del texto de la descripción usando expresiones regulares
      // Buscar enlaces en formato markdown: [texto](url)
      const repoUrlMatch = card.desc?.match(/[Rr]epo(?:sitorio)?:?\s*\[(?:[^\]]+)\]([^)]+)/i)
      const demoUrlMatch = card.desc?.match(/[Dd]emo:?\s*\[(?:[^\]]+)\]([^)]+)/i)

      // Si no encuentra en formato markdown, buscar URLs directas
      const fallbackRepoMatch = !repoUrlMatch && card.desc?.match(/[Rr]epo(?:sitorio)?:?\s*(https?:\/\/[^\s\n]+)/i)
      const fallbackDemoMatch = !demoUrlMatch && card.desc?.match(/[Dd]emo:?\s*(https?:\/\/[^\s\n]+)/i)

      return {
        id: card.id,
        name: card.name,
        description: card.desc?.split("\n\n")[0] || "", // Tomar solo el primer párrafo como descripción
        status,
        progress,
        dueDate: card.due,
        labels: card.labels || [],
        members: card.members || [],
        repoUrl: repoUrlMatch ? repoUrlMatch[1] : fallbackRepoMatch ? fallbackRepoMatch[1] : null,
        demoUrl: demoUrlMatch ? demoUrlMatch[1] : fallbackDemoMatch ? fallbackDemoMatch[1] : null,
      }
    })
  } catch (error) {
    console.error("Error fetching Trello projects:", error)
  }
}

