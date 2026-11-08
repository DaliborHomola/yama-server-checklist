import { Card, CardActions, CardContent, CardHeader, Stack } from "@mui/material";
import type { FC } from "react";
import { useLayoutForm, useTranslation } from "wcz-layout/hooks";
import type { Todo } from "~/lib/schemas/todo";
import { TodoSchema } from "~/lib/schemas/todo";

interface FormProps {
  defaultValues: Todo;
  onSubmit: (value: Todo) => Promise<void>;
}

export const Form: FC<FormProps> = ({ defaultValues, onSubmit }) => {
  const { t } = useTranslation();

  const form = useLayoutForm({
    defaultValues,
    validators: { onChange: TodoSchema },
    onSubmit: async ({ value, formApi }) => {
      await onSubmit(value);
      formApi.reset();
    },
  });

  return (
    <Card>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          event.stopPropagation();
          await form.handleSubmit();
        }}
      >
        <CardHeader title={t("Todo.Todo")} />

        <CardContent>
          <Stack spacing={2}>
            <form.AppField name="name">
              {(field) => <field.TextField label={t("Todo.Name")} required sx={{ width: 420 }} />}
            </form.AppField>
          </Stack>
        </CardContent>

        <CardActions sx={{ justifyContent: "flex-end" }}>
          <form.AppForm>
            <form.SubmitButton variant="contained">{t("Submit")}</form.SubmitButton>
          </form.AppForm>
        </CardActions>
      </form>
    </Card>
  );
};
