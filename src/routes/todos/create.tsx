import { Container } from "@mui/material";
import { createOptimisticAction } from "@tanstack/react-db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useDialogs } from "wcz-layout/hooks";
import { requireAuth, uuidv7 } from "wcz-layout/utils";
import { useTodoCollection } from "~/db/collections/todo";
import type { Todo } from "~/lib/schemas/todo";
import { Form } from "./-components/Form";
import { insertTodo } from "~/server/actions/todo";

export const Route = createFileRoute("/todos/create")({
  component: RouteComponent,
  beforeLoad: requireAuth("admin"),
});

function RouteComponent() {
  const { alert } = useDialogs();
  const navigate = useNavigate();
  const todos = useTodoCollection();

  const handleOnSubmit = createOptimisticAction<Todo>({
    onMutate: (formValues) => {
      todos.insert(formValues);
    },
    mutationFn: async (formValues) => {
      await insertTodo({ data: formValues });
      await todos.utils.refetch({ throwOnError: true });
    },
  });

  return (
    <Container maxWidth="md" sx={{ my: 2 }}>
      <Form
        defaultValues={{
          id: uuidv7(),
          name: "",
        }}
        onSubmit={async (formValues) => {
          try {
            const transaction = handleOnSubmit(formValues);
            await transaction.when("settled");
            await navigate({ to: "/todos" });
          } catch (error) {
            if (error instanceof Error) await alert(error.message);
            throw error;
          }
        }}
      />
    </Container>
  );
}
