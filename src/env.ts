import { createEnv } from "wcz-layout/utils";
import { z } from "zod";

export const clientEnv = createEnv({
  clientPrefix: "VITE_",
  client: {},
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});

export const serverEnv = createEnv({
  server: {
    ENTRA_CLIENT_ID: z.string(),
    ENTRA_TENANT_ID: z.string(),
    ENTRA_CLIENT_SECRET: z.string(),
    AWS_ISSUER: z.url().optional(),
    AWS_DOMAIN: z.url().optional(),
    AWS_CLIENT_ID: z.string().optional(),
    AWS_CLIENT_SECRET: z.string().optional(),
    SESSION_SECRET: z.string().min(32),
    DATABASE_URL: z.string(),
    DATABASE_AUTO_MIGRATE: z
      .string()
      .transform((string) => string === "true")
      .default(true),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
