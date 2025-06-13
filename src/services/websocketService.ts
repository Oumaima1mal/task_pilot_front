"use client"

import { useEffect, useState } from "react"
import { useToast } from "../hooks/use-toast"

// Type pour les notifications reçues via WebSocket, adapté à votre modèle
export interface WSNotification {
  id: number
  contenu: string
  type_notification: string
  window_label: string | null
  est_lue: boolean
  date_envoi: string
  utilisateur_id: number
  tache_id: number | null
}

// Hook personnalisé pour gérer la connexion WebSocket
export const useWebSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [notifications, setNotifications] = useState<WSNotification[]>([])
  const { toast } = useToast()

  // Fonction pour se connecter au WebSocket
  const connect = () => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      console.error("Pas de token, impossible de se connecter au WebSocket")
      return null
    }

    try {
      // Créer une nouvelle connexion WebSocket avec le token JWT
      const ws = new WebSocket(`wss://task-pilot-back-production.up.railway.app/ws?token=${token}`)

      ws.onopen = () => {
        console.log("Connexion WebSocket établie")
        setConnected(true)
        setSocket(ws)
        
        // Récupérer les notifications existantes après connexion
        fetchAllNotifications()
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log("Message WebSocket reçu:", data)

          // Ajouter la notification à l'état
          setNotifications((prev) => {
            // Vérifier si la notification existe déjà
            const exists = prev.some(n => n.id === data.id)
            if (exists) return prev
            return [data, ...prev]
          })

          // Afficher un toast pour la notification
          toast({
            title: "Nouvelle notification",
            description: data.contenu,
            duration: 5000,
          })
        } catch (error) {
          console.error("Erreur lors du traitement du message WebSocket:", error)
        }
      }

      ws.onclose = () => {
        console.log("Connexion WebSocket fermée")
        setConnected(false)
        setSocket(null)

        // Tenter de se reconnecter après un délai
        setTimeout(() => {
          if (localStorage.getItem("access_token")) {
            connect()
          }
        }, 5000)
      }

      ws.onerror = (error) => {
        console.error("Erreur WebSocket:", error)
        ws.close()
      }

      return ws
    } catch (error) {
      console.error("Erreur lors de la création de la connexion WebSocket:", error)
      return null
    }
  }

  // Se connecter au WebSocket au montage du composant
  useEffect(() => {
    const ws = connect()

    // Nettoyage à la destruction du composant
    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [])

  // Fonction pour marquer une notification comme lue
  const markAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://task-pilot-back-production.up.railway.app/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Mettre à jour l'état local
        setNotifications((prev) =>
          prev.map((notif) => (notif.id === notificationId ? { ...notif, est_lue: true } : notif)),
        )
      }
    } catch (error) {
      console.error("Erreur lors du marquage de la notification comme lue:", error)
    }
  }

  // Fonction pour récupérer toutes les notifications
  const fetchAllNotifications = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch("https://task-pilot-back-production.up.railway.app/notifications/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setNotifications(data)
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error)
    }
  }

  // Récupérer les notifications au montage
  useEffect(() => {
    fetchAllNotifications()
  }, [])

  return {
    connected,
    notifications,
    markAsRead,
    fetchAllNotifications,
  }
}
