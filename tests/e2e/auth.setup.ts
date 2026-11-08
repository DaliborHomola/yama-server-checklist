import { test as setup } from "@playwright/test";
import { sealData } from "iron-session";
import { loadEnv } from "vite-plus";
import type { User } from "wcz-layout/models";
import { permissions } from "../../src/lib/auth/permissions";

/**
 * Skips the Microsoft login: seals the session cookie the way wcz-layout's session does
 * (iron-session, `app-session` cookie, the app's SESSION_SECRET), as `/auth/callback` does
 * after a real sign-in. The fake user holds the admin group. There is no refresh token, so
 * delegated API calls (Graph photo, other services) won't work in e2e.
 */
setup("sign in as admin", async ({ context, baseURL }) => {
  const { SESSION_SECRET } = loadEnv("test", process.cwd(), "");

  const user: User = {
    provider: "entra",
    name: "E2E Admin",
    email: "e2e.admin@wistron.com",
    department: "E2E",
    employeeId: "E2E0001",
    groups: [...permissions.admin],
  };

  const value = await sealData({ provider: "entra", user }, { password: SESSION_SECRET });

  await context.addCookies([
    { name: "app-session", value, url: baseURL, httpOnly: true, sameSite: "Lax" },
  ]);
  await context.storageState({ path: "tests/e2e/.auth/admin.json" });
});
