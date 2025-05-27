"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Clock } from "lucide-react"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { useWebSocket } from "../services/websocketService"
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover"
import { formatDistanceToNow, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { useNavigate } from "react-router-dom"

const NotificationIndicator = () => {
  const { notifications, markAsRead } = useWebSocket()
  const [unreadCount, setUnreadCount] = useState(0)
  const navigate = useNavigate()

  // Mettre à jour le compteur de notifications non lues
  useEffect(() => {
    const count = notifications.filter((notif) => !notif.est_lue).length
    setUnreadCount(count)
  }, [notifications])

  // Obtenir le temps écoulé depuis la création
  const getTimeAgo = (dateString) => {
    try {
      const date = parseISO(dateString)
      return formatDistanceToNow(date, { addSuffix: true, locale: fr })
    } catch (error) {
      return ""
    }
  }

  const handleViewAllNotifications = () => {
    navigate("/notifications")
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b">
          <h4 className="font-medium">Notifications</h4>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Aucune notification</div>
          ) : (
            <div>
              {notifications.slice(0, 5).map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 border-b hover:bg-muted/50 transition-colors ${!notif.est_lue ? "bg-muted/20" : ""}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm">{notif.contenu}</p>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {getTimeAgo(notif.date_envoi)}
                      </div>
                    </div>
                    {!notif.est_lue && (
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => markAsRead(notif.id)}>
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-2 border-t">
          <Button variant="ghost" size="sm" className="w-full" onClick={handleViewAllNotifications}>
            Voir toutes les notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default NotificationIndicator
