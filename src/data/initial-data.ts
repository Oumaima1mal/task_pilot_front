
import { Task, TaskCategory, TaskPriority, TaskStatus } from "@/types/task";
import { Group, User } from "@/types/group";

export const initialUsers: User[] = [
  {
    id: "1",
    name: "Thomas Martin",
    email: "thomas.martin@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
  },
  {
    id: "2",
    name: "Sophie Dubois",
    email: "sophie.dubois@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lily"
  },
  {
    id: "3",
    name: "Lucas Bernard",
    email: "lucas.bernard@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Max"
  }
];

export const initialGroups: Group[] = [
  {
    id: "1",
    name: "Équipe Marketing",
    description: "Équipe responsable des campagnes marketing",
    createdAt: new Date("2024-01-15"),
    createdBy: "1",
    members: [initialUsers[0], initialUsers[1]]
  },
  {
    id: "2",
    name: "Développement Web",
    description: "Équipe de développement web",
    createdAt: new Date("2024-02-01"),
    createdBy: "2",
    members: [initialUsers[1], initialUsers[2]]
  }
];

export const initialTasks: Task[] = [
  {
    id: "1",
    title: "Préparer la présentation client",
    description: "Créer une présentation pour la réunion de la semaine prochaine",
    completed: false,
    createdAt: new Date("2024-04-20"),
    dueDate: new Date("2024-04-25"),
    priority: "high",
    category: "work",
    reminder: new Date("2024-04-24")
  },
  {
    id: "2",
    title: "Révision du code",
    description: "Revoir le code du nouveau module",
    completed: false,
    createdAt: new Date("2024-04-21"),
    dueDate: new Date("2024-04-23"),
    priority: "medium",
    category: "work",
    reminder: new Date("2024-04-23")
  },
  {
    id: "3",
    title: "Rendez-vous médical",
    description: "Consultation annuelle",
    completed: false,
    createdAt: new Date("2024-04-22"),
    dueDate: new Date("2024-04-30"),
    priority: "low",
    category: "health"
  },
  {
    id: "4",
    title: "Campagne réseau social",
    description: "Préparer la campagne Facebook pour le nouveau produit",
    completed: false,
    createdAt: new Date("2024-04-15"),
    dueDate: new Date("2024-04-28"),
    priority: "high",
    category: "work",
    groupId: "1",
    memberStatuses: [
      {
        userId: "1",
        status: "in_progress",
        updatedAt: new Date("2024-04-16")
      },
      {
        userId: "2",
        status: "pending",
        updatedAt: new Date("2024-04-15")
      }
    ]
  },
  {
    id: "5",
    title: "Optimisation du site",
    description: "Améliorer les performances du site web",
    completed: false,
    createdAt: new Date("2024-04-18"),
    dueDate: new Date("2024-04-29"),
    priority: "medium",
    category: "work",
    groupId: "2",
    memberStatuses: [
      {
        userId: "2",
        status: "in_progress",
        updatedAt: new Date("2024-04-19")
      },
      {
        userId: "3",
        status: "in_progress",
        updatedAt: new Date("2024-04-20")
      }
    ]
  }
];
