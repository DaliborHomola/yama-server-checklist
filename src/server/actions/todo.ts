import { createServerFn } from "@tanstack/react-start";
import { eq, inArray } from "drizzle-orm";
import { authMiddleware } from "wcz-layout/middleware";
import z from "zod";
import { TodoSchema } from "~/lib/schemas/todo";
import { todoTable } from "../db/schemas/todo";
import { databaseMiddleware } from "../middleware/databaseMiddleware";

export const selectTodos = createServerFn()
  .middleware([databaseMiddleware(), authMiddleware()])
  .handler(({ context }) => {
    return context.db.select().from(todoTable);
  });

export const insertTodo = createServerFn({ method: "POST" })
  .validator(TodoSchema)
  .middleware([databaseMiddleware(), authMiddleware("admin")])
  .handler(async ({ data, context }) => {
    await context.db.insert(todoTable).values(data).onConflictDoNothing({ target: todoTable.id });
  });

export const updateTodo = createServerFn({ method: "POST" })
  .validator(TodoSchema)
  .middleware([databaseMiddleware(), authMiddleware("admin")])
  .handler(async ({ data, context }) => {
    await context.db.update(todoTable).set(data).where(eq(todoTable.id, data.id));
  });

export const deleteTodos = createServerFn({ method: "POST" })
  .validator(z.array(z.uuid()))
  .middleware([databaseMiddleware(), authMiddleware("admin")])
  .handler(async ({ data, context }) => {
    await context.db.delete(todoTable).where(inArray(todoTable.id, data));
  });
