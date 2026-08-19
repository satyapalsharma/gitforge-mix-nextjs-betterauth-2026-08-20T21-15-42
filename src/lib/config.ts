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
  // During build (next build), env vars may not be present. Provide a
  // development fallback so the build can collect page data without failing.
  // At runtime, the real value is loaded from the environment.
  const isBuild = process.env.NEXT_PHASE === "phase-production-build";

  const authSecret =
    process.env.AUTH_SECRET ?? (isBuild ? "build-secret" : undefined);

  if (!authSecret) {
    throw new Error(`Missing required environment variable: AUTH_SECRET`);
  }

  return {
    nodeEnv: (process.env.NODE_ENV as AppConfig["nodeEnv"]) ?? "development",
    port: parseInt(process.env.PORT ?? "3000", 10),
    databasePath: process.env.DATABASE_PATH ?? "./data/taskflow.db",
    authSecret,
    authUrl: process.env.AUTH_URL ?? "http://localhost:3000/api/auth",
    corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  };
}
