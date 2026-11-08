import { DbClient } from "@tanstack/react-db";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routerWithDbClient } from "@tanstack/react-router-with-db";
import { RouterError, RouterNotFound } from "wcz-layout/components";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const queryClient = new QueryClient();
  const dbClient = new DbClient({ queryClient });

  const router = createRouter({
    routeTree,
    context: {
      queryClient,
      dbClient,
    },
    defaultPreload: "intent",
    defaultErrorComponent: RouterError,
    defaultNotFoundComponent: RouterNotFound,
    scrollRestoration: true,
  });

  setupRouterSsrQueryIntegration({ router, queryClient });

  return routerWithDbClient(router, dbClient);
}
