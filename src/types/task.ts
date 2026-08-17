export type TaskStatus = "todo" | "in_progress" | "review" | "done" | "blocked";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
  createdAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
  projectId?: string;
  reporterId?: string;
  tags?: string[];}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
}
