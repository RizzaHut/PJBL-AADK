-- Login resolves a username to email and reads staff role on the server.
-- Keep email access limited to the server-only service role.
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT (id, username, email, peran)
  ON TABLE public.pengguna TO service_role;
GRANT SELECT (id, username, email, peran)
  ON TABLE public.staf TO service_role;
