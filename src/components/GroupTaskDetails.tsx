"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import type { Task } from "@/types/task"
import { useTaskContext } from "@/context/TaskContext"
import { useGroupContext } from "@/context/GroupContext"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, AlertCircle, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { taskService } from "@/services/taskApi"

interface GroupTaskDetailsProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

type TaskStatus = "pending" | "in-progress" | "completed" | "cancelled"

interface MemberStatus {
  nom: string
  prenom: string
  statut: string
}

const statusLabels: Record<string, string> = {
  pending: "À faire",
  "in-progress": "En cours",
  completed: "Terminé",
  cancelled: "Annulé",
  Terminé: "Terminé",
  "En cours": "En cours",
}

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800",
  "in-progress": "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  Terminé: "bg-green-100 text-green-800",
  "En cours": "bg-blue-100 text-blue-800",
}

const GroupTaskDetails: React.FC<GroupTaskDetailsProps> = ({ task, open, onOpenChange }) => {
  const { updateMemberTaskStatus } = useTaskContext()
  const { users, getGroupById } = useGroupContext()
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>("pending")
  const currentUserId = "1" // Simule l'utilisateur connecté, à remplacer par l'ID réel
  const [memberStatuses, setMemberStatuses] = useState<MemberStatus[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (task && task.groupId && open) {
      fetchMemberStatuses(task.groupId, task.title)
    }
  }, [task, open])

  const fetchMemberStatuses = async (groupId: string, taskTitle: string) => {
    try {
      setLoading(true)
      setError(null)
      const statuses = await taskService.getTaskMemberStatuses(groupId, taskTitle)
      setMemberStatuses(statuses)
    } catch (err) {
      console.error("Erreur lors de la récupération des états d'avancement:", err)
      setError("Impossible de charger les états d'avancement des membres")
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleStatusUpdate = () => {
    if (task) {
      updateMemberTaskStatus(task.id, currentUserId, selectedStatus)
    }
  }

  const getMemberStatus = (userId: string) => {
    if (!task || !task.memberStatuses) return null
    return task.memberStatuses.find((ms) => ms.userId === userId)
  }

  const getUserById = (userId: string) => {
    return users.find((user) => user.id === userId)
  }

  // Récupérer tous les membres du groupe
  const getAllGroupMembers = () => {
    if (!task || !task.groupId) return []

    const group = getGroupById(task.groupId)
    return group ? group.members : []
  }

  if (!task) return null

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed
  const groupMembers = getAllGroupMembers()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{task.title}</DialogTitle>
          <DialogDescription>{task.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-3 items-center">
            {task.priority && (
              <Badge
                variant="outline"
                className={cn(
                  task.priority === "high"
                    ? "bg-red-100 text-red-800"
                    : task.priority === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800",
                )}
              >
                {task.priority === "high" ? "Haute" : task.priority === "medium" ? "Moyenne" : "Basse"}
              </Badge>
            )}

            <Badge variant="outline" className="bg-purple-100 text-purple-800">
              {task.category === "work"
                ? "Travail"
                : task.category === "personal"
                  ? "Personnel"
                  : task.category === "shopping"
                    ? "Achats"
                    : task.category === "health"
                      ? "Santé"
                      : "Autre"}
            </Badge>

            {task.dueDate && (
              <div className={cn("flex items-center gap-1 text-sm", isOverdue && "text-destructive")}>
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(task.dueDate), "dd/MM/yyyy")}</span>
                {isOverdue && <AlertCircle className="h-4 w-4" />}
              </div>
            )}

            {task.reminder && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{format(new Date(task.reminder), "dd/MM/yyyy HH:mm")}</span>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-2">Statut par membre</h3>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Chargement des statuts...</span>
              </div>
            ) : error ? (
              <div className="text-center py-4 text-destructive">
                <p>{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => task.groupId && fetchMemberStatuses(task.groupId, task.title)}
                >
                  Réessayer
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {memberStatuses.length > 0 ? (
                  memberStatuses.map((member, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted/30 p-3 rounded-md">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{getInitials(`${member.prenom} ${member.nom}`)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{`${member.prenom} ${member.nom}`}</p>
                        </div>
                      </div>

                      <Badge className={cn(statusColors[member.statut])}>
                        {statusLabels[member.statut] || member.statut}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-3">
                    Aucun état d'avancement trouvé pour cette tâche
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="pt-3 border-t">
            <h3 className="font-medium mb-3">Mettre à jour mon statut</h3>
            <div className="space-y-4">
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un statut" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <Button onClick={handleStatusUpdate}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default GroupTaskDetails
