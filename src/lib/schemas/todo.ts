import { createSelectSchema } from "drizzle-orm/zod";
import { t } from "wcz-layout/utils";
import type { z } from "zod";
import { todoTable } from "~/server/db/schemas/todo";

export const TodoSchema = createSelectSchema(todoTable, {
  name: (schema) =>
    schema
      .trim()
      .min(1, { error: () => t("Validation.Required") })
      .max(255, { error: () => t("Validation.MaxLength", { length: 255 }) }),
});

export type Todo = z.infer<typeof TodoSchema>;
