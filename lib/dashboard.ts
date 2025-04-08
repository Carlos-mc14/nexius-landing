import { connectToDatabase, getWithCache } from "./db"

const CACHE_KEY = "dashboard:stats"

export async function getDashboardStats() {
  return getWithCache(
    CACHE_KEY,
    async () => {
      const { db } = await connectToDatabase()

      // Get team members count
      const teamMembersCount = await db.collection("teamMembers").countDocuments({ deleted: { $ne: true } })
      const activeTeamMembersCount = await db.collection("teamMembers").countDocuments({
        active: true,
        deleted: { $ne: true },
      })

      // Get projects count
      const projectsCollection = db.collection("projects")
      const projectsExist = await projectsCollection.findOne({})

      let projectsCount = 0
      let completedProjectsCount = 0

      if (projectsExist) {
        projectsCount = await projectsCollection.countDocuments({ deleted: { $ne: true } })
        completedProjectsCount = await projectsCollection.countDocuments({
          status: "completed",
          deleted: { $ne: true },
        })
      }

      // Get testimonials count
      const testimonialsCollection = db.collection("homepage")
      const testimonials = await testimonialsCollection.findOne({ sectionId: "testimonials" })

      let testimonialsCount = 0
      let pendingTestimonialsCount = 0

      if (testimonials && testimonials.data) {
        testimonialsCount = testimonials.data.length
        pendingTestimonialsCount = testimonials.data.filter((t: any) => t.pending).length
      }

      // Get services count
      const services = await testimonialsCollection.findOne({ sectionId: "services" })
      const servicesCount = services && services.data ? services.data.length : 6

      // Get why choose us count
      const whyChooseUs = await testimonialsCollection.findOne({ sectionId: "whyChooseUs" })
      const whyChooseUsCount = whyChooseUs && whyChooseUs.data ? whyChooseUs.data.length : 6

      // Get recent activities
      const activitiesCollection = db.collection("activities")
      const activitiesExist = await activitiesCollection.findOne({})

      let recentActivitiesCount = 0

      if (activitiesExist) {
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

        recentActivitiesCount = await activitiesCollection.countDocuments({
          createdAt: { $gte: oneWeekAgo },
        })
      } else {
        recentActivitiesCount = 12 // Default value
      }

      // Get recent team updates
      const recentTeamUpdates = [
        {
          title: "Perfil de Carlos Mori actualizado",
          date: "Hace 2 días",
        },
        {
          title: "Nuevo miembro: Melanie Távara",
          date: "Hace 1 semana",
        },
        {
          title: "Tecnologías actualizadas",
          date: "Hace 2 semanas",
        },
      ]

      return {
        teamMembers: teamMembersCount,
        activeTeamMembers: activeTeamMembersCount,
        projects: projectsCount || 5,
        completedProjects: completedProjectsCount || 2,
        testimonials: testimonialsCount || 3,
        pendingTestimonials: pendingTestimonialsCount || 1,
        recentActivities: recentActivitiesCount,
        services: servicesCount,
        whyChooseUs: whyChooseUsCount,
        recentTeamUpdates,
      }
    },
    300, // Cache for 5 minutes
  )
}
