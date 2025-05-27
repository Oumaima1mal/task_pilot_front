import axios from "axios"
import type { Task, CreateTaskInput, TaskPlanifiee } from "@/types/task"
import { API_CONFIG } from "./config"

// Créer une instance axios avec la configuration de base
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: API_CONFIG.HEADERS,
  timeout: API_CONFIG.TIMEOUT,
})

// Variable pour éviter les redirections multiples
let isRedirecting = false

// Intercepteur pour ajouter le token d'authentification à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log("Token ajouté à la requête:", config.url)
  }
  return config
})

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => {
    console.log("Réponse API reçue:", response.status, response.config.url)
    return response
  },
  async (error) => {
    console.error("Erreur API:", error.response?.status, error.config?.url)

    // Si l'erreur est 401 Unauthorized et qu'on n'est pas déjà en train de rediriger
    if (error.response && error.response.status === 401 && !isRedirecting) {
      console.log("Erreur 401, redirection vers login")
      isRedirecting = true
      localStorage.removeItem("access_token")

      // Utiliser setTimeout pour éviter les problèmes de navigation pendant le rendu
      setTimeout(() => {
        window.location.href = "/login"
      }, 100)
    }

    return Promise.reject(error)
  },
)

// Service pour les tâches
export const taskService = {
  // Récupérer toutes les tâches
  getAllTasks: async (): Promise<Task[]> => {
    console.log("Appel API: getAllTasks")
    try {
      const response = await api.get("/taches/")
      console.log("Tâches reçues:", response.data.length)
      return mapTasksFromApi(response.data)
    } catch (error) {
      console.error("Erreur lors de la récupération des tâches:", error)
      throw error
    }
  },

  // Récupérer les tâches terminées
  getCompletedTasks: async (): Promise<Task[]> => {
    console.log("Appel API: getCompletedTasks")
    try {
      const response = await api.get("/taches/terminees/")
      console.log("Tâches terminées reçues:", response.data.length)
      return mapTasksFromApi(response.data)
    } catch (error) {
      console.error("Erreur lors de la récupération des tâches terminées:", error)
      throw error
    }
  },

  // Créer une nouvelle tâche
  createTask: async (task: CreateTaskInput): Promise<Task> => {
    try {
      const taskData = mapTaskToApi(task)
      console.log("Données envoyées au backend pour création de tâche:", taskData)

      const response = await api.post("/taches/", taskData)
      console.log("Réponse de création de tâche:", response.data)

      return mapTaskFromApi(response.data)
    } catch (error) {
      console.error("Erreur lors de la création de la tâche:", error)

      // Améliorer la gestion d'erreur pour éviter les rechargements
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail)
      } else if (error.message) {
        throw new Error(error.message)
      } else {
        throw new Error("Erreur lors de la création de la tâche")
      }
    }
  },

  // Créer une tâche de groupe
  createGroupTask: async (groupId: string, task: CreateTaskInput): Promise<Task> => {
    try {
      const taskData = mapTaskToApi(task)
      console.log(`Création d'une tâche dans le groupe ${groupId}:`, taskData)

      const response = await api.post(`/taches/`, taskData)
      console.log("Réponse de création de tâche de groupe:", response.data)

      return mapTaskFromApi(response.data)
    } catch (error) {
      console.error("Erreur lors de la création de la tâche de groupe:", error)
      throw error
    }
  },

  // Mettre à jour une tâche
  updateTask: async (id: string, task: Partial<Task>): Promise<Task> => {
    try {
      const taskData = mapTaskToApi(task)
      console.log("Mise à jour de la tâche:", id, taskData)
      const response = await api.put(`/taches/${id}`, taskData)
      return mapTaskFromApi(response.data)
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la tâche:", error)
      throw error
    }
  },

  // Mettre à jour uniquement le statut d'une tâche
  updateTaskStatus: async (id: string, completed: boolean): Promise<Task> => {
    try {
      console.log(`Mise à jour du statut de la tâche ${id} à ${completed ? "Terminé" : "En cours"}`)

      const statusData = {
        statut: completed ? "Terminé" : "En cours",
      }

      const response = await api.put(`/taches/${id}/statut`, statusData)
      console.log("Réponse de mise à jour du statut:", response.data)
      return mapTaskFromApi(response.data)
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error)

      if (error.response && error.response.status === 404) {
        console.log("Endpoint spécifique non trouvé, utilisation de l'endpoint standard")
        const response = await api.put(`/taches/${id}`, { statut: completed ? "Terminé" : "En cours" })
        return mapTaskFromApi(response.data)
      }
      throw error
    }
  },

  // Récupérer une tâche spécifique
  getTask: async (id: string): Promise<Task> => {
    try {
      console.log("Récupération de la tâche:", id)
      const response = await api.get(`/taches/${id}`)
      return mapTaskFromApi(response.data)
    } catch (error) {
      console.error("Erreur lors de la récupération de la tâche:", error)
      throw error
    }
  },

  // Supprimer une tâche
  deleteTask: async (id: string): Promise<void> => {
    try {
      console.log("Suppression de la tâche:", id)
      await api.delete(`/taches/${id}`)
    } catch (error) {
      console.error("Erreur lors de la suppression de la tâche:", error)
      throw error
    }
  },

  // Récupérer les tâches d'un groupe
  getGroupTasks: async (groupId: string): Promise<Task[]> => {
    try {
      console.log(`Récupération des tâches du groupe ${groupId}`)
      const response = await api.get(`/groupes/${groupId}/taches`)
      console.log("Tâches du groupe reçues:", response.data)
      return mapTasksFromApi(response.data)
    } catch (error) {
      console.error("Erreur lors de la récupération des tâches du groupe:", error)
      throw error
    }
  },

  // Récupérer l'état d'avancement des membres pour une tâche
  getTaskMemberStatuses: async (groupId: string, taskTitle: string): Promise<any[]> => {
    try {
      console.log(`Récupération de l'état d'avancement des membres pour la tâche "${taskTitle}" du groupe ${groupId}`)
      const response = await api.get(`/groupe/${groupId}/tache/etat?titre=${encodeURIComponent(taskTitle)}`)
      console.log("États d'avancement reçus:", response.data)
      return response.data
    } catch (error) {
      console.error("Erreur lors de la récupération des états d'avancement:", error)
      throw error
    }
  },

  // Récupérer les tâches planifiées
  getTasksPlanifiees: async (date: Date): Promise<Task[]> => {
    try {
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

      console.log(`Récupération des tâches planifiées pour la date ${formattedDate}`)

      const response = await api.get(`/taches_planifiees/jour/?date=${formattedDate}`)
      console.log("Tâches planifiées reçues:", response.data)

      if (!response.data || response.data.length === 0) {
        console.log(`Aucune tâche planifiée trouvée pour la date ${formattedDate}`)
      }

      return mapTasksPlanifieesToTasks(response.data || [])
    } catch (error) {
      console.error("Erreur lors de la récupération des tâches planifiées:", error)
      if (error.response) {
        console.error("Détails de l'erreur:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        })
      }
      throw error
    }
  },
}

// Fonctions utilitaires pour mapper les données entre le frontend et l'API
function mapTaskToApi(task: Partial<Task> | CreateTaskInput): any {
  return {
    titre: task.title,
    description: task.description || "",
    priorite: mapPriorityToApi(task.priority),
    categorie: mapCategoryToApi(task.category),
    date_echeance: task.dueDate ? task.dueDate.toISOString() : null,
    rappel: task.reminder ? task.reminder.toISOString() : null,
    statut: task.completed ? "Terminé" : "En cours",
    groupe_id: task.groupId ? Number.parseInt(task.groupId) : null,
  }
}

function mapTaskFromApi(apiTask: any): Task {
  return {
    id: apiTask.id != null ? apiTask.id.toString() : "",
    title: apiTask.titre,
    description: apiTask.description || "",
    priority: mapPriorityFromApi(apiTask.priorite),
    category: mapCategoryFromApi(apiTask.categorie),
    dueDate: apiTask.date_echeance ? new Date(apiTask.date_echeance) : undefined,
    reminder: apiTask.rappel ? new Date(apiTask.rappel) : undefined,
    completed: apiTask.statut === "Terminé",
    createdAt: new Date(apiTask.date_creation || new Date()),
    groupId: apiTask.groupe_id != null ? apiTask.groupe_id.toString() : undefined,
    memberStatuses: apiTask.statuts_membres ? mapMemberStatusesFromApi(apiTask.statuts_membres) : undefined,
  }
}

function mapTasksPlanifieesToTasks(tasksPlanifiees: TaskPlanifiee[]): Task[] {
  return tasksPlanifiees.map((taskPlanifiee) => {
    const dateDebut = new Date(taskPlanifiee.date_debut)

    return {
      id: taskPlanifiee.id.toString(),
      title: taskPlanifiee.titre_tache,
      description: taskPlanifiee.description_tache || "",
      priority: "medium",
      category: "other",
      completed: false,
      dueDate: dateDebut,
      reminder: new Date(dateDebut.getTime() + taskPlanifiee.duree * 1000),
      createdAt: new Date(),
    }
  })
}

function mapTasksFromApi(apiTasks: any[]): Task[] {
  return apiTasks.map(mapTaskFromApi)
}

function mapPriorityToApi(priority: string | undefined): string {
  const priorityMap: Record<string, string> = {
    low: "Faible",
    medium: "Important",
    high: "Urgent",
  }
  return priority ? priorityMap[priority] || "Important" : "Important"
}

function mapPriorityFromApi(priority: string): "low" | "medium" | "high" {
  const priorityMap: Record<string, "low" | "medium" | "high"> = {
    Faible: "low",
    Important: "medium",
    Urgent: "high",
  }
  return priorityMap[priority] || "medium"
}

function mapCategoryToApi(category: string | undefined): string {
  const categoryMap: Record<string, string> = {
    work: "Travail",
    personal: "Personnel",
    shopping: "Achats",
    health: "Santé",
    other: "Autre",
  }
  return category ? categoryMap[category] || "Autre" : "Autre"
}

function mapCategoryFromApi(category: string): "work" | "personal" | "shopping" | "health" | "other" {
  const categoryMap: Record<string, "work" | "personal" | "shopping" | "health" | "other"> = {
    Travail: "work",
    Personnel: "personal",
    Achats: "shopping",
    Santé: "health",
    Autre: "other",
  }
  return categoryMap[category] || "other"
}

function mapMemberStatusesFromApi(memberStatuses: any[]): any[] {
  return memberStatuses.map((ms) => ({
    userId: ms.utilisateur_id.toString(),
    status: ms.statut,
    updatedAt: new Date(ms.date_mise_a_jour),
  }))
}

export default api
