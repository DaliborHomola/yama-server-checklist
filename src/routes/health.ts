import { createFileRoute } from "@tanstack/react-router";
import { db } from "~/server/db";

export const Route = createFileRoute("/health")({
  server: {
    handlers: {
      GET: async () => {
        const checks = {
          status: "healthy",
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          database: await checkDatabase(),
        };

        return Response.json(checks);
      },
    },
  },
});

async function checkDatabase() {
  try {
    await db.execute("select 1");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}
