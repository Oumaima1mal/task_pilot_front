"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useWebSocket, type WSNotification } from "../services/websocketService"
import { useToast } from "../hooks/use-toast"

interface NotificationContextType {
  notifications: WSNotification[]
  unreadCount: number
  markAsRead: (notificationId: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotificationContext = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotificationContext doit être utilisé au sein d'un NotificationProvider")
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { notifications, markAsRead, fetchAllNotifications } = useWebSocket()
  const [unreadCount, setUnreadCount] = useState(0)
  const { toast } = useToast()

  // Mettre à jour le compteur de notifications non lues
  useEffect(() => {
    const count = notifications.filter((notif) => !notif.est_lue).length
    setUnreadCount(count)

    // Mettre à jour le titre de la page avec le nombre de notifications
    if (count > 0) {
      document.title = `(${count}) Gestionnaire de Tâches`
    } else {
      document.title = "Gestionnaire de Tâches"
    }
  }, [notifications])

  // Fonction pour marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch("http://localhost:8000/notifications/read-all", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Rafraîchir les notifications
        await fetchAllNotifications()

        toast({
          title: "Notifications",
          description: "Toutes les notifications ont été marquées comme lues",
        })
      }
    } catch (error) {
      console.error("Erreur lors du marquage de toutes les notifications comme lues:", error)
      toast({
        title: "Erreur",
        description: "Impossible de marquer les notifications comme lues",
        variant: "destructive",
      })
    }
  }

  // Fonction pour rafraîchir les notifications
  const refreshNotifications = async () => {
    await fetchAllNotifications()
  }

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
