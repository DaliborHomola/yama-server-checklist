import { createFileRoute } from "@tanstack/react-router";
import { handleLogin } from "wcz-layout/auth";

export const Route = createFileRoute("/auth/login")({
  server: {
    handlers: {
      GET: () => handleLogin(),
    },
  },
});
