import axios from "axios"
import { API_CONFIG } from "./config"
import logger from "@/utils/logger"

// Interface pour les données d'authentification
interface AuthResponse {
  access_token: string
  token_type: string
  user: {
    id: number
    username: string
    email: string
  }
}

// Service d'authentification
export const authService = {
  // Connexion
  login: async (username: string, password: string): Promise<AuthResponse> => {
    try {
      logger.info(`Tentative de connexion avec: ${username}`)

      // Créer les données pour l'authentification
      const data = {
        email: username,
        mot_de_passe: password,
      }

      logger.info("Données d'authentification:", data)

      // Utiliser la route correcte pour l'authentification
      const response = await axios.post(`${API_CONFIG.BASE_URL}/login`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      logger.info("Réponse de connexion:", response.data)

      // Stocker le token dans le localStorage
      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token)

        // Stocker les informations utilisateur si disponibles
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user))
        }
      }

      return response.data
    } catch (error) {
      logger.error("Erreur lors de la connexion:", error)
      throw error
    }
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user")
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("access_token")
  },

  // Récupérer l'utilisateur connecté
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return null

      // Appel à l'API pour récupérer les informations de l'utilisateur actuel
      const response = await axios.get(`${API_CONFIG.BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response.data
    } catch (error) {
      logger.error("Erreur lors de la récupération de l'utilisateur:", error)
      return null
    }
  },

  // Récupérer le token
  getToken: (): string | null => {
    return localStorage.getItem("access_token")
  },
}

export default authService
