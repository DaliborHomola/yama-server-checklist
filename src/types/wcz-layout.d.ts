declare module "virtual:wcz-layout" {
  export const permissions: typeof import("~/lib/auth/permissions").permissions;
  export const scopes: typeof import("~/lib/auth/scopes").scopes;
  export const serverEnv: typeof import("~/env").serverEnv;
}
