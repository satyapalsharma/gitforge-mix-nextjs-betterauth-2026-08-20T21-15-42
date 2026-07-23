import "dotenv/config";

export interface AppConfig {
  nodeEnv: "development" | "production" | "test";
  port: number;
  databasePath: string;
  authSecret: string;
  authUrl: string;
  corsOrigin: string;
}

const requiredEnvVars = ["AUTH_SECRET"] as const;

function getEnvVar(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value === undefined && fallback === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? fallback!;
}

export function loadConfig(): AppConfig {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return {
    nodeEnv: (process.env.NODE_ENV as AppConfig["nodeEnv"]) ?? "development",
    port: parseInt(process.env.PORT ?? "3000", 10),
    databasePath: process.env.DATABASE_PATH ?? "./data/taskflow.db",
    authSecret: process.env.AUTH_SECRET!,
    authUrl: process.env.AUTH_URL ?? "http://localhost:3000/api/auth",
    corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  };
}
