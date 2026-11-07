-- Defesa em profundidade para o Supabase: a Data API (PostgREST) usa os papéis `anon` e `authenticated`, e a chave `anon` é pública.
-- A RLS já está ligada em todas as tabelas (0002), sem policies. Aqui também retiramos os privilégios desses papéis.
-- Só age se os papéis existirem (em Postgres comum e nos testes não existem). Só a API, conectada como dono das tabelas, acessa os dados.
DO $$
DECLARE r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM %I', r);
      EXECUTE format('REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM %I', r);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM %I', r);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM %I', r);
    END IF;
  END LOOP;
END $$;
