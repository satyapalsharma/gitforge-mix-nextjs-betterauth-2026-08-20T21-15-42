import Database from "better-sqlite3";
import {
  CREATE_WORKSPACES_TABLE,
  CREATE_WORKSPACE_MEMBERS_TABLE,
  CREATE_USERS_TABLE,
  CREATE_USER_PROFILES_TABLE,
  CREATE_TEAMS_TABLE,
  CREATE_TEAM_MEMBERS_TABLE,
  CREATE_PROJECTS_TABLE,
  CREATE_WORKSPACE_MEMBERS_TABLE,
  CREATE_TASKS_TABLE,
} from "./schema";
import { logger } from "../logger";

export function migrate(db: Database.Database): void {
  try {
    db.exec(CREATE_WORKSPACES_TABLE);
    db.exec(CREATE_WORKSPACE_MEMBERS_TABLE);
    db.exec(CREATE_USERS_TABLE);
    db.exec(CREATE_USER_PROFILES_TABLE);
    db.exec(CREATE_TEAMS_TABLE);
    db.exec(CREATE_TEAM_MEMBERS_TABLE);
    db.exec(CREATE_PROJECTS_TABLE);
    db.exec(CREATE_WORKSPACE_MEMBERS_TABLE);

    // Ensure tasks table exists with the latest schema
    db.exec(CREATE_TASKS_TABLE);

    // Add priority column if it doesn't already exist (for existing databases)
    const tableInfo = db
      .prepare("PRAGMA table_info(tasks)")
      .all() as { name: string }[];
    const hasPriority = tableInfo.some((col) => col.name === "priority");
    if (!hasPriority) {
      db.exec(
        "ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'medium'"
      );
      logger.info("Added priority column to tasks table");
    }

    logger.info("Database migrations completed");
  } catch (error) {
    logger.error("Migration failed", { error });
    throw error;
  }
}
