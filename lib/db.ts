import Database from "better-sqlite3";
import fs from "fs";
import { migrate } from "@/src/lib/db/migrations";

// Ensure data directory exists
fs.mkdirSync("data", { recursive: true });

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database("data/app.db");
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    migrate(db);
  }
  return db;
}

export const dbInstance = new Database("data/app.db");
dbInstance.pragma("journal_mode = WAL");
