import { Container } from "@mui/material";
import { createOptimisticAction, useLiveSuspenseQuery } from "@tanstack/react-db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RouterNotFound } from "wcz-layout/components";
import { useDialogs } from "wcz-layout/hooks";
import { requireAuth } from "wcz-layout/utils";
import { useTodoCollection } from "~/db/collections/todo";
import { todoByIdQueryOptions } from "~/db/queries/todo";
import type { Todo } from "~/lib/schemas/todo";
import { updateTodo } from "~/server/actions/todo";
import { Form } from "./-components/Form";
import { TodoSkeleton } from "./-components/TodoSkeleton";

export const Route = createFileRoute("/todos/edit/$id")({
  component: RouteComponent,
  pendingComponent: TodoSkeleton,
  beforeLoad: requireAuth("admin"),
  loader: ({ context, params }) =>
    context.dbClient.preloadLiveQuery(todoByIdQueryOptions(params.id)),
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { alert } = useDialogs();
  const navigate = useNavigate();
  const todos = useTodoCollection();

  const { data } = useLiveSuspenseQuery(todoByIdQueryOptions(id));

  const handleOnSubmit = createOptimisticAction<Todo>({
    onMutate: (formValues) => {
      todos.update(id, (prev) => Object.assign(prev, formValues));
    },
    mutationFn: async (formValues) => {
      await updateTodo({ data: formValues });
      await todos.utils.refetch({ throwOnError: true });
    },
  });

  if (!data) return <RouterNotFound />;

  return (
    <Container maxWidth="md" sx={{ my: 2 }}>
      <Form
        defaultValues={data}
        onSubmit={async (formValues) => {
          try {
            const transaction = handleOnSubmit(formValues);
            await transaction.when("settled");
            await navigate({ to: "/todos/$id", params: { id } });
          } catch (error) {
            if (error instanceof Error) await alert(error.message);
            throw error;
          }
        }}
      />
    </Container>
  );
}
