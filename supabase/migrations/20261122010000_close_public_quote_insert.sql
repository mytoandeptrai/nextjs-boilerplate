-- Leads are written only by POST /api/quotes with the service role, after the server recomputed every price.
-- With no policy left on the table, a public key can neither read nor write it.
drop policy if exists "public create quote" on public.quote_requests;
revoke insert on public.quote_requests from anon, authenticated;
