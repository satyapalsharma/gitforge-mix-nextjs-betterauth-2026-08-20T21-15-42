import Database from "better-sqlite3";
import { loadConfig } from "../config";
import { migrate } from "./migrations";
import { logger } from "../logger";

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const config = loadConfig();
    db = new Database(config.databasePath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    migrate(db);
    logger.info("Database initialized", { path: config.databasePath });
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
    logger.info("Database connection closed");
  }
}
