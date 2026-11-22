-- Lookbook photos can be filed under a category so the gallery can be filtered like the catalogue.
-- Deleting a category keeps its photos and leaves them uncategorised.
alter table public.lookbooks
  add column if not exists category_id uuid references public.categories (id) on delete set null;
create index if not exists lookbooks_category_idx on public.lookbooks (category_id);
