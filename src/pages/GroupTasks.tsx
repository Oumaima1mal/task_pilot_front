"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users, UserPlus, UserX, List, Settings, CheckSquare, Clock, Calendar } from "lucide-react"
import { useGroupContext } from "@/context/GroupContext"
import { useTaskContext } from "@/context/TaskContext"
import type { Task } from "@/types/task"
import type { Group } from "@/types/group"
import CreateGroupForm from "@/components/CreateGroupForm"
import CreateTaskForm from "@/components/CreateTaskForm"
import GroupTaskDetails from "@/components/GroupTaskDetails"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Header from "@/components/layout/Header"

const GroupTasks = () => {
  const {
    groups,
    users,
    addUserToGroup,
    removeUserFromGroup,
    groupMembers,
    fetchGroupMembers,
    loading,
    refreshGroups,
  } = useGroupContext()
  const { tasks, getGroupTasks, refreshTasks } = useTaskContext()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false)
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Effet pour sélectionner automatiquement le premier groupe quand les groupes sont chargés
  useEffect(() => {
    if (groups.length > 0 && !selectedGroup && !isInitialized) {
      console.log("Sélection automatique du premier groupe:", groups[0].name)
      setSelectedGroup(groups[0])
      setIsInitialized(true)
    } else if (groups.length === 0 && !loading) {
      setSelectedGroup(null)
      setIsInitialized(true)
    }
  }, [groups, selectedGroup, loading, isInitialized])

  // Effet pour charger les membres du groupe sélectionné
  useEffect(() => {
    if (selectedGroup && !groupMembers[selectedGroup.id]) {
      console.log("Chargement des membres pour le groupe:", selectedGroup.name)
      fetchGroupMembers(selectedGroup.id)
    }
  }, [selectedGroup, groupMembers, fetchGroupMembers])

  // Effet pour rafraîchir les groupes au montage
  useEffect(() => {
    console.log("Montage du composant GroupTasks - Rafraîchissement des groupes")
    refreshGroups()
  }, [])

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group)
    setIsFormOpen(true)
  }

  const handleAddMember = async () => {
    if (selectedGroup && selectedUserId) {
      try {
        await addUserToGroup(selectedGroup.id, selectedUserId)
        setIsAddMemberDialogOpen(false)
        setSelectedUserId("")
        // Rafraîchir les membres du groupe
        await fetchGroupMembers(selectedGroup.id)
      } catch (error) {
        console.error("Erreur lors de l'ajout du membre:", error)
      }
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (selectedGroup) {
      try {
        await removeUserFromGroup(selectedGroup.id, userId)
        // Rafraîchir les membres du groupe
        await fetchGroupMembers(selectedGroup.id)
      } catch (error) {
        console.error("Erreur lors de la suppression du membre:", error)
      }
    }
  }

  const handleOpenTaskDetails = (task: Task) => {
    setSelectedTask(task)
    setIsTaskDetailsOpen(true)
  }

  const handleGroupSelection = (group: Group) => {
    console.log("Sélection du groupe:", group.name)
    setSelectedGroup(group)
    // Charger les membres si pas encore chargés
    if (!groupMembers[group.id]) {
      fetchGroupMembers(group.id)
    }
  }

  const filteredUsers = users.filter((user) => !selectedGroup?.members.some((member) => member.id === user.id))

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const groupTasks = selectedGroup ? getGroupTasks(selectedGroup.id) : []

  const priorityColors: Record<string, string> = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800",
  }

  const renderTaskButton = () => (
    <Button
      onClick={() => setIsTaskFormOpen(true)}
      className="bg-gradient-to-r from-purple-600 to-pink-600"
      disabled={!selectedGroup}
    >
      <Plus className="h-5 w-5 mr-2" />
      Nouvelle tâche
    </Button>
  )

  const handleTaskFormSubmit = async (isOpen: boolean) => {
    setIsTaskFormOpen(isOpen)
    if (!isOpen) {
      // Rafraîchir les tâches après avoir ajouté une tâche
      try {
        console.log("Rafraîchissement des tâches après création")
        await refreshTasks()
      } catch (error) {
        console.error("Erreur lors du rafraîchissement des tâches:", error)
      }
    }
  }

  const handleFormClose = async (isOpen: boolean) => {
    setIsFormOpen(isOpen)
    if (!isOpen) {
      setEditingGroup(null)
      // Rafraîchir les groupes après création/modification
      try {
        console.log("Rafraîchissement des groupes après création/modification")
        await refreshGroups()
      } catch (error) {
        console.error("Erreur lors du rafraîchissement des groupes:", error)
      }
    }
  }

  // Affichage du loader pendant le chargement initial
  if (loading && !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des groupes...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold  mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Tâches de groupe
            </span>
          </h1>
          <br />
          <div className="flex gap-4">
            <Button asChild variant="outline">
              <div onClick={() => setIsFormOpen(true)}>
                <Users className="h-5 w-5 mr-2" />
                Nouveau groupe
              </div>
            </Button>
            {renderTaskButton()}
          </div>
        </div>

        {groups.length === 0 ? (
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-purple-100 dark:border-purple-900/30">
            <CardContent className="p-6">
              <div className="text-center py-10">
                <Users className="h-16 w-16 mx-auto text-purple-300 dark:text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aucun groupe</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Créez un nouveau groupe pour commencer à collaborer
                </p>
                <Button onClick={() => setIsFormOpen(true)} className="bg-gradient-to-r from-purple-600 to-pink-600">
                  <Plus className="h-5 w-5 mr-2" />
                  Créer un groupe
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-purple-100 dark:border-purple-900/30">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Mes groupes ({groups.length})</span>
                  <Button onClick={() => setIsFormOpen(true)} size="sm" variant="ghost">
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {groups.map((group) => (
                    <Button
                      key={group.id}
                      variant={selectedGroup?.id === group.id ? "secondary" : "ghost"}
                      className="w-full justify-start font-normal py-2 px-3"
                      onClick={() => handleGroupSelection(group)}
                    >
                      <Users className="h-4 w-4 mr-2 opacity-70" />
                      <span className="truncate">{group.name}</span>
                      <span className="ml-auto bg-secondary rounded-full px-2 py-0.5 text-xs">
                        {group.members.length}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-purple-100 dark:border-purple-900/30">
              {selectedGroup ? (
                <>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{selectedGroup.name}</CardTitle>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditGroup(selectedGroup)}>
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button size="sm" onClick={() => setIsAddMemberDialogOpen(true)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Ajouter un membre
                        </Button>
                      </div>
                    </div>
                    {selectedGroup.description && (
                      <p className="text-sm text-muted-foreground">{selectedGroup.description}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="tasks">
                      <TabsList className="mb-4">
                        <TabsTrigger value="tasks">
                          <List className="h-4 w-4 mr-2" />
                          Tâches ({groupTasks.length})
                        </TabsTrigger>
                        <TabsTrigger value="members">
                          <Users className="h-4 w-4 mr-2" />
                          Membres ({groupMembers[selectedGroup.id]?.length || 0})
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="tasks" className="space-y-4">
                        <div className="flex justify-end mb-4">
                          <Button onClick={() => setIsTaskFormOpen(true)} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter une tâche
                          </Button>
                        </div>

                        {groupTasks.length === 0 ? (
                          <div className="text-center py-8">
                            <List className="h-12 w-12 mx-auto text-purple-300 dark:text-purple-600 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Aucune tâche</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">Créez des tâches pour ce groupe</p>
                            <Button
                              onClick={() => setIsTaskFormOpen(true)}
                              className="bg-gradient-to-r from-purple-600 to-pink-600"
                            >
                              <Plus className="h-5 w-5 mr-2" />
                              Créer une tâche
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {groupTasks.map((task) => {
                              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed

                              return (
                                <div
                                  key={task.id}
                                  className={cn(
                                    "task-item bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 cursor-pointer transition-all hover:shadow-md",
                                    isOverdue && "border-l-4 border-l-red-500",
                                  )}
                                  onClick={() => handleOpenTaskDetails(task)}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        {task.completed ? (
                                          <CheckSquare className="h-5 w-5 text-green-500" />
                                        ) : (
                                          <Clock className="h-5 w-5 text-blue-500" />
                                        )}
                                        <h3 className="font-medium">{task.title}</h3>
                                      </div>

                                      {task.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                                      )}

                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {task.dueDate && (
                                          <div
                                            className={cn(
                                              "flex items-center gap-1 text-xs",
                                              isOverdue ? "text-destructive" : "text-muted-foreground",
                                            )}
                                          >
                                            <Calendar className="h-3 w-3" />
                                            <span>{format(new Date(task.dueDate), "dd/MM/yyyy")}</span>
                                          </div>
                                        )}

                                        <Badge className={cn("text-xs", priorityColors[task.priority])}>
                                          {task.priority === "high"
                                            ? "Priorité haute"
                                            : task.priority === "medium"
                                              ? "Priorité moyenne"
                                              : "Priorité basse"}
                                        </Badge>
                                      </div>
                                    </div>

                                    <div className="flex -space-x-2">
                                      {task.memberStatuses?.slice(0, 3).map((status) => {
                                        const member = users.find((u) => u.id === status.userId)
                                        if (!member) return null

                                        return (
                                          <Avatar key={status.userId} className="h-8 w-8 border-2 border-white">
                                            <AvatarImage src={member.avatar || "/placeholder.svg"} />
                                            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                          </Avatar>
                                        )
                                      })}

                                      {(task.memberStatuses?.length || 0) > 3 && (
                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-white">
                                          +{(task.memberStatuses?.length || 0) - 3}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="members">
                        <div className="space-y-4">
                          {groupMembers[selectedGroup.id] ? (
                            groupMembers[selectedGroup.id].length > 0 ? (
                              groupMembers[selectedGroup.id].map((member) => (
                                <div
                                  key={member.id}
                                  className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700"
                                >
                                  <div className="flex items-center space-x-3">
                                    <Avatar>
                                      <AvatarFallback>{getInitials(`${member.prenom} ${member.nom}`)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">{`${member.prenom} ${member.nom}`}</p>
                                      <p className="text-sm text-muted-foreground">{member.role}</p>
                                    </div>
                                  </div>
                                  <Button size="sm" variant="ghost" onClick={() => handleRemoveMember(member.id)}>
                                    <UserX className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4">
                                <p className="text-muted-foreground">Aucun membre dans ce groupe</p>
                              </div>
                            )
                          ) : (
                            <div className="text-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500 mx-auto mb-2"></div>
                              <p className="text-muted-foreground">Chargement des membres...</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </>
              ) : (
                <CardContent className="p-6">
                  <div className="text-center py-10">
                    <Users className="h-16 w-16 mx-auto text-purple-300 dark:text-purple-600 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Sélectionnez un groupe</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Choisissez un groupe dans la liste pour voir ses tâches et membres
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        )}

        <CreateGroupForm
          open={isFormOpen}
          onOpenChange={handleFormClose}
          initialValues={editingGroup || undefined}
          isEditing={!!editingGroup}
        />

        <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Ajouter un membre</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Select onValueChange={setSelectedUserId} value={selectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un utilisateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredUsers.length === 0 ? (
                        <p className="text-center py-2 text-sm text-muted-foreground">
                          Tous les utilisateurs sont déjà membres
                        </p>
                      ) : (
                        filteredUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                              </Avatar>
                              <span>{user.name}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddMember} disabled={!selectedUserId}>
                Ajouter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <CreateTaskForm open={isTaskFormOpen} onOpenChange={handleTaskFormSubmit} groupId={selectedGroup?.id} />

        <GroupTaskDetails task={selectedTask} open={isTaskDetailsOpen} onOpenChange={setIsTaskDetailsOpen} />
      </div>
    </div>
  )
}

export default GroupTasks
