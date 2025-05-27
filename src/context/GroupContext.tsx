"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import type { Group, User, CreateGroupInput, GroupMember } from "@/types/group"
import { useToast } from "@/hooks/use-toast"
import { groupService } from "@/services/groupApi"
import logger from "@/utils/logger"

interface GroupContextType {
  groups: Group[]
  users: User[]
  groupMembers: { [groupId: string]: GroupMember[] }
  loading: boolean
  error: string | null
  addGroup: (group: CreateGroupInput) => Promise<void>
  updateGroup: (id: string, group: Partial<Group>) => Promise<void>
  deleteGroup: (id: string) => Promise<void>
  addUserToGroup: (groupId: string, userId: string) => Promise<void>
  removeUserFromGroup: (groupId: string, userId: string) => Promise<void>
  getGroupById: (groupId: string) => Group | undefined
  refreshGroups: () => Promise<void>
  fetchGroupMembers: (groupId: string) => Promise<void>
}

const GroupContext = createContext<GroupContextType | undefined>(undefined)

export function useGroupContext() {
  const context = useContext(GroupContext)
  if (!context) {
    throw new Error("useGroupContext doit être utilisé au sein d'un GroupProvider")
  }
  return context
}

interface GroupProviderProps {
  children: ReactNode
}

export function GroupProvider({ children }: GroupProviderProps) {
  const [groups, setGroups] = useState<Group[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [groupMembers, setGroupMembers] = useState<{ [groupId: string]: GroupMember[] }>({})
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState<boolean>(false)

  // Refs pour éviter les re-renders
  const isRefreshingRef = useRef(false)
  const mountedRef = useRef(true)

  const { toast } = useToast()

  // Fonction refreshGroups mémorisée
  const refreshGroups = useCallback(async () => {
    if (isRefreshingRef.current || !mountedRef.current) {
      console.log("Refresh déjà en cours ou composant démonté, requête ignorée")
      return
    }

    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        logger.warn("Pas de token, impossible de charger les groupes")
        setGroups([])
        setUsers([])
        setLoading(false)
        setInitialized(true)
        return
      }

      console.log("Début du chargement des groupes et utilisateurs...")
      isRefreshingRef.current = true
      setLoading(true)
      setError(null)

      // Charger groupes et utilisateurs en parallèle
      const [fetchedGroups, fetchedUsers] = await Promise.all([groupService.getAllGroups(), groupService.getAllUsers()])

      if (mountedRef.current) {
        logger.info(`${fetchedGroups.length} groupes et ${fetchedUsers.length} utilisateurs chargés`)
        setGroups(fetchedGroups)
        setUsers(fetchedUsers)
        setError(null)

        // Sauvegarder en localStorage
        localStorage.setItem("groups", JSON.stringify(fetchedGroups))
        localStorage.setItem("users", JSON.stringify(fetchedUsers))
      }
    } catch (err: any) {
      logger.error("Erreur lors du chargement des groupes:", err)

      if (mountedRef.current) {
        setError("Impossible de charger les groupes. Veuillez réessayer plus tard.")

        // Essayer de charger depuis localStorage en cas d'erreur
        try {
          const savedGroups = localStorage.getItem("groups")
          const savedUsers = localStorage.getItem("users")

          if (savedGroups && savedUsers) {
            logger.info("Utilisation des données sauvegardées localement")
            const parsedGroups = JSON.parse(savedGroups).map((group: any) => ({
              ...group,
              createdAt: new Date(group.createdAt),
            }))
            const parsedUsers = JSON.parse(savedUsers)

            setGroups(parsedGroups)
            setUsers(parsedUsers)
          }
        } catch (e) {
          logger.error("Erreur parsing data from localStorage:", e)
        }
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
        setInitialized(true)
      }
      isRefreshingRef.current = false
    }
  }, [])

  // Fonction pour récupérer les membres d'un groupe
  const fetchGroupMembers = useCallback(async (groupId: string) => {
    try {
      logger.info(`Chargement des membres du groupe ${groupId}`)
      const members = await groupService.getGroupMembers(groupId)

      if (mountedRef.current) {
        setGroupMembers((prev) => ({ ...prev, [groupId]: members }))
      }
    } catch (err) {
      logger.error("Erreur lors du chargement des membres du groupe:", err)
      if (mountedRef.current) {
        setError("Impossible de charger les membres du groupe.")
      }
      throw err
    }
  }, [])

  // Fonctions mémorisées
  const addGroup = useCallback(
    async (group: CreateGroupInput) => {
      try {
        setLoading(true)
        logger.info("Création d'un nouveau groupe:", group.name)
        const newGroup = await groupService.createGroup(group)

        if (mountedRef.current) {
          setGroups((prevGroups) => [...prevGroups, newGroup])
          toast({
            title: "Groupe créé",
            description: `Le groupe "${group.name}" a été créé avec succès.`,
          })
        }
      } catch (err) {
        logger.error("Erreur lors de la création du groupe:", err)
        if (mountedRef.current) {
          toast({
            title: "Erreur",
            description: "Impossible de créer le groupe",
            variant: "destructive",
          })
        }
        throw err
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    },
    [toast],
  )

  const updateGroup = useCallback(
    async (id: string, updatedFields: Partial<Group>) => {
      try {
        setLoading(true)
        logger.info(`Mise à jour du groupe ${id}:`, updatedFields)
        const updatedGroup = await groupService.updateGroup(id, updatedFields)

        if (mountedRef.current) {
          setGroups((prevGroups) => prevGroups.map((group) => (group.id === id ? updatedGroup : group)))
          toast({
            title: "Groupe mis à jour",
            description: "Les informations du groupe ont été mises à jour.",
          })
        }
      } catch (err) {
        logger.error("Erreur lors de la mise à jour du groupe:", err)
        if (mountedRef.current) {
          toast({
            title: "Erreur",
            description: "Impossible de mettre à jour le groupe",
            variant: "destructive",
          })
        }
        throw err
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    },
    [toast],
  )

  const deleteGroup = useCallback(
    async (id: string) => {
      try {
        setLoading(true)
        logger.info(`Suppression du groupe ${id}`)
        await groupService.deleteGroup(id)

        if (mountedRef.current) {
          setGroups((prevGroups) => prevGroups.filter((group) => group.id !== id))
          toast({
            title: "Groupe supprimé",
            description: "Le groupe a été supprimé de votre liste.",
          })
        }
      } catch (err) {
        logger.error("Erreur lors de la suppression du groupe:", err)
        if (mountedRef.current) {
          toast({
            title: "Erreur",
            description: "Impossible de supprimer le groupe",
            variant: "destructive",
          })
        }
        throw err
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    },
    [toast],
  )

  const addUserToGroup = useCallback(
    async (groupId: string, userId: string) => {
      try {
        setLoading(true)
        logger.info(`Ajout de l'utilisateur ${userId} au groupe ${groupId}`)
        await groupService.addUserToGroup(groupId, userId)

        if (mountedRef.current) {
          const userToAdd = users.find((user) => user.id === userId)
          if (userToAdd) {
            setGroups((prevGroups) =>
              prevGroups.map((group) => {
                if (group.id === groupId) {
                  return {
                    ...group,
                    members: [...group.members, userToAdd],
                  }
                }
                return group
              }),
            )
          }

          toast({
            title: "Membre ajouté",
            description: "Le membre a été ajouté au groupe.",
          })
        }
      } catch (err) {
        logger.error("Erreur lors de l'ajout du membre au groupe:", err)
        if (mountedRef.current) {
          toast({
            title: "Erreur",
            description: "Impossible d'ajouter le membre au groupe",
            variant: "destructive",
          })
        }
        throw err
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    },
    [users, toast],
  )

  const removeUserFromGroup = useCallback(
    async (groupId: string, userId: string) => {
      try {
        setLoading(true)
        logger.info(`Retrait de l'utilisateur ${userId} du groupe ${groupId}`)
        await groupService.removeUserFromGroup(groupId, userId)

        if (mountedRef.current) {
          setGroups((prevGroups) =>
            prevGroups.map((group) => {
              if (group.id === groupId) {
                return {
                  ...group,
                  members: group.members.filter((member) => member.id !== userId),
                }
              }
              return group
            }),
          )

          // Mettre à jour aussi les membres du groupe
          setGroupMembers((prev) => ({
            ...prev,
            [groupId]: prev[groupId]?.filter((member) => member.id !== userId) || [],
          }))

          toast({
            title: "Membre retiré",
            description: "Le membre a été retiré du groupe.",
          })
        }
      } catch (err) {
        logger.error("Erreur lors du retrait du membre du groupe:", err)
        if (mountedRef.current) {
          toast({
            title: "Erreur",
            description: "Impossible de retirer le membre du groupe",
            variant: "destructive",
          })
        }
        throw err
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    },
    [toast],
  )

  const getGroupById = useCallback(
    (groupId: string): Group | undefined => {
      return groups.find((group) => group.id === groupId)
    },
    [groups],
  )

  // Effet pour le chargement initial
  useEffect(() => {
    let isMounted = true
    mountedRef.current = true

    const initializeGroups = async () => {
      if (isMounted) {
        console.log("Initialisation du GroupContext")
        await refreshGroups()
      }
    }

    initializeGroups()

    return () => {
      isMounted = false
      mountedRef.current = false
    }
  }, [refreshGroups])

  // Ne pas rendre si pas initialisé
  if (!initialized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  const contextValue = {
    groups,
    users,
    groupMembers,
    loading,
    error,
    addGroup,
    updateGroup,
    deleteGroup,
    addUserToGroup,
    removeUserFromGroup,
    getGroupById,
    refreshGroups,
    fetchGroupMembers,
  }

  return <GroupContext.Provider value={contextValue}>{children}</GroupContext.Provider>
}
