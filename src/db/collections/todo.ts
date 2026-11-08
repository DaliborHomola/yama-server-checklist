import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { collectionOptions, useDbClient } from "@tanstack/react-db";
import type { QueryClient } from "@tanstack/react-query";
import { TodoSchema } from "~/lib/schemas/todo";
import { selectTodos } from "~/server/actions/todo";

const TODOS_ID = "todos";

export const todoCollection = collectionOptions(TODOS_ID, (client) =>
  queryCollectionOptions({
    id: TODOS_ID,
    queryKey: [TODOS_ID],
    queryFn: ({ signal }) => selectTodos({ signal }),
    getKey: ({ id }) => id,
    schema: TodoSchema,
    queryClient: client.requireDependency<QueryClient>("queryClient"),
  }),
);

export const useTodoCollection = () => useDbClient().collection(todoCollection);
