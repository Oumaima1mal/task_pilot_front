"use client"

import type React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { TaskProvider } from "@/context/TaskContext"
import { GroupProvider } from "@/context/GroupContext"
import { NotificationProvider } from "@/context/NotificationContext"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { useState, useEffect } from "react"
import Landing from "@/pages/Landing"
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import Tasks from "@/pages/Tasks"
import Dashboard from "@/pages/Dashboard"
import Calendar from "@/pages/Calendar"
import GroupTasks from "@/pages/GroupTasks"
import Notifications from "@/pages/Notifications"
import testBackendConnection from "@/utils/apiTest"
import logger from "@/utils/logger"

// Composant pour protéger les routes qui nécessitent une authentification
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = !!localStorage.getItem("access_token")

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

const App = () => {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem("access_token"))

  useEffect(() => {
    // Vérifier l'authentification et définir l'état
    setIsAuthenticated(!!localStorage.getItem("access_token"))

    // Tester la connexion au backend
    testBackendConnection()
      .then(() => {
        logger.info("Test de connexion au backend terminé")
      })
      .catch((error) => {
        logger.error("Erreur lors du test de connexion au backend:", error)
      })

    // Simuler un délai pour éviter les problèmes de rendu
    const timer = setTimeout(() => {
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de TaskPilot...</p>
        </div>
      </div>
    )
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="task-manager-theme">
      <NotificationProvider>
        <TaskProvider>
          <GroupProvider>
            <Router>
              <Routes>
                {/* Landing page - première page affichée */}
                <Route path="/" element={<Landing />} />

                {/* Pages d'authentification */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Pages protégées */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/taches"
                  element={
                    <ProtectedRoute>
                      <Tasks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/groupes"
                  element={
                    <ProtectedRoute>
                      <GroupTasks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/calendar"
                  element={
                    <ProtectedRoute>
                      <Calendar />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  }
                />

                {/* Route pour rediriger les utilisateurs authentifiés */}
                <Route
                  path="/app"
                  element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
                />
              </Routes>
            </Router>
            <Toaster />
          </GroupProvider>
        </TaskProvider>
      </NotificationProvider>
    </ThemeProvider>
  )
}

export default App
