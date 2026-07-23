export type ProjectStatus = "planning" | "active" | "on_hold" | "completed" | "archived";

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  teamId: string;
  workspaceId: string;
  createdBy: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  status?: ProjectStatus;
  teamId: string;
  workspaceId: string;
  createdBy: string;
  dueDate?: Date;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  dueDate?: Date;
}
