"use client"

import type React from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { CheckSquare, List, LayoutDashboard, LogOut, Users, Calendar, Bell } from 'lucide-react'
import NotificationIndicator from "@/components/NotificationIndicator"
import { useTaskContext } from "@/context/TaskContext"

const Header: React.FC = () => {
  const location = useLocation()
  const { tasks, getOverdueTasks, getTodayTasks } = useTaskContext()

  const overdueTasks = getOverdueTasks()
  const todayTasks = getTodayTasks()
  const completedTasks = tasks.filter(task => task.completed).length
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user")
    window.location.href = "/login"
  }

  return (
    <header className="border-b bg-white dark:bg-gray-800 py-3 px-4 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CheckSquare className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">TaskPilot</span>
        </div>

        <nav className="hidden md:flex items-center space-x-4">
          <Link to="/dashboard">
            <Button
              variant={location.pathname === "/dashboard" ? "default" : "ghost"}
              className="flex items-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Tableau de bord
            </Button>
          </Link>
          <Link to="/taches">
            <Button variant={location.pathname === "/taches" ? "default" : "ghost"} className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Mes tâches
            </Button>
          </Link>
          <Link to="/groupes">
            <Button
              variant={location.pathname === "/groupes" ? "default" : "ghost"}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Groupes
            </Button>
          </Link>
          <Link to="/calendar">
            <Button
              variant={location.pathname === "/calendar" ? "default" : "ghost"}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Calendrier
            </Button>
          </Link>
        </nav>

        <div className="flex items-center space-x-2">
          {/* Statistiques en version compacte */}
          <div className="hidden lg:flex gap-4 items-center text-sm text-muted-foreground mr-4">
            <div className="flex items-center gap-1">
              <span>Aujourd'hui: {todayTasks.length}</span>
            </div>
            {overdueTasks.length > 0 && (
              <div className="text-destructive flex items-center gap-1">
                <span>En retard: {overdueTasks.length}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span>Progrès: {completionRate}%</span>
            </div>
          </div>
          
          {/* Indicateur de notifications */}
          <NotificationIndicator />
          
          <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header