import { DrizzleQueryError, eq, sql, TransactionRollbackError } from "drizzle-orm";
import { DatabaseError } from "pg";
import { afterAll, describe, expect, it } from "vite-plus/test";
import { uuidv7 } from "wcz-layout/utils";
import { db, pool } from "~/server/db";
import { auditLogs } from "~/server/db/schemas/auditLog";
import { todoTable } from "~/server/db/schemas/todo";

// Needs the Postgres from DATABASE_URL. Server functions need a request context to run,
// so this covers what they build on: the schema, the audit trigger and error mapping.

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Runs the body in a transaction that is always rolled back, so tests leave no rows behind. */
const inRollback = (body: (tx: Transaction) => Promise<void>) =>
  db
    .transaction(async (tx) => {
      await body(tx);
      tx.rollback();
    })
    .catch((error) => {
      if (!(error instanceof TransactionRollbackError)) throw error;
    });

describe("todo table", () => {
  afterAll(() => pool.end());

  it("inserts and reads back a todo", () =>
    inRollback(async (tx) => {
      const todo = { id: uuidv7(), name: "Buy milk" };
      await tx.insert(todoTable).values(todo);

      expect(await tx.select().from(todoTable).where(eq(todoTable.id, todo.id))).toEqual([todo]);
    }));

  it("writes an audit log entry attributed to the user set by databaseMiddleware", () =>
    inRollback(async (tx) => {
      const id = uuidv7();
      await tx.execute(sql`SELECT set_config('app.user_name', 'Jane Doe', true)`);
      await tx.insert(todoTable).values({ id, name: "Audited" });

      const [log] = await tx.select().from(auditLogs).where(eq(auditLogs.recordId, id));
      expect(log).toMatchObject({
        tableName: "todos",
        action: "INSERT",
        performedBy: "Jane Doe",
        newData: { id, name: "Audited" },
      });
    }));

  it("surfaces constraint violations as a pg DatabaseError, which databaseMiddleware maps to 400", () =>
    inRollback(async (tx) => {
      const todo = { id: uuidv7(), name: "Duplicate" };
      await tx.insert(todoTable).values(todo);

      const error = await tx
        .insert(todoTable)
        .values(todo)
        .catch((e: unknown) => e);
      expect(error).toBeInstanceOf(DrizzleQueryError);
      expect((error as DrizzleQueryError).cause).toBeInstanceOf(DatabaseError);
    }));
});
