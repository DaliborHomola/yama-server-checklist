import type { LiveQueryOptions } from "@tanstack/react-db";
import { createOptimisticAction, DbClient } from "@tanstack/react-db";
import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { todoCollection } from "~/db/collections/todo";
import { todoByIdQueryOptions, todosQueryOptions } from "~/db/queries/todo";
import type { Todo } from "~/lib/schemas/todo";
import { selectTodos } from "~/server/actions/todo";

// The server function is the network boundary: stub it, keep TanStack DB real.
vi.mock("~/server/actions/todo", () => ({ selectTodos: vi.fn() }));

const rows: Array<Todo> = [
  { id: "01990000-0000-7000-8000-000000000001", name: "First" },
  { id: "01990000-0000-7000-8000-000000000002", name: "Second" },
];

describe("todo collection", () => {
  let dbClient: DbClient;

  beforeEach(() => {
    vi.mocked(selectTodos).mockResolvedValue(rows);
    dbClient = new DbClient({ queryClient: new QueryClient() });
  });

  // Same path a route loader takes: preload, then read the query's result rows.
  const runQuery = async (options: LiveQueryOptions) => {
    await dbClient.preloadLiveQuery(options);
    return dbClient
      .dehydrate()
      .liveQueries?.at(-1)
      ?.snapshot?.rows.map(({ value }) => value);
  };

  it("lists todos newest first", async () => {
    expect(await runQuery(todosQueryOptions)).toMatchObject([rows[1], rows[0]]);
    expect(selectTodos).toHaveBeenCalledOnce();
  });

  it("finds one todo by id", async () => {
    expect(await runQuery(todoByIdQueryOptions(rows[0].id))).toMatchObject([rows[0]]);
  });

  it("rolls back an optimistic insert when the server rejects it", async () => {
    const todos = dbClient.collection(todoCollection);
    await todos.preload();

    const insert = createOptimisticAction<Todo>({
      onMutate: (todo) => {
        todos.insert(todo);
      },
      mutationFn: async () => {
        throw new Error("Forbidden");
      },
    });

    const id = "01990000-0000-7000-8000-000000000003";
    const transaction = insert({ id, name: "Third" });
    expect(todos.has(id)).toBe(true);

    await expect(transaction.when("settled")).rejects.toThrow("Forbidden");
    expect(todos.has(id)).toBe(false);
  });
});
