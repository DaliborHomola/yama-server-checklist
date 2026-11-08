import { defineConfig } from "drizzle-kit";
import { loadEnv } from "vite-plus";

const env = Object.assign(process.env, loadEnv("development", process.cwd(), ""));

export default defineConfig({
  schema: "./src/server/db/schemas",
  out: "./src/server/db/migrations",
  dialect: "postgresql",
  schemaFilter: [decodeURIComponent(new URL(env.DATABASE_URL).username)],
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
