CREATE TABLE "daily_quotes" (
	"id" text PRIMARY KEY NOT NULL,
	"position" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"content" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_quotes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "daily_quotes_position" ON "daily_quotes" USING btree ("position");--> statement-breakpoint
-- Defesa em profundidade (como a 0003 e a 0004): a tabela nova também fica fora do alcance dos papéis públicos do Supabase.
DO $$
DECLARE r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('REVOKE ALL ON TABLE daily_quotes FROM %I', r);
    END IF;
  END LOOP;
END $$;
