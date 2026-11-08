import { createMiddleware } from "@tanstack/react-start";
import { DrizzleQueryError, sql } from "drizzle-orm";
import { DatabaseError } from "pg";
import { userMiddleware } from "wcz-layout/middleware";
import { db } from "../db";

export const databaseMiddleware = () =>
  createMiddleware()
    .middleware([userMiddleware])
    .server(async ({ next, context: { user } }) => {
      try {
        return await db.transaction(async (transaction) => {
          if (user?.name)
            await transaction.execute(sql`SELECT set_config('app.user_name', ${user.name}, true)`);
          return await next({ context: { db: transaction } });
        });
      } catch (error) {
        if (error instanceof DrizzleQueryError && error.cause instanceof DatabaseError)
          throw new Error(error.cause.detail ?? error.cause.message);
        throw error;
      }
    });
