import { createFileRoute } from "@tanstack/react-router";
import { handleCallback } from "wcz-layout/auth";

export const Route = createFileRoute("/auth/callback")({
  server: {
    handlers: {
      GET: () => handleCallback(),
    },
  },
});
