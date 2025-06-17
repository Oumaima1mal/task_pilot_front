"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import type { Task, TaskCategory, TaskPriority, CreateTaskInput, TaskMemberStatus, TaskStatus } from "@/types/task"
import { useToast } from "@/hooks/use-toast"
import { scheduleNotification, cancelNotification } from "@/utils/notification"
import { taskService } from "@/services/taskApi"

interface TaskContextType {
  tasks: Task[]
  loading: boolean
  error: string | null
  initialized: boolean // Ajout d'un flag pour savoir si les données ont été chargées
  addTask: (task: CreateTaskInput) => Promise<void>
  updateTask: (id: string, task: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleTaskCompletion: (id: string) => Promise<void>
  getTasksByCategory: (category: TaskCategory) => Task[]
  getTasksByPriority: (priority: TaskPriority) => Task[]
  getOverdueTasks: () => Task[]
  getTodayTasks: () => Task[]
  getGroupTasks: (groupId: string) => Task[]
  updateMemberTaskStatus: (taskId: string, userId: string, status: TaskStatus) => void
  refreshTasks: () => Promise<void>
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function useTaskContext() {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error("useTaskContext doit être utilisé au sein d'un TaskProvider")
  }
  return context
}

interface TaskProviderProps {
  children: ReactNode
}

export function TaskProvider({ children }: TaskProviderProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState<boolean>(false) // Flag pour savoir si initialisé

  // Refs pour éviter les re-renders et les appels multiples
  const isRefreshingRef = useRef(false)
  const mountedRef = useRef(true)
  const hasAttemptedInitialLoad = useRef(false) // Pour éviter les chargements multiples

  const { toast } = useToast()

  // Fonction refreshTasks simplifiée
  const refreshTasks = useCallback(async () => {
    if (isRefreshingRef.current || !mountedRef.current) {
      console.log("Refresh déjà en cours ou composant démonté, requête ignorée")
      return
    }

    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        console.log("Pas de token, impossible de charger les tâches")
        setTasks([])
        setLoading(false)
        setInitialized(true)
        return
      }

      if (window.location.pathname.includes("/login") || window.location.pathname === "/") {
        console.log("Sur la page de login/landing, pas de chargement des tâches")
        setLoading(false)
        setInitialized(true)
        return
      }

      console.log("Chargement des tâches...")
      isRefreshingRef.current = true
      setLoading(true)
      setError(null)

      try {
        // Essayer de charger toutes les tâches
        const allTasks = await taskService.getAllTasks()
        console.log(`${allTasks.length} tâches chargées`)

        // Essayer de charger les tâches terminées (optionnel)
        let completedTasks: Task[] = []
        try {
          completedTasks = await taskService.getCompletedTasks()
          console.log(`${completedTasks.length} tâches terminées chargées`)
        } catch (completedError) {
          console.warn("Impossible de charger les tâches terminées:", completedError)
          // Ce n'est pas critique, on continue avec les tâches actives seulement
        }

        // Combiner les tâches en évitant les doublons
        const combinedTasks = [...allTasks]
        for (const completedTask of completedTasks) {
          if (!combinedTasks.some((task) => task.id === completedTask.id)) {
            combinedTasks.push(completedTask)
          }
        }

        if (mountedRef.current) {
          setTasks(combinedTasks)
          setError(null)
          setInitialized(true) // Marquer comme initialisé même si la liste est vide
          console.log(`Chargement terminé: ${combinedTasks.length} tâches au total`)
        }
      } catch (apiError: any) {
        console.error("Erreur lors du chargement des tâches:", apiError)

        if (mountedRef.current) {
          if (apiError.response && apiError.response.status === 401) {
            console.log("Erreur 401, problème d'authentification")
            setError(null)
            setTasks([])
          } else {
            // Pour un nouveau compte, l'API peut retourner une liste vide, ce n'est pas une erreur
            if (apiError.response && apiError.response.status === 404) {
              console.log("Aucune tâche trouvée (nouveau compte)")
              setTasks([])
              setError(null)
            } else {
              setError("Impossible de charger les tâches. Veuillez réessayer plus tard.")
              toast({
                title: "Erreur",
                description: "Impossible de charger les tâches",
                variant: "destructive",
              })
            }
          }
          setInitialized(true) // Marquer comme initialisé même en cas d'erreur
        }
      }
    } catch (err: any) {
      console.error("Erreur générale lors du chargement des tâches:", err)
      if (mountedRef.current) {
        setError("Une erreur inattendue s'est produite.")
        setInitialized(true)
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
      isRefreshingRef.current = false
    }
  }, [toast])

  // Fonctions mémorisées pour éviter les re-renders
  const addTask = useCallback(
    async (task: CreateTaskInput) => {
      try {
        setLoading(true)
        let newTask

        if (task.groupId) {
          console.log(`Création d'une tâche de groupe (${task.groupId}):`, task.title)
          newTask = await taskService.createGroupTask(task.groupId, task)
        } else {
          console.log("Création d'une tâche individuelle:", task.title)
          newTask = await taskService.createTask(task)
        }

        setTasks((prevTasks) => [...prevTasks, newTask])

        toast({
          title: "Tâche ajoutée",
          description: `"${task.title}" a été ajoutée à votre liste`,
        })

        if (task.reminder && !task.completed) {
          scheduleNotification(newTask)
        }
      } catch (err) {
        console.error("Erreur lors de l'ajout de la tâche:", err)
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter la tâche",
          variant: "destructive",
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const updateTask = useCallback(
    async (id: string, updatedFields: Partial<Task>) => {
      try {
        setLoading(true)
        const updatedTask = await taskService.updateTask(id, updatedFields)

        setTasks((prevTasks) =>
          prevTasks.map((task) => {
            if (task.id === id) {
              if (updatedFields.reminder && updatedFields.reminder !== task.reminder) {
                cancelNotification(task.title)
                if (!updatedTask.completed) {
                  scheduleNotification(updatedTask)
                }
              }
              return updatedTask
            }
            return task
          }),
        )

        toast({
          title: "Tâche mise à jour",
          description: "Les modifications ont été enregistrées",
        })
      } catch (err) {
        console.error("Erreur lors de la mise à jour de la tâche:", err)
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour la tâche",
          variant: "destructive",
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const deleteTask = useCallback(
    async (id: string) => {
      try {
        setLoading(true)
        const taskToRemove = tasks.find((task) => task.id === id)

        await taskService.deleteTask(id)

        if (taskToRemove?.reminder) {
          cancelNotification(taskToRemove.title)
        }

        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id))

        toast({
          title: "Tâche supprimée",
          description: "La tâche a été supprimée",
        })
      } catch (err) {
        console.error("Erreur lors de la suppression de la tâche:", err)
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la tâche",
          variant: "destructive",
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [tasks, toast],
  )

  const toggleTaskCompletion = useCallback(
    async (id: string) => {
      try {
        const task = tasks.find((t) => t.id === id)
        if (!task) return

        const completed = !task.completed
        console.log(`Changement de statut pour la tâche ${id} à ${completed ? "Terminé" : "En cours"}`)

        // Mise à jour optimiste
        setTasks((prevTasks) => prevTasks.map((t) => (t.id === id ? { ...t, completed } : t)))

        try {
  await taskService.updateTaskStatus(id, completed)

  toast({
    title: completed ? "Tâche terminée" : "Tâche réactivée",
    description: completed ? "La tâche a été marquée comme terminée" : "La tâche a été réactivée",
  })

  // ✅ Recharger immédiatement depuis l'API
  await refreshTasks()
} catch (apiError) {
  console.error("Erreur API lors du changement de statut:", apiError)

  // Revenir à l'état précédent
  setTasks((prevTasks) => prevTasks.map((t) => (t.id === id ? { ...t, completed: !completed } : t)))

  toast({
    title: "Erreur",
    description: "Impossible de mettre à jour le statut de la tâche",
    variant: "destructive",
  })
}
      } catch (err) {
        console.error("Erreur générale lors du changement de statut:", err)
        toast({
          title: "Erreur",
          description: "Une erreur inattendue s'est produite. Veuillez réessayer.",
          variant: "destructive",
        })
      }
    },
    [tasks, toast],
  )

  // Fonctions de filtrage mémorisées
  const getTasksByCategory = useCallback(
    (category: TaskCategory) => {
      return tasks.filter((task) => task.category === category)
    },
    [tasks],
  )

  const getTasksByPriority = useCallback(
    (priority: TaskPriority) => {
      return tasks.filter((task) => task.priority === priority)
    },
    [tasks],
  )

  const getOverdueTasks = useCallback(() => {
    const now = new Date()
    return tasks.filter((task) => task.dueDate && new Date(task.dueDate) < now && !task.completed)
  }, [tasks])

  const getTodayTasks = useCallback(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return tasks.filter((task) => task.dueDate && new Date(task.dueDate) >= today && new Date(task.dueDate) < tomorrow)
  }, [tasks])

  const getGroupTasks = useCallback(
    (groupId: string) => {
      return tasks.filter((task) => task.groupId === groupId)
    },
    [tasks],
  )

  const updateMemberTaskStatus = useCallback(
    (taskId: string, userId: string, status: TaskStatus) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.id === taskId) {
            const memberStatuses = task.memberStatuses ? [...task.memberStatuses] : []
            const memberIndex = memberStatuses.findIndex((ms) => ms.userId === userId)

            const newStatus: TaskMemberStatus = {
              userId,
              status,
              updatedAt: new Date(),
            }

            if (memberIndex >= 0) {
              memberStatuses[memberIndex] = newStatus
            } else {
              memberStatuses.push(newStatus)
            }

            return { ...task, memberStatuses }
          }
          return task
        }),
      )

      toast({
        title: "Statut mis à jour",
        description: "Le statut de la tâche a été mis à jour",
      })
    },
    [toast],
  )

  // Effet pour le chargement initial - SIMPLIFIÉ
  useEffect(() => {
    let isMounted = true
    mountedRef.current = true

    const initializeTasks = async () => {
      // Ne charger qu'une seule fois
      if (hasAttemptedInitialLoad.current) {
        console.log("Chargement initial déjà tenté, ignoré")
        return
      }

      hasAttemptedInitialLoad.current = true

      const token = localStorage.getItem("access_token")
      if (!token) {
        console.log("Pas de token, initialisation sans chargement")
        if (isMounted) {
          setInitialized(true)
          setLoading(false)
        }
        return
      }

      if (window.location.pathname.includes("/login") || window.location.pathname === "/") {
        console.log("Sur page login/landing, pas de chargement")
        if (isMounted) {
          setInitialized(true)
          setLoading(false)
        }
        return
      }

      console.log("Chargement initial des tâches")
      await refreshTasks()
    }

    initializeTasks()

    return () => {
      isMounted = false
      mountedRef.current = false
    }
  }, []) // Dépendances vides - ne s'exécute qu'au montage

  // Supprimer tous les autres useEffect qui peuvent créer des boucles

  // Valeur du contexte mémorisée
  const contextValue = {
    tasks,
    loading,
    error,
    initialized, // Exposer le flag d'initialisation
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    getTasksByCategory,
    getTasksByPriority,
    getOverdueTasks,
    getTodayTasks,
    getGroupTasks,
    updateMemberTaskStatus,
    refreshTasks,
  }

  return <TaskContext.Provider value={contextValue}>{children}</TaskContext.Provider>
}
