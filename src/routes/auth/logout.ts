import { createFileRoute } from "@tanstack/react-router";
import { handleLogout } from "wcz-layout/auth";

export const Route = createFileRoute("/auth/logout")({
  server: {
    handlers: {
      GET: () => handleLogout(),
    },
  },
});
