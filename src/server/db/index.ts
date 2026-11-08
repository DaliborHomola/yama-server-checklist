import { sql } from "drizzle-orm";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import { useNitroHooks } from "nitro/app";
import { Pool } from "pg";
import { serverEnv } from "~/env";
import { relations } from "./schemas/relations";

const schema = decodeURIComponent(new URL(serverEnv.DATABASE_URL).username);

export const pool = new Pool({
  connectionString: serverEnv.DATABASE_URL,
  options: `-c search_path="${schema.replaceAll('"', '""')}"`,
});
// Ends the pool after Nitro stops accepting requests on SIGTERM/SIGINT. Registered here, not in a Nitro
// plugin: a plugin is bundled separately and would import its own copy of this module, with its own pool.
useNitroHooks().hook("close", () => pool.end());
export const db = drizzle({ client: pool, relations });

const { rows } = await db.execute<{ schema: string | null }>(
  sql`SELECT current_schema() AS schema`,
);

if (rows[0]?.schema !== schema)
  throw new Error(
    `DATABASE_URL role "${schema}" must name an existing schema — search_path is pinned to it, never "public". ` +
      `Create it with: CREATE SCHEMA "${schema}" AUTHORIZATION "${schema}";`,
  );

const MIGRATIONS_FOLDER = "./src/server/db/migrations";
const MIGRATION_LOCK_ID = 830719;

const migrationsTable = sql.identifier("__drizzle_migrations");

if (serverEnv.DATABASE_AUTO_MIGRATE) {
  const client = await pool.connect();
  try {
    await client.query(`SELECT pg_advisory_lock(${MIGRATION_LOCK_ID})`);

    const migrations = readMigrationFiles({ migrationsFolder: MIGRATIONS_FOLDER });

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ${migrationsTable} (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL UNIQUE,
        created_at bigint
      )
    `);

    const applied = await db.execute<{ hash: string }>(sql`SELECT hash FROM ${migrationsTable}`);
    const appliedHashes = new Set(applied.rows.map((r) => r.hash));
    const pending = migrations.filter((m) => !appliedHashes.has(m.hash));

    for (const migration of pending) {
      await db.transaction(async (tx) => {
        for (const stmt of migration.sql) {
          if (stmt.trim()) await tx.execute(sql.raw(stmt));
        }
        await tx.execute(
          sql`INSERT INTO ${migrationsTable} ("hash", "created_at") VALUES (${migration.hash}, ${migration.folderMillis})`,
        );
      });
    }

    await db.execute(sql`SELECT attach_audit_triggers_all()`);

    if (pending.length > 0) console.log(`[migrate] Applied ${pending.length} migration(s).`);
  } finally {
    await client.query(`SELECT pg_advisory_unlock(${MIGRATION_LOCK_ID})`);
    client.release();
  }
}
