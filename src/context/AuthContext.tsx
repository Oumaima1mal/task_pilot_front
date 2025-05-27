"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import authService from "@/services/authService"

interface User {
  id: string
  username: string
  email?: string
  // Ajoutez d'autres propriétés selon votre modèle d'utilisateur
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth doit être utilisé au sein d'un AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true)

        // Vérifier si un token existe
        if (authService.isAuthenticated()) {
          // Récupérer les informations de l'utilisateur
          const userData = await authService.getCurrentUser()

          if (userData) {
            setUser(userData)
            setIsAuthenticated(true)
          } else {
            // Token invalide ou expiré
            authService.logout()
            setIsAuthenticated(false)
          }
        } else {
          setIsAuthenticated(false)
        }

        setError(null)
      } catch (err) {
        console.error("Erreur lors de la vérification de l'authentification:", err)
        setError("Erreur lors de la vérification de l'authentification")
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Fonction de connexion
  const login = async (username: string, password: string) => {
    try {
      setLoading(true)

      // Appeler le service d'authentification
      await authService.login(username, password)

      // Récupérer les informations de l'utilisateur
      const userData = await authService.getCurrentUser()

      if (userData) {
        setUser(userData)
        setIsAuthenticated(true)
        setError(null)
      } else {
        throw new Error("Impossible de récupérer les informations de l'utilisateur")
      }
    } catch (err) {
      console.error("Erreur de connexion:", err)
      setError("Nom d'utilisateur ou mot de passe incorrect")
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  // Fonction de déconnexion
  const logout = () => {
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
