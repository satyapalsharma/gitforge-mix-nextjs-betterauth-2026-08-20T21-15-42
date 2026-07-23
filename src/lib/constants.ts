export const TASK_STATUSES = [
  "todo",
  "in_progress",
  "review",
  "done",
  "blocked",
] as const;

export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export const PROJECT_STATUSES = [
  "planning",
  "active",
  "on_hold",
  "completed",
  "archived",
] as const;

export const USER_ROLES = ["owner", "admin", "member"] as const;

export const TEAM_ROLES = ["lead", "member"] as const;
