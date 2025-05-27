// Types pour les tâches

export type TaskPriority = "low" | "medium" | "high"
export type TaskCategory = "work" | "personal" | "shopping" | "health" | "other"
export type TaskStatus = "pending" | "in-progress" | "completed" | "cancelled"

export interface TaskMemberStatus {
  userId: string
  status: string
  updatedAt: Date
}

export interface Task {
  id: string
  title: string
  description?: string
  priority: TaskPriority
  category: TaskCategory
  completed: boolean
  dueDate?: Date
  reminder?: Date
  createdAt: Date
  groupId?: string
  memberStatuses?: TaskMemberStatus[]
}

export interface CreateTaskInput {
  title: string
  description?: string
  priority: TaskPriority
  category: TaskCategory
  completed?: boolean
  dueDate?: Date
  reminder?: Date
  groupId?: string
}

// Nouveau type pour les tâches planifiées
export interface TaskPlanifiee {
  id: number
  date_debut: string
  duree: number
  titre_tache: string
  description_tache?: string
}
