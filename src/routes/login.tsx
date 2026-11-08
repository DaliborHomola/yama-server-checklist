import { createFileRoute } from "@tanstack/react-router";
import { loginProvidersQueryOptions } from "wcz-layout";
import { LoginForm } from "wcz-layout/components";

export const Route = createFileRoute("/login")({
  loader: ({ context }) => context.queryClient.query(loginProvidersQueryOptions),
  component: LoginForm,
});
