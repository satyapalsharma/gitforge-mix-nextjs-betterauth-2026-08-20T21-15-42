export interface Team {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: "lead" | "member";
  joinedAt: Date;
}

export interface CreateTeamInput {
  name: string;
  description?: string;
  workspaceId: string;
  createdBy: string;
}

export interface UpdateTeamInput {
  name?: string;
  description?: string;
}
