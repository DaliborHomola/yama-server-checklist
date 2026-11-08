import type { InitialQueryBuilder } from "@tanstack/react-db";
import { eq } from "@tanstack/react-db";
import { todoCollection } from "../collections/todo";

export const todosQueryOptions = {
  query: (q: InitialQueryBuilder) =>
    q.from({ todo: todoCollection }).orderBy(({ todo }) => todo.id, "desc"),
};

export const todoByIdQueryOptions = (id: string) => ({
  query: (q: InitialQueryBuilder) =>
    q
      .from({ todo: todoCollection })
      .where(({ todo }) => eq(todo.id, id))
      .findOne(),
});
