import { betterAuth } from "better-auth";
import { Database } from "better-sqlite3";
import { getDb } from "./db";

export const auth = betterAuth({
  database: {
    db: getDb(),
    type: "sqlite",
  },
  user: {
    additionalFields: {
      displayName: { type: "string", required: false },
      bio: { type: "string", required: false },
      avatarUrl: { type: "string", required: false },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.User;
