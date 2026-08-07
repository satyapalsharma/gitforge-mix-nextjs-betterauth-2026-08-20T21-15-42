import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { loadConfig } from "./config";

export const auth = betterAuth({
  database: {
    db: {
      get: () => import("./db").then((m) => m.getDb()),
    },
    type: "sqlite",
  },
  secret: loadConfig().authSecret,
  baseURL: loadConfig().authUrl,
  plugins: [nextCookies()],
});
