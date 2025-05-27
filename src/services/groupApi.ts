import axios from "axios"
import type { Group, User, CreateGroupInput , GroupMember} from "@/types/group"
import { API_CONFIG } from "./config"

// Créer une instance axios avec la configuration de base
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: API_CONFIG.HEADERS,
  timeout: API_CONFIG.TIMEOUT,
})

// Intercepteur pour ajouter le token d'authentification à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log("Token ajouté à la requête:", config.url)
  }
  return config
})

// Intercepteur pour gérer les réponses
api.interceptors.response.use(
  (response) => {
    console.log(`Réponse ${response.config.url}:`, response.status, response.data)
    return response
  },
  (error) => {
    console.error("Erreur API:", error.response?.status, error.config?.url)
    if (error.response) {
      console.error("Données d'erreur:", error.response.data)
    }
    return Promise.reject(error)
  },
)

// Service pour les groupes
export const groupService = {
  // Récupérer tous les groupes
  getAllGroups: async (): Promise<Group[]> => {
    try {
      console.log("Récupération de tous les groupes")
      const response = await api.get("/groupes/")
      console.log("Groupes reçus:", response.data)
      return mapGroupsFromApi(response.data)
    } catch (error) {
      console.error("Erreur lors de la récupération des groupes:", error)
      throw error
    }
  },

  // Créer un nouveau groupe
  createGroup: async (group: CreateGroupInput): Promise<Group> => {
    try {
      console.log("Création d'un groupe avec les données:", group)
      const groupData = mapGroupToApi(group)
      console.log("Données mappées pour l'API:", groupData)

      const response = await api.post("/groupes/", groupData)
      console.log("Réponse de création de groupe:", response.data)

      return mapGroupFromApi(response.data)
    } catch (error) {
      console.error("Erreur lors de la création du groupe:", error)
      throw error
    }
  },

  // Mettre à jour un groupe
  updateGroup: async (id: string, group: Partial<Group>): Promise<Group> => {
    try {
      console.log(`Mise à jour du groupe ${id} avec les données:`, group)
      const groupData = mapGroupToApi(group)
      const response = await api.put(`/groupes/${id}`, groupData)
      return mapGroupFromApi(response.data)
    } catch (error) {
      console.error("Erreur lors de la mise à jour du groupe:", error)
      throw error
    }
  },

  // Supprimer un groupe
  deleteGroup: async (id: string): Promise<void> => {
    try {
      console.log(`Suppression du groupe ${id}`)
      await api.delete(`/groupes/${id}`)
    } catch (error) {
      console.error("Erreur lors de la suppression du groupe:", error)
      throw error
    }
  },

  // Ajouter un utilisateur à un groupe
 addUserToGroup: async (groupId: string, userId: string): Promise<void> => {
    try {
      console.log(`Ajout de l'utilisateur ${userId} au groupe ${groupId}`)
      
      await api.post("/groupes/ajouter-membre", {
        utilisateur_id: Number.parseInt(userId),
        groupe_id: Number.parseInt(groupId),
        role: "Membre" // <-- fixe ou dynamique si besoin
      })
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'utilisateur au groupe:", error)
      throw error
    }
  },
  

  // Supprimer un utilisateur d'un groupe
  removeUserFromGroup: async (groupId: string, userId: string): Promise<void> => {
    try {
      console.log(`Suppression de l'utilisateur ${userId} du groupe ${groupId}`)
      await api.delete(`/groupes/${groupId}/membres/${userId}`)
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur du groupe:", error)
      throw error
    }
  },

  // Récupérer tous les utilisateurs
  getAllUsers: async (): Promise<User[]> => {
    try {
      console.log("Récupération de tous les utilisateurs")
      const response = await api.get("/utilisateurs/")
      console.log("Utilisateurs reçus:", response.data)
      return mapUsersFromApi(response.data)
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error)
      throw error
    }
  },

  // Récupérer les tâches d'un groupe
  getGroupTasks: async (groupId: string): Promise<any[]> => {
    try {
      console.log(`Récupération des tâches du groupe ${groupId}`)
      const response = await api.get(`/groupes/${groupId}/taches`)
      console.log("Tâches du groupe reçues:", response.data)
      return response.data
    } catch (error) {
      console.error("Erreur lors de la récupération des tâches du groupe:", error)
      throw error
    }
  },
  // Récupérer les membres d'un groupe (avec rôle)
  getGroupMembers: async (groupId: string): Promise<GroupMember[]> => {
    try {
      console.log(`Récupération des membres du groupe ${groupId}`)
      const response = await api.get(`/groupes/${groupId}/membres`)
      console.log("Membres du groupe reçus:", response.data)

      return response.data.map((m: any) => ({
        id: m.id.toString(),
        nom: m.nom,
        prenom: m.prenom,
        email: m.email,
        tel: m.tel,
        date_creation: m.date_creation,
        role: m.role,
      }))
    } catch (error) {
      console.error("Erreur lors de la récupération des membres du groupe:", error)
      throw error
    }
  },
}



// Fonctions utilitaires pour mapper les données entre le frontend et l'API
function mapGroupToApi(group: Partial<Group> | CreateGroupInput): any {
  return {
    nom: group.name,
    description: group.description || "",
  }
}

function mapGroupFromApi(apiGroup: any): Group {
  return {
    id: apiGroup.id.toString(),
    name: apiGroup.nom,
    description: apiGroup.description || "",
    createdAt: new Date(apiGroup.date_creation),
    createdBy: apiGroup.createur_id ? apiGroup.createur_id.toString() : "1",
    members: apiGroup.membres ? mapUsersFromApi(apiGroup.membres) : [],
  }
}

function mapGroupsFromApi(apiGroups: any[]): Group[] {
  return apiGroups.map(mapGroupFromApi)
}

function mapUserFromApi(apiUser: any): User {
  return {
    id: apiUser.id.toString(),
    name: apiUser.prenom && apiUser.nom ? `${apiUser.prenom} ${apiUser.nom}` : apiUser.email || "Utilisateur",
    email: apiUser.email,
    avatar: apiUser.avatar || undefined,
  }
}

function mapUsersFromApi(apiUsers: any[]): User[] {
  return apiUsers.map(mapUserFromApi)
}

export default api
