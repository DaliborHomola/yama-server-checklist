import Delete from "@mui/icons-material/Delete";
import Edit from "@mui/icons-material/Edit";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { createOptimisticAction, useLiveSuspenseQuery } from "@tanstack/react-db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RouterButton, RouterNotFound } from "wcz-layout/components";
import { useDialogs, useTranslation } from "wcz-layout/hooks";
import { requireAuth } from "wcz-layout/utils";
import { useTodoCollection } from "~/db/collections/todo";
import { todoByIdQueryOptions } from "~/db/queries/todo";
import { TodoSkeleton } from "./-components/TodoSkeleton";
import { deleteTodos } from "~/server/actions/todo";

export const Route = createFileRoute("/todos/$id")({
  component: RouteComponent,
  pendingComponent: TodoSkeleton,
  beforeLoad: requireAuth("admin"),
  loader: ({ context, params }) =>
    context.dbClient.preloadLiveQuery(todoByIdQueryOptions(params.id)),
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { t } = useTranslation();
  const { confirm, alert } = useDialogs();
  const navigate = useNavigate();
  const todos = useTodoCollection();

  const { data } = useLiveSuspenseQuery(todoByIdQueryOptions(id));

  const handleOnDelete = createOptimisticAction<string>({
    onMutate: (id) => {
      todos.delete(id);
    },
    mutationFn: async (id) => {
      await deleteTodos({ data: [id] });
      await todos.utils.refetch({ throwOnError: true });
    },
  });

  if (!data) return <RouterNotFound />;

  return (
    <Container maxWidth="md" sx={{ my: 2 }}>
      <Card>
        <CardHeader title={t("Todo.Todo")} />

        <CardContent>
          <Stack spacing={1}>
            <Typography>
              {t("Todo.Name")}: {data.name}
            </Typography>
          </Stack>
        </CardContent>

        <CardActions sx={{ justifyContent: "flex-end" }}>
          <RouterButton to="/todos/edit/$id" params={{ id }} color="inherit" startIcon={<Edit />}>
            {t("Edit")}
          </RouterButton>
          <Button
            color="inherit"
            startIcon={<Delete />}
            onClick={async () => {
              const confirmed = await confirm(t("DeleteConfirmation", { count: 1 }));
              if (confirmed) {
                try {
                  const transaction = handleOnDelete(data.id);
                  await transaction.when("settled");
                  await navigate({ to: "/todos" });
                } catch (error) {
                  if (error instanceof Error) await alert(error.message);
                }
              }
            }}
          >
            {t("Delete")}
          </Button>
        </CardActions>
      </Card>
    </Container>
  );
}
