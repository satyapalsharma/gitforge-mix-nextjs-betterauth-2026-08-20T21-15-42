import Database from "better-sqlite3";
import fs from "fs";

// Ensure data directory exists
fs.mkdirSync("data", { recursive: true });

export const db = new Database("data/app.db");
db.pragma("journal_mode = WAL");
