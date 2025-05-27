"use client"

import type React from "react"
import TaskList from "@/components/TaskList"
import Header from "@/components/layout/Header"
import { useTaskContext } from "@/context/TaskContext"

const Tasks: React.FC = () => {
  const { loading, error, initialized } = useTaskContext()

  // Affichage du loader pendant l'initialisation
  if (!initialized && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des tâches...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <TaskList />
      </main>
    </div>
  )
}

export default Tasks
