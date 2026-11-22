-- Optional discounted price: when set it replaces base_price in the storefront and in quote pricing.
alter table public.products
  add column if not exists sale_price numeric(14, 2),
  -- How many quote requests included the product; the catalogue's "popular" order.
  add column if not exists quote_count integer not null default 0 check (quote_count >= 0);

alter table public.products
  add constraint products_sale_price_check check (sale_price is null or (sale_price >= 0 and sale_price < base_price));

-- The price a customer pays per unit, stored so the catalogue can sort by it.
alter table public.products
  add column if not exists effective_price numeric(14, 2) generated always as (coalesce(sale_price, base_price)) stored;

create index if not exists products_active_price_idx on public.products (is_active, effective_price);
create index if not exists products_active_popular_idx on public.products (is_active, quote_count desc);

-- Called by POST /api/quotes with the service role after a lead is stored. Not callable with the publishable key.
create or replace function public.increment_product_quote_count(product_ids uuid[])
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.products set quote_count = quote_count + 1 where id = any (product_ids);
$$;

revoke execute on function public.increment_product_quote_count(uuid[]) from public, anon, authenticated;
grant execute on function public.increment_product_quote_count(uuid[]) to service_role;
