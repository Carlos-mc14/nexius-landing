// Validar que las variables de entorno necesarias estén definidas
const validateTrelloEnv = () => {
    const requiredVars = ['TRELLO_API_KEY', 'TRELLO_TOKEN', 'TRELLO_BOARD_ID'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.warn(`⚠️ Variables de entorno faltantes para Trello: ${missingVars.join(', ')}`);
      return false;
    }
    return true;
  };
  
  // Función para obtener proyectos desde Trello
  export async function getTrelloProjects() {
    try {
      // Verificar si estamos en modo de desarrollo o si faltan variables de entorno
      if (process.env.NODE_ENV === 'development' && !validateTrelloEnv()) {
        console.info('🔍 Usando datos simulados para Trello en desarrollo');
        return getMockTrelloProjects();
      }
      
      // Obtener variables de entorno
      const apiKey = process.env.TRELLO_API_KEY;
      const token = process.env.TRELLO_TOKEN;
      const boardId = process.env.TRELLO_BOARD_ID;
      
      // Verificar nuevamente que todas las variables estén disponibles
      if (!apiKey || !token || !boardId) {
        console.warn('⚠️ Faltan variables de entorno para Trello, usando datos simulados');
        return getMockTrelloProjects();
      }
      
      // Realizar la petición a la API de Trello
      const response = await fetch(
        `https://api.trello.com/1/boards/${boardId}/cards?key=${apiKey}&token=${token}&fields=name,desc,due,labels,idMembers&members=true&member_fields=fullName,initials&checklists=all`,
        { next: { revalidate: 3600 } } // Revalidar datos cada hora
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error en la API de Trello: ${response.status} - ${errorText}`);
      }
      
      const cards = await response.json();
      
      // Transformar los datos de Trello al formato que espera nuestra aplicación
      return cards.map((card: any) => {
        // Calcular el progreso basado en checklists completados
        let totalItems = 0;
        let completedItems = 0;
        
        if (card.checklists && card.checklists.length > 0) {
          card.checklists.forEach((checklist: any) => {
            totalItems += checklist.checkItems.length;
            completedItems += checklist.checkItems.filter((item: any) => item.state === 'complete').length;
          });
        }
        
        const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
        
        // Determinar el estado basado en etiquetas o fecha de vencimiento
        let status = 'En Progreso';
        if (card.labels && card.labels.some((label: any) => label.name.toLowerCase().includes('completado'))) {
          status = 'Completado';
        } else if (card.due && new Date(card.due) < new Date()) {
          status = 'Retrasado';
        }
        
        // Extraer URLs de repositorio y demo del texto de la descripción
        const repoUrlMatch = card.desc?.match(/repo(?:sitorio)?:\s*(https?:\/\/[^\s]+)/i);
        const demoUrlMatch = card.desc?.match(/demo:\s*(https?:\/\/[^\s]+)/i);
        
        return {
          id: card.id,
          name: card.name,
          description: card.desc,
          status,
          progress,
          dueDate: card.due,
          labels: card.labels || [],
          members: card.members || [],
          repoUrl: repoUrlMatch ? repoUrlMatch[1] : null,
          demoUrl: demoUrlMatch ? demoUrlMatch[1] : null
        };
      });
      
    } catch (error) {
      console.error("Error fetching Trello projects:", error);
      // Fallback a datos simulados en caso de error
      return getMockTrelloProjects();
    }
  }
  
  // Datos simulados para el ejemplo o desarrollo
  function getMockTrelloProjects() {
    return [
      {
        id: "card1",
        name: "Sistema de Reservas Hotel Miraflores",
        description: "Desarrollo de plataforma de gestión hotelera con módulos de reservas, check-in/out y facturación.",
        status: "En Progreso",
        progress: 75,
        dueDate: "2023-12-15",
        labels: [
          { id: "label1", name: "Frontend", color: "#61bd4f" },
          { id: "label2", name: "Backend", color: "#0079bf" },
          { id: "label3", name: "Alta Prioridad", color: "#eb5a46" }
        ],
        members: [
          { id: "member1", fullName: "Carlos Mori", initials: "CM" },
          { id: "member2", fullName: "Melanie Távara", initials: "MT" }
        ],
        repoUrl: "https://github.com/nexius/hotel-miraflores",
        demoUrl: "https://demo.nexius.lat/hotel-miraflores"
      },
      {
        id: "card2",
        name: "App de Delivery El Sabor",
        description: "Aplicación móvil para pedidos a domicilio con seguimiento en tiempo real e integración con pasarela de pagos.",
        status: "En Progreso",
        progress: 40,
        dueDate: "2024-01-20",
        labels: [
          { id: "label4", name: "Mobile", color: "#ff9f1a" },
          { id: "label5", name: "API", color: "#0079bf" }
        ],
        members: [
          { id: "member1", fullName: "Carlos Mori", initials: "CM" }
        ],
        repoUrl: "https://github.com/nexius/el-sabor-app",
        demoUrl: null
      },
      {
        id: "card3",
        name: "E-commerce ModoFashion",
        description: "Tienda online con catálogo de productos, carrito de compras y gestión de inventario automatizada.",
        status: "Completado",
        progress: 100,
        dueDate: "2023-11-30",
        labels: [
          { id: "label1", name: "Frontend", color: "#61bd4f" },
          { id: "label2", name: "Backend", color: "#0079bf" }
        ],
        members: [
          { id: "member1", fullName: "Carlos Mori", initials: "CM" },
          { id: "member2", fullName: "Melanie Távara", initials: "MT" }
        ],
        repoUrl: "https://github.com/nexius/modofashion",
        demoUrl: "https://modofashion.com"
      }
    ]
  }
  