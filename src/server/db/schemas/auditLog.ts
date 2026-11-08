import { jsonb, serial, snakeCase, text, timestamp } from "drizzle-orm/pg-core";

export const auditLogs = snakeCase.table("audit_logs", {
  id: serial().primaryKey(),
  tableName: text().notNull(),
  recordId: text().notNull(),
  action: text().notNull(),
  oldData: jsonb(),
  newData: jsonb(),
  performedBy: text(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
