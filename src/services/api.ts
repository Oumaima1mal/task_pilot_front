import axios from "axios"
import { API_CONFIG } from "./config"
import logger from "@/utils/logger"

// Créer une instance axios avec la configuration de base
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: API_CONFIG.HEADERS,
  timeout: API_CONFIG.TIMEOUT,
})

// Intercepteur pour ajouter le token d'authentification à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      logger.debug(`Requête authentifiée: ${config.method?.toUpperCase()} ${config.url}`)
    } else {
      logger.debug(`Requête non authentifiée: ${config.method?.toUpperCase()} ${config.url}`)
    }

    logger.api(config.method?.toUpperCase() || "UNKNOWN", config.url || "", config.data)
    return config
  },
  (error) => {
    logger.apiError("REQUEST", error.config?.url || "Unknown URL", error)
    return Promise.reject(error)
  },
)

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => {
    logger.apiResponse(
      response.config.method?.toUpperCase() || "UNKNOWN",
      response.config.url || "",
      response.status,
      response.data,
    )
    return response
  },
  async (error) => {
    logger.apiError(error.config?.method?.toUpperCase() || "UNKNOWN", error.config?.url || "Unknown URL", error)

    // Si l'erreur est 401 Unauthorized
    if (error.response && error.response.status === 401) {
      logger.warn("Erreur 401, redirection vers login")
      localStorage.removeItem("access_token")
      window.location.href = "/login"
    }

    return Promise.reject(error)
  },
)

export default api