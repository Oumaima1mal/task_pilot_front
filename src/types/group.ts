export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface Group {
  id: string
  name: string
  description?: string
  createdAt: Date
  createdBy: string
  members: User[]
}

export interface CreateGroupInput {
  name: string
  description?: string
}
export type GroupMember = {
  id: string
  nom: string
  prenom: string
  role: string
}
