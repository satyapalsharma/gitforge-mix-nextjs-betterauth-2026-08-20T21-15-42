export type UserRole = "owner" | "admin" | "member";

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  userId: string;
  bio?: string;
  timezone?: string;
  preferences: Record<string, unknown>;
}

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
  workspaceId: string;
}

export interface UpdateUserInput {
  name?: string;
  avatarUrl?: string;
  bio?: string;
  timezone?: string;
  preferences?: Record<string, unknown>;
}
