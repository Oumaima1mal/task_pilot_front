import api from "@/services/api"
import logger from "@/utils/logger"

// Fonction pour tester la connexion au backend
export const testBackendConnection = async () => {
  try {
    logger.info("Test de connexion au backend...")
    
    // Tester l'accès à l'API sans authentification
    try {
      await api.get("/health-check")
      logger.info("✅ Connexion au backend réussie (endpoint public)")
    } catch (error: any) {
      logger.error("❌ Échec de la connexion au backend (endpoint public)", error.message)
    }
    
    // Tester l'accès à l'API avec authentification
    const token = localStorage.getItem("access_token")
    if (token) {
      try {
        await api.get("/users/me")
        logger.info("✅ Authentification au backend réussie")
      } catch (error: any) {
        logger.error("❌ Échec de l'authentification au backend", error.message)
      }
    } else {
      logger.warn("⚠️ Pas de token d'authentification disponible")
    }
    
  } catch (error: any) {
    logger.error("❌ Erreur lors du test de connexion", error.message)
  }
}

export default testBackendConnection