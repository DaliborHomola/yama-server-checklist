import Home from "@mui/icons-material/Home";
import Star from "@mui/icons-material/Star";
import type { DbClient } from "@tanstack/react-db";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import type { Navigation } from "wcz-layout";
import { getUser, LayoutProvider, rootRouteHead, setLanguageFromRequest } from "wcz-layout";
import { useTranslation } from "wcz-layout/hooks";
import { hasPermission } from "wcz-layout/utils";
import { useTheme } from "~/hooks/useTheme";

// Load additional dayjs locales (English is built-in)
import "dayjs/locale/cs";

interface RouterContext {
  queryClient: QueryClient;
  dbClient: DbClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context }) => {
    await setLanguageFromRequest();
    const user = await getUser({ queryClient: context.queryClient });
    return { user };
  },
  head: () => rootRouteHead(),
  shellComponent: RootDocument,
});

function RootDocument({ children }: Readonly<{ children: React.ReactNode }>) {
  const { t, i18n } = useTranslation();
  const { user } = Route.useRouteContext();

  const navigation: Navigation = [
    {
      kind: "item",
      to: "/",
      title: t("Homepage"),
      icon: <Home />,
    },
    {
      kind: "item",
      to: "/todos",
      title: t("Todo.Todos"),
      icon: <Star />,
      hidden: !hasPermission(user, "admin"),
    },
  ];

  const theme = useTheme(i18n.language);

  return (
    <html lang={i18n.language} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <LayoutProvider navigation={navigation} theme={theme}>
          {children}
        </LayoutProvider>
        <Scripts />
      </body>
    </html>
  );
}
