import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import fs from "fs";
import { loadConfig } from "@/src/lib/config";

// Ensure data directory exists
fs.mkdirSync("data", { recursive: true });

const db = new Database("data/app.db");
db.pragma("journal_mode = WAL");

export const auth = betterAuth({
  database: db,
  secret: loadConfig().authSecret,
  baseURL: loadConfig().authUrl,
  emailAndPassword: {
    enabled: true,
  },
});
