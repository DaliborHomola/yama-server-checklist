CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY,
	"table_name" text NOT NULL,
	"record_id" text NOT NULL,
	"action" text NOT NULL,
	"old_data" jsonb,
	"new_data" jsonb,
	"performed_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);


-- ============================================================================
-- AUDIT LOG TRIGGER SYSTEM
-- Automatically tracks INSERT, UPDATE, DELETE operations on all tables
-- ============================================================================

-- ============================================================================
-- PART 1: Create the audit trigger function
-- ============================================================================
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  old_row JSONB;
  new_row JSONB;
BEGIN
  IF TG_OP <> 'INSERT' THEN old_row := to_jsonb(OLD); END IF;
  IF TG_OP <> 'DELETE' THEN new_row := to_jsonb(NEW); END IF;

  -- Only log if data actually changed
  IF old_row IS NOT DISTINCT FROM new_row THEN RETURN NULL; END IF;

  INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, performed_by)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(new_row->>'id', old_row->>'id', 'unknown'),
    TG_OP,
    old_row,
    new_row,
    -- User set by the app via SET LOCAL; '' on a reused pooled connection
    COALESCE(NULLIF(current_setting('app.user_name', true), ''), 'system')
  );

  RETURN NULL; -- AFTER trigger: return value is ignored
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SECURITY DEFINER needs a pinned search_path, and it can't inherit the caller's.
-- Pin it to whatever schema this migration ran in.
DO $$ BEGIN
  EXECUTE format('ALTER FUNCTION audit_trigger_func() SET search_path = pg_catalog, %I', current_schema());
END $$;

-- ============================================================================
-- PART 2: Helper function to attach audit trigger to a table
-- ============================================================================
CREATE OR REPLACE FUNCTION attach_audit_trigger(target_table TEXT)
RETURNS VOID AS $$
DECLARE
  trigger_name TEXT;
BEGIN
  trigger_name := 'audit_trigger_' || target_table;

  -- Check if trigger already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = trigger_name
    AND tgrelid = target_table::regclass
  ) THEN
    EXECUTE format(
      'CREATE TRIGGER %I
       AFTER INSERT OR UPDATE OR DELETE ON %I
       FOR EACH ROW EXECUTE FUNCTION audit_trigger_func()',
      trigger_name,
      target_table
    );
    RAISE NOTICE 'Audit trigger attached to table: %', target_table;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 3: Sweep — attach the trigger to every table missing one
-- Event triggers (auto-attach on CREATE TABLE) need superuser, which managed
-- Postgres never grants, so the sweep runs at the end of a migration instead.
-- A migration that adds a table must call attach_audit_triggers_all() again.
-- ============================================================================
CREATE OR REPLACE FUNCTION attach_audit_triggers_all()
RETURNS VOID AS $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = current_schema()
      AND tablename <> 'audit_logs'
      AND tablename NOT LIKE '%drizzle%'
  LOOP
    PERFORM attach_audit_trigger(tbl.tablename);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

SELECT attach_audit_triggers_all();
