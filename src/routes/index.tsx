import { Container } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "wcz-layout/utils";

export const Route = createFileRoute("/")({
  component: Home,
  beforeLoad: requireAuth(),
});

function Home() {
  return <Container maxWidth="xl"></Container>;
}
