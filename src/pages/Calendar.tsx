"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { useTaskContext } from "@/context/TaskContext"
import { format } from "date-fns"
import type { Task } from "@/types/task"
import { Button } from "@/components/ui/button"
import { Check, Clock, AlertCircle, Loader2 } from "lucide-react"
import { taskService } from "@/services/taskApi"
import Header from "@/components/layout/Header"

const Calendar = () => {
  const { tasks } = useTaskContext()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState<Task[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Obtenir toutes les dates avec des tâches
  const getDaysWithTasks = () => {
    const days: { date: Date; count: number }[] = []
    tasks.forEach((task) => {
      if (task.dueDate) {
        const date = new Date(task.dueDate)
        date.setHours(0, 0, 0, 0)
        const existingDay = days.find((day) => day.date.getTime() === date.getTime())
        if (existingDay) {
          existingDay.count++
        } else {
          days.push({ date, count: 1 })
        }
      }
    })
    return days
  }

  // Charger les tâches planifiées pour la date sélectionnée depuis l'API
  const fetchTasksForDate = async (date: Date) => {
    if (!date) return

    try {
      setLoading(true)
      setError(null)

      // Afficher la date exacte pour le débogage
      console.log("Chargement des tâches pour la date:", date.toISOString())

      // Utiliser la fonction getTasksPlanifiees
      const fetchedTasks = await taskService.getTasksPlanifiees(date)
      console.log("Tâches récupérées:", fetchedTasks)
      setTasksForSelectedDate(fetchedTasks)
    } catch (err) {
      console.error("Erreur lors du chargement des tâches:", err)
      setError("Impossible de charger les tâches pour cette date")
      setTasksForSelectedDate([])
    } finally {
      setLoading(false)
    }
  }

  // Charger les tâches lorsque la date sélectionnée change
  useEffect(() => {
    if (selectedDate) {
      fetchTasksForDate(selectedDate)
    }
  }, [selectedDate])

  const daysWithTasks = getDaysWithTasks()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Planning</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-purple-100 dark:border-purple-900/30">
            <CardHeader>
              <CardTitle>Calendrier</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                modifiers={{
                  withTasks: (date) => {
                    return daysWithTasks.some((day) => day.date.getTime() === date.setHours(0, 0, 0, 0))
                  },
                }}
                modifiersStyles={{
                  withTasks: {
                    fontWeight: "bold",
                    backgroundColor: "rgba(139, 92, 246, 0.15)", // Light purple
                  },
                }}
                classNames={{
                  day_selected:
                    "bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600",
                  day_today: "bg-purple-100 dark:bg-purple-900 text-foreground",
                }}
              />
              {/* Afficher la date sélectionnée pour le débogage */}
              <div className="mt-4 text-sm text-gray-500">
                Date sélectionnée: {selectedDate ? format(selectedDate, "yyyy-MM-dd") : "Aucune"}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-purple-100 dark:border-purple-900/30">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>
                  {selectedDate ? `Tâches pour le ${format(selectedDate, "dd MMMM yyyy")}` : "Sélectionnez une date"}
                </span>
                {error && (
                  <Button variant="outline" size="sm" onClick={() => selectedDate && fetchTasksForDate(selectedDate)}>
                    Réessayer
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500 mr-2" />
                  <p>Chargement des tâches...</p>
                </div>
              ) : error ? (
                <div className="text-center py-10 text-red-500">
                  <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                  <p>{error}</p>
                </div>
              ) : tasksForSelectedDate.length === 0 ? (
                <div className="text-center py-10">
                  <Clock className="mx-auto h-12 w-12 text-purple-300 dark:text-purple-700 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Aucune tâche prévue pour cette date</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasksForSelectedDate.map((task: Task) => (
                    <div
                      key={task.id}
                      className={`p-4 rounded-lg border backdrop-blur-md ${
                        task.completed
                          ? "bg-gray-50/60 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700"
                          : task.priority === "high"
                            ? "bg-red-50/60 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                            : task.priority === "medium"
                              ? "bg-yellow-50/60 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                              : "bg-green-50/60 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {task.completed ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <div
                              className={`h-3 w-3 rounded-full ${
                                task.priority === "high"
                                  ? "bg-red-500"
                                  : task.priority === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                              }`}
                            />
                          )}
                          <div>
                            <h3 className={`font-medium ${task.completed ? "line-through text-gray-500" : ""}`}>
                              {task.title}
                            </h3>
                            {task.dueDate && (
                              <p className="text-xs text-gray-500 flex items-center mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                {format(new Date(task.dueDate), "HH:mm")}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-100/60 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 backdrop-blur-sm">
                            {task.category === "work"
                              ? "Travail"
                              : task.category === "personal"
                                ? "Personnel"
                                : task.category === "shopping"
                                  ? "Achats"
                                  : task.category === "health"
                                    ? "Santé"
                                    : "Autre"}
                          </span>
                        </div>
                      </div>
                      {task.description && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Calendar
