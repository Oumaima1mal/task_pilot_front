export type TaskStatus = "à faire" | "en cours" | "terminée";

export interface Task {
  id: number;
  titre: string;
  description?: string;
  statut: TaskStatus;
  date_debut?: string;
  date_fin?: string;
  duree?: number;
  utilisateur_id: number;
  groupe_id?: number;
}

export interface CreateTaskInput {
  titre: string;
  description?: string;
  statut?: TaskStatus;
  date_debut?: string;
  date_fin?: string;
  duree?: number;
  utilisateur_id: number;
  groupe_id?: number;
}
