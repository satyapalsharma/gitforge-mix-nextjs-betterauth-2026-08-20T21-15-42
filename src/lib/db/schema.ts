export const CREATE_WORKSPACES_TABLE = `
  CREATE TABLE IF NOT EXISTS workspace (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  )
`;

export const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    emailVerified INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    displayName TEXT,
    bio TEXT,
    avatarUrl TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  )
`;

export const CREATE_USER_PROFILES_TABLE = `
  CREATE TABLE IF NOT EXISTS user_profile (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL UNIQUE,
    displayName TEXT,
    bio TEXT,
    avatarUrl TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
  )
`;

export const CREATE_TEAMS_TABLE = `
  CREATE TABLE IF NOT EXISTS team (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    workspaceId TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (workspaceId) REFERENCES workspace(id) ON DELETE CASCADE
  )
`;

export const CREATE_TEAM_MEMBERS_TABLE = `
  CREATE TABLE IF NOT EXISTS team_member (
    id TEXT PRIMARY KEY,
    teamId TEXT NOT NULL,
    userId TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (teamId) REFERENCES team(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
    UNIQUE(teamId, userId)
  )
`;

export const CREATE_PROJECTS_TABLE = `
  CREATE TABLE IF NOT EXISTS project (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'planning',
    workspaceId TEXT NOT NULL,
    teamId TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (workspaceId) REFERENCES workspace(id) ON DELETE CASCADE,
    FOREIGN KEY (teamId) REFERENCES team(id) ON DELETE SET NULL
  )
`;

export const CREATE_TASKS_TABLE = `
  CREATE TABLE IF NOT EXISTS task (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo',
    priority TEXT NOT NULL DEFAULT 'medium',
    projectId TEXT NOT NULL,
    assigneeId TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (projectId) REFERENCES project(id) ON DELETE CASCADE,
    FOREIGN KEY (assigneeId) REFERENCES user(id) ON DELETE SET NULL
  )
`;
