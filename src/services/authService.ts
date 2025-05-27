// Ce service est adapté à votre système d'authentification existant
import axios from "axios"

const API_URL = "http://localhost:8000" // Ajustez selon votre configuration

// Fonction pour vérifier si l'utilisateur est connecté
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("access_token")
  return !!token
}

// Fonction pour obtenir le token actuel
export const getToken = (): string | null => {
  return localStorage.getItem("access_token")
}

// Fonction pour se connecter
export const login = async (email: string, password: string): Promise<string> => {
  try {
    // Utiliser le même format que votre page de login existante
    const response = await axios.post(
      `${API_URL}/login`,
      {
        email,
        mot_de_passe: password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    const token = response.data.access_token

    // Stocker le token avec le même nom que votre page de login
    localStorage.setItem("access_token", token)

    return token
  } catch (error) {
    console.error("Erreur de connexion:", error)
    throw error
  }
}

// Fonction pour se déconnecter
export const logout = (): void => {
  localStorage.removeItem("access_token")
  // Rediriger vers la page de login
  window.location.href = "/login"
}

// Fonction pour obtenir l'utilisateur actuel
export const getCurrentUser = async () => {
  try {
    const token = getToken()

    if (!token) {
      return null
    }

    // Ajustez cet endpoint selon votre API
    const response = await axios.get(`${API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error)
    return null
  }
}

export default {
  isAuthenticated,
  getToken,
  login,
  logout,
  getCurrentUser,
}
