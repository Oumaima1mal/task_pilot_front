"use client"

import type React from "react"
import { useState, useCallback } from "react"
import type { Task, TaskCategory } from "@/types/task"
import TaskItem from "./TaskItem"
import CreateTaskForm from "./CreateTaskForm"
import { useTaskContext } from "@/context/TaskContext"
import { useGroupContext } from "@/context/GroupContext"
import { CheckCheck, Clock, ListFilter, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const TaskList: React.FC = () => {
  const { tasks, loading, error, initialized, toggleTaskCompletion, refreshTasks } = useTaskContext()
  const { groups } = useGroupContext()
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | "all" | "group">("all")
  const [selectedTab, setSelectedTab] = useState<"active" | "completed">("active")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Gestionnaire optimisé pour la fermeture du formulaire
  const handleCloseForm = useCallback((open: boolean) => {
    setIsFormOpen(open)
    if (!open) {
      setEditingTask(null)
    }
  }, [])

  // Gestionnaire optimisé pour l'édition
  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }, [])

  // Gestionnaire optimisé pour le toggle de completion
  const handleToggleCompletion = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation()
      try {
        await toggleTaskCompletion(id)
      } catch (error) {
        console.error("Erreur lors du changement de statut:", error)
      }
    },
    [toggleTaskCompletion],
  )

  // Fonction mémorisée pour obtenir le nom du groupe
  const getGroupNameById = useCallback(
    (groupId: string) => {
      const group = groups.find((g) => g.id === groupId)
      return group ? group.name : "Groupe inconnu"
    },
    [groups],
  )

  // Affichage du loader pendant le chargement initial
  if (!initialized && loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Chargement des tâches...</p>
      </div>
    )
  }

  // Affichage d'erreur
  if (error) {
    return (
      <div className="text-center py-10 bg-red-50/60 dark:bg-red-900/20 backdrop-blur-md border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-500">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => refreshTasks()}>
          Réessayer
        </Button>
      </div>
    )
  }

  const filteredTasks = tasks.filter((task) => {
    if (selectedTab === "active" && task.completed) return false
    if (selectedTab === "completed" && !task.completed) return false
    if (selectedCategory === "group" && !task.groupId) return false
    if (selectedCategory !== "all" && selectedCategory !== "group" && task.category !== selectedCategory) return false
    return true
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (priorityDiff !== 0) return priorityDiff

    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    }

    if (a.dueDate) return -1
    if (b.dueDate) return 1

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Mes tâches
            </span>
          </h1>
          <p className="text-sm text-gray-500">{tasks.length} au total</p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle tâche
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Select
            value={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value as TaskCategory | "all" | "group")}
          >
            <SelectTrigger className="w-[180px]">
              <ListFilter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Toutes les..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              <SelectItem value="work">Travail</SelectItem>
              <SelectItem value="personal">Personnel</SelectItem>
              <SelectItem value="shopping">Achats</SelectItem>
              <SelectItem value="health">Santé</SelectItem>
              <SelectItem value="other">Autre</SelectItem>
              <SelectItem value="group">Tâches de groupe</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      <Tabs
        defaultValue="active"
        value={selectedTab}
        onValueChange={(v) => setSelectedTab(v as "active" | "completed")}
        className="mb-6"
      >
        <TabsList className="grid w-[250px] grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Actives</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCheck className="h-4 w-4" />
            <span>Terminées</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-purple-100 dark:border-purple-900/30 rounded-lg">
              <div className="mb-4">
                <Clock className="h-12 w-12 mx-auto text-purple-300 dark:text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aucune tâche active</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {tasks.length === 0
                    ? "Commencez par créer votre première tâche !"
                    : "Toutes vos tâches sont terminées. Félicitations !"}
                </p>
                <Button
                  onClick={() => setIsFormOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer ma première tâche
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedTasks.map((task) => (
                <div key={task.id} onClick={() => handleEditTask(task)} className="cursor-pointer">
                  <TaskItem
                    task={task}
                    onEdit={() => handleEditTask(task)}
                    onToggleCompletion={(e) => handleToggleCompletion(task.id, e)}
                    showGroupBadge={task.groupId ? true : false}
                    groupName={task.groupId ? getGroupNameById(task.groupId) : undefined}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-purple-100 dark:border-purple-900/30 rounded-lg">
              <CheckCheck className="h-12 w-12 mx-auto text-purple-300 dark:text-purple-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Aucune tâche terminée</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedTasks.map((task) => (
                <div key={task.id} onClick={() => handleEditTask(task)} className="cursor-pointer">
                  <TaskItem
                    task={task}
                    onEdit={() => handleEditTask(task)}
                    onToggleCompletion={(e) => handleToggleCompletion(task.id, e)}
                    showGroupBadge={task.groupId ? true : false}
                    groupName={task.groupId ? getGroupNameById(task.groupId) : undefined}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateTaskForm
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        initialValues={editingTask || undefined}
        isEditing={!!editingTask}
      />
    </div>
  )
}

export default TaskList
