import { snakeCase, text, uuid } from "drizzle-orm/pg-core";

export const todoTable = snakeCase.table("todos", {
  id: uuid().primaryKey(),
  name: text().notNull(),
});
