import Add from "@mui/icons-material/Add";
import Delete from "@mui/icons-material/Delete";
import Edit from "@mui/icons-material/Edit";
import { Badge, IconButton, Tooltip } from "@mui/material";
import { createOptimisticAction, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Fullscreen, LayoutTable, RouterIconButton, RouterLink } from "wcz-layout/components";
import {
  createLayoutColumnHelper,
  useDialogs,
  useLayoutTable,
  useTranslation,
} from "wcz-layout/hooks";
import { requireAuth } from "wcz-layout/utils";
import { useTodoCollection } from "~/db/collections/todo";
import { todosQueryOptions } from "~/db/queries/todo";
import type { Todo } from "~/lib/schemas/todo";
import { deleteTodos } from "~/server/actions/todo";

export const Route = createFileRoute("/todos/")({
  component: RouteComponent,
  beforeLoad: requireAuth("admin"),
  loader: ({ context }) => context.dbClient.preloadLiveQuery(todosQueryOptions),
});

const columnHelper = createLayoutColumnHelper<Todo>();

function RouteComponent() {
  const { t } = useTranslation();
  const { confirm, alert } = useDialogs();
  const navigate = useNavigate();
  const todos = useTodoCollection();

  const { data, isLoading } = useLiveQuery(todosQueryOptions);

  const columns = columnHelper.columns([
    columnHelper.display({
      id: "select",
      header: ({ header }) => <header.SelectAllCell scope="all" />,
      cell: ({ cell }) => <cell.SelectCell />,
      size: 50,
      enableResizing: false,
      enableCellSelection: false,
    }),
    columnHelper.accessor("name", {
      header: t("Todo.Name"),
      cell: ({ cell }) => (
        <RouterLink
          to="/todos/$id"
          params={{ id: cell.row.original.id }}
          underline="hover"
          color="inherit"
        >
          {cell.getValue()}
        </RouterLink>
      ),
      size: 260,
    }),
  ]);

  const table = useLayoutTable({ data, columns });
  const selectedIds = table.getSelectedRowIds();

  const handleOnDelete = createOptimisticAction<Array<string>>({
    onMutate: (ids) => {
      ids.forEach((id) => {
        todos.delete(id);
      });
    },
    mutationFn: async (ids) => {
      await deleteTodos({ data: ids });
      await todos.utils.refetch({ throwOnError: true });
    },
  });

  return (
    <Fullscreen sx={{ p: 1 }}>
      <LayoutTable
        table={table}
        loading={isLoading}
        showToolbar
        pagination
        title={t("Todo.Todos")}
        onRowDoubleClick={(row) => navigate({ to: "/todos/$id", params: { id: row.id } })}
        actions={
          <>
            <Tooltip title={t("Create")}>
              <RouterIconButton to="/todos/create">
                <Add fontSize="small" />
              </RouterIconButton>
            </Tooltip>

            {selectedIds.length === 1 && (
              <Tooltip title={t("Edit")}>
                <RouterIconButton to="/todos/edit/$id" params={{ id: selectedIds[0] }}>
                  <Edit fontSize="small" />
                </RouterIconButton>
              </Tooltip>
            )}

            {selectedIds.length > 0 && (
              <Tooltip title={t("Delete")}>
                <IconButton
                  onClick={async () => {
                    const confirmed = await confirm(
                      t("DeleteConfirmation", { count: selectedIds.length }),
                    );
                    if (!confirmed) return;

                    try {
                      const transaction = handleOnDelete(selectedIds);
                      await transaction.when("settled");
                      table.resetRowSelection();
                    } catch (error) {
                      if (error instanceof Error) await alert(error.message);
                    }
                  }}
                >
                  <Badge
                    badgeContent={selectedIds.length}
                    invisible={selectedIds.length <= 1}
                    color="error"
                  >
                    <Delete fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}
          </>
        }
      />
    </Fullscreen>
  );
}
