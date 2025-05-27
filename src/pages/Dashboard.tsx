"use client"

import type React from "react"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, CheckSquare, Users, Bell, Clock, AlertTriangle } from "lucide-react"
import { Link } from "react-router-dom"
import { useTaskContext } from "@/context/TaskContext"
import { useGroupContext } from "@/context/GroupContext"
import { format, isToday, isTomorrow, isThisWeek } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Task } from "@/types/task"
import { Progress } from "@/components/ui/progress"
import Header from "@/components/layout/Header"

const Dashboard = () => {
  const { tasks, refreshTasks } = useTaskContext()
  const { groups } = useGroupContext()

  // Rafraîchir les tâches au chargement du dashboard
  useEffect(() => {
    console.log("Dashboard chargé, rafraîchissement des tâches...")
    refreshTasks().catch((err) => {
      console.error("Erreur lors du rafraîchissement des tâches:", err)
    })
    // Pas besoin de useRef ici, simplement appeler refreshTasks une fois
  }, [refreshTasks])

  // Calcul des statistiques de tâches
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    active: tasks.filter((t) => !t.completed).length,
    overdue: tasks.filter((t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length,
    today: tasks.filter((t) => !t.completed && t.dueDate && isToday(new Date(t.dueDate))).length,
    tomorrow: tasks.filter((t) => !t.completed && t.dueDate && isTomorrow(new Date(t.dueDate))).length,
    thisWeek: tasks.filter(
      (t) =>
        !t.completed &&
        t.dueDate &&
        isThisWeek(new Date(t.dueDate)) &&
        !isToday(new Date(t.dueDate)) &&
        !isTomorrow(new Date(t.dueDate)),
    ).length,
    highPriority: tasks.filter((t) => !t.completed && t.priority === "high").length,
  }

  const completionRate = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0

  // Tâches à venir triées par date d'échéance
  const upcomingTasks = [...tasks]
    .filter((t) => !t.completed && t.dueDate && new Date(t.dueDate) >= new Date())
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5)

  // Tâches en retard
  const overdueTasks = [...tasks]
    .filter((t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date())
    .sort((a, b) => new Date(b.dueDate!).getTime() - new Date(a.dueDate!).getTime())
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Tableau de bord
          </span>
        </h1>

        {/* Section des statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-purple-100 dark:border-purple-900/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <CheckSquare className="h-5 w-5 text-purple-600 mr-2" />
                Progression
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{completionRate}%</div>
              <Progress value={completionRate} className="h-2 mb-2" />
              <p className="text-sm text-muted-foreground">
                {taskStats.completed} / {taskStats.total} tâches terminées
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="ghost" size="sm" className="w-full">
                <Link to="/taches">Voir toutes les tâches</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-purple-100 dark:border-purple-900/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                Haute priorité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{taskStats.highPriority}</div>
              <p className="text-sm text-muted-foreground">Tâches à traiter rapidement</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="ghost" size="sm" className="w-full">
                <Link to="/taches">Voir les priorités</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-purple-100 dark:border-purple-900/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-5 w-5 text-red-600 mr-2" />
                En retard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{taskStats.overdue}</div>
              <p className="text-sm text-muted-foreground">Tâches en retard</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="ghost" size="sm" className="w-full">
                <Link to="/notifications">Voir les rappels</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-purple-100 dark:border-purple-900/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                Groupes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{groups.length}</div>
              <p className="text-sm text-muted-foreground">Groupes actifs</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="ghost" size="sm" className="w-full">
                <Link to="/groupes">Gérer les groupes</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Aperçu des tâches */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-purple-100 dark:border-purple-900/30">
            <CardHeader>
              <CardTitle>Tâches à venir</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="mb-4 bg-white/40 dark:bg-gray-700/40 backdrop-blur-sm">
                  <TabsTrigger value="upcoming">À venir</TabsTrigger>
                  <TabsTrigger value="overdue">En retard</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming">
                  {upcomingTasks.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-60" />
                      <p>Aucune tâche à venir</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingTasks.map((task) => (
                        <TaskItem key={task.id} task={task} />
                      ))}
                      {upcomingTasks.length < tasks.filter((t) => !t.completed).length && (
                        <Button asChild variant="link" className="w-full mt-2">
                          <Link to="/taches">Voir toutes les tâches</Link>
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="overdue">
                  {overdueTasks.length === 0 ? (
                    <div className="text-center py-6 text-green-600 dark:text-green-400">
                      <CheckSquare className="h-8 w-8 mx-auto mb-2" />
                      <p>Aucune tâche en retard</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {overdueTasks.map((task) => (
                        <TaskItem key={task.id} task={task} overdue={true} />
                      ))}
                      {overdueTasks.length < taskStats.overdue && (
                        <Button asChild variant="link" className="w-full mt-2">
                          <Link to="/taches">Voir toutes les tâches en retard</Link>
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-purple-100 dark:border-purple-900/30">
            <CardHeader>
              <CardTitle>Résumé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-purple-100/60 dark:bg-purple-900/30 p-2 rounded-full mr-3 backdrop-blur-sm">
                      <CheckSquare className="h-5 w-5 text-purple-600" />
                    </div>
                    <span>Aujourd'hui</span>
                  </div>
                  <span className="font-medium text-lg">{taskStats.today}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-100/60 dark:bg-blue-900/30 p-2 rounded-full mr-3 backdrop-blur-sm">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <span>Demain</span>
                  </div>
                  <span className="font-medium text-lg">{taskStats.tomorrow}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-green-100/60 dark:bg-green-900/30 p-2 rounded-full mr-3 backdrop-blur-sm">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <span>Cette semaine</span>
                  </div>
                  <span className="font-medium text-lg">{taskStats.thisWeek}</span>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100/60 dark:border-gray-700/60">
                  <p className="text-muted-foreground text-sm mb-3">Accès rapides</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm"
                    >
                      <Link to="/calendar">
                        <Calendar className="h-4 w-4 mr-2" />
                        Calendrier
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm"
                    >
                      <Link to="/notifications">
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section des raccourcis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-purple-100 dark:border-purple-900/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-purple-600" />
                Tâches individuelles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Gérez vos tâches personnelles</p>
              <Button asChild variant="outline" className="w-full bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm">
                <Link to="/taches">Voir mes tâches</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-purple-100 dark:border-purple-900/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Tâches de groupe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Collaborez avec votre équipe</p>
              <Button asChild variant="outline" className="w-full bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm">
                <Link to="/groupes">Voir les tâches de groupe</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-purple-100 dark:border-purple-900/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Planning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Visualisez votre emploi du temps</p>
              <Button asChild variant="outline" className="w-full bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm">
                <Link to="/calendar">Voir le planning</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

interface TaskItemProps {
  task: Task
  overdue?: boolean
}

const TaskItem: React.FC<TaskItemProps> = ({ task, overdue = false }) => {
  const getDateDisplay = () => {
    if (!task.dueDate) return null

    const date = new Date(task.dueDate)

    if (isToday(date)) {
      return `Aujourd'hui à ${format(date, "HH:mm")}`
    } else if (isTomorrow(date)) {
      return `Demain à ${format(date, "HH:mm")}`
    } else {
      return format(date, "dd/MM/yyyy à HH:mm")
    }
  }

  const priorityColors = {
    high: "bg-red-100/60 text-red-800 dark:bg-red-900/30 dark:text-red-300 backdrop-blur-sm",
    medium: "bg-yellow-100/60 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 backdrop-blur-sm",
    low: "bg-green-100/60 text-green-800 dark:bg-green-900/30 dark:text-green-300 backdrop-blur-sm",
  }

  return (
    <div
      className={`p-3 rounded-lg border backdrop-blur-md ${
        overdue
          ? "border-red-200 dark:border-red-800 bg-red-50/60 dark:bg-red-900/20"
          : "border-gray-100 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{task.title}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>{task.priority}</span>
      </div>
      {task.dueDate && (
        <div
          className={`text-sm mt-1 flex items-center ${
            overdue ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
          }`}
        >
          <Clock className="h-3 w-3 mr-1" />
          {getDateDisplay()}
          {overdue && <AlertTriangle className="h-3 w-3 ml-1" />}
        </div>
      )}
    </div>
  )
}

export default Dashboard
