"use client"

import type React from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import type { Task } from "@/types/task"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, Clock, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTaskContext } from "@/context/TaskContext"
import { useState } from "react"

interface TaskItemProps {
  task: Task
  onEdit: () => void
  onToggleCompletion: (e: React.MouseEvent) => void
  showGroupBadge?: boolean
  groupName?: string
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, onToggleCompletion, showGroupBadge = false, groupName }) => {
  const { deleteTask } = useTaskContext()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
      await deleteTask(task.id)
    }
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed

  // Modifier la fonction onToggleCompletion pour ajouter des logs et un indicateur visuel
  const handleToggleCompletion = async (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Clic sur la checkbox pour la tâche:", task.id)
    console.log("État actuel:", task.completed ? "Terminé" : "En cours")

    // Afficher l'indicateur de mise à jour
    setIsUpdating(true)

    // Appeler la fonction de mise à jour
    onToggleCompletion(e)

    // Masquer l'indicateur après un court délai
    setTimeout(() => {
      setIsUpdating(false)
    }, 1000)
  }

  return (
    <div
      className={`p-4 rounded-lg mb-2 transition-all ${
        task.completed
          ? "bg-muted/40 dark:bg-muted/20"
          : "bg-card hover:shadow-md dark:hover:shadow-none dark:hover:bg-muted/10"
      } ${isUpdating ? "opacity-70" : ""}`}
    >
      <div className="flex items-start">
        <div className="mr-3 flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-purple-600 mb-2"></div>
          <div className="relative">
            <Checkbox
              checked={task.completed}
              onCheckedChange={(checked) => {
                if (typeof checked === "boolean") {
                  handleToggleCompletion(new MouseEvent("click") as unknown as React.MouseEvent)
                }
              }}
              onClick={handleToggleCompletion}
              className={`${task.completed ? "opacity-50" : ""} ${isUpdating ? "opacity-30" : ""}`}
              disabled={isUpdating}
            />
            {isUpdating && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3
                className={`text-base font-medium truncate ${task.completed ? "line-through text-muted-foreground" : ""}`}
              >
                {task.title}
              </h3>
              {task.description && <p className="text-sm text-gray-500 mt-1">{task.description}</p>}
            </div>
            <div className="flex-shrink-0 ml-2">
              {task.priority && (
                <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                  {task.priority}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
            {task.dueDate && (
              <div className={`flex items-center gap-1 ${isOverdue ? "text-red-500" : ""}`}>
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>{format(new Date(task.dueDate), "dd/MM/yyyy", { locale: fr })}</span>
              </div>
            )}

            {task.reminder && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{format(new Date(task.reminder), "dd/MM/yyyy HH:mm", { locale: fr })}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 ml-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Modifier</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Supprimer</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TaskItem
