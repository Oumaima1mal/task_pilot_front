"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Check, AlertTriangle, Mail, MessageSquare, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWebSocket } from "@/services/websocketService"
import { format, formatDistanceToNow, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { useTaskContext } from "@/context/TaskContext"
import Header from "@/components/layout/Header"

const Notifications = () => {
  const { notifications, markAsRead } = useWebSocket()
  const { tasks, toggleTaskCompletion } = useTaskContext()
  const [activeTab, setActiveTab] = useState("all")

  // Filtrer les notifications en fonction de l'onglet actif
  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notif.est_lue
    if (activeTab === "websocket") return notif.type_notification === "websocket"
    if (activeTab === "email") return notif.type_notification === "email"
    return true
  })

  // Trouver la tâche associée à une notification
  const getTaskForNotification = (notif) => {
    if (!notif.tache_id) return null
    return tasks.find((task) => task.id === notif.tache_id.toString())
  }

  // Formater la date de création
  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString)
      return format(date, "dd MMM yyyy à HH:mm", { locale: fr })
    } catch (error) {
      return dateString
    }
  }

  // Obtenir le temps écoulé depuis la création
  const getTimeAgo = (dateString) => {
    try {
      const date = parseISO(dateString)
      return formatDistanceToNow(date, { addSuffix: true, locale: fr })
    } catch (error) {
      return ""
    }
  }

  // Marquer toutes les notifications comme lues
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
        window.location.reload()
      }
    } catch (error) {
      console.error("Erreur lors du marquage de toutes les notifications comme lues:", error)
    }
  }

  const unreadCount = notifications.filter((notif) => !notif.est_lue).length

  // Fonction pour obtenir la couleur de fond en fonction du type de notification
  const getBgColor = (notif) => {
    if (notif.contenu.includes("en retard")) {
      return "bg-red-50/60 dark:bg-red-900/20 border-red-200 dark:border-red-800 backdrop-blur-md"
    } else if (notif.type_notification === "email") {
      return "bg-amber-50/60 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 backdrop-blur-md"
    } else if (notif.contenu.includes("aujourd'hui")) {
      return "bg-blue-50/60 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 backdrop-blur-md"
    } else {
      return "bg-green-50/60 dark:bg-green-900/20 border-green-200 dark:border-green-800 backdrop-blur-md"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Notifications
          </span>
        </h1>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-purple-100 dark:border-purple-900/30">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Toutes
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Non lues
            </TabsTrigger>
            <TabsTrigger value="websocket" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Alertes
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Emails
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-purple-100 dark:border-purple-900/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 text-purple-600 mr-2" />
                  {activeTab === "all" && "Toutes les notifications"}
                  {activeTab === "unread" && "Notifications non lues"}
                  {activeTab === "websocket" && "Alertes en temps réel"}
                  {activeTab === "email" && "Notifications par email"}
                </CardTitle>
                {unreadCount > 0 && (
                  <Button onClick={markAllAsRead} variant="outline" className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Tout marquer comme lu
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-600 dark:text-gray-300">
                    <Bell className="h-12 w-12 mb-4 text-purple-300 dark:text-purple-700" />
                    <p>Aucune notification dans cette catégorie</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredNotifications.map((notif) => {
                      const task = getTaskForNotification(notif)

                      return (
                        <div
                          key={notif.id}
                          className={`flex items-center justify-between p-3 rounded-md ${getBgColor(notif)} border ${
                            !notif.est_lue ? "ring-1 ring-purple-300 dark:ring-purple-700" : ""
                          }`}
                        >
                          <div>
                            <div className="font-medium">{notif.contenu}</div>
                            <div className="text-sm text-muted-foreground flex items-center mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {getTimeAgo(notif.date_envoi)}
                            </div>
                            {task && (
                              <div className="mt-2 text-sm">
                                <span className="font-medium">Tâche associée:</span> {task.title}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {task && !task.completed && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleTaskCompletion(task.id)}
                                className="opacity-80 hover:opacity-100"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Fait
                              </Button>
                            )}

                            {!notif.est_lue && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(notif.id)}
                                className="opacity-80 hover:opacity-100"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Notifications
