import type { Permissions } from "wcz-layout/models";

export const permissions = {
  admin: ["wcz-developers"],
} as const satisfies Permissions;
