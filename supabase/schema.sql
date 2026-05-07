-- Hola Fresco - Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────
create table if not exists categories (
  id         uuid primary key default uuid_generate_v4(),
  slug       text not null unique,
  name_es    text not null,
  name_en    text not null,
  icon       text not null default '🍽️',
  color      text not null default '#4ade80',
  sort_order int  not null default 0,
  created_at timestamptz default now()
);

-- Seed default categories
insert into categories (slug, name_es, name_en, icon, color, sort_order) values
  ('carnes',   'Carnes',    'Meat',        '🥩', '#ef4444', 1),
  ('vegetariano', 'Vegetariano', 'Vegetarian', '🥦', '#22c55e', 2),
  ('vegano',   'Vegano',    'Vegan',       '🌱', '#84cc16', 3),
  ('pastas',   'Pastas',    'Pasta',       '🍝', '#f59e0b', 4),
  ('ensaladas','Ensaladas', 'Salads',      '🥗', '#10b981', 5),
  ('sopas',    'Sopas',     'Soups',       '🍲', '#f97316', 6),
  ('postres',  'Postres',   'Desserts',    '🍮', '#ec4899', 7),
  ('desayunos','Desayunos', 'Breakfast',   '🥞', '#a78bfa', 8),
  ('pescados', 'Pescados',  'Fish',        '🐟', '#06b6d4', 9),
  ('rapidas',  'Rápidas',   'Quick',       '⚡', '#eab308', 10)
on conflict (slug) do nothing;

-- ─────────────────────────────────────────
-- RECIPES
-- ─────────────────────────────────────────
create table if not exists recipes (
  id            uuid primary key default uuid_generate_v4(),
  slug          text not null unique,
  title_es      text not null,
  title_en      text not null,
  description_es text,
  description_en text,
  category_id   uuid references categories(id) on delete set null,
  image_url     text,
  prep_time     int  not null default 15,   -- minutes
  cook_time     int  not null default 20,   -- minutes
  servings      int  not null default 2,
  difficulty    text not null default 'facil' check (difficulty in ('facil','media','dificil')),
  ingredients   jsonb not null default '[]',
  -- [{ "name_es": "Tomate", "name_en": "Tomato", "amount": "2", "unit": "unidades", "unit_en": "units", "section": "Verduras" }]
  steps         jsonb not null default '[]',
  -- [{ "step": 1, "text_es": "...", "text_en": "..." }]
  tips_es       text,
  tips_en       text,
  calories      int,
  tags          text[] default '{}',
  status        text not null default 'draft' check (status in ('draft','published')),
  featured      boolean not null default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger recipes_updated_at
  before update on recipes
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────
create index if not exists recipes_status_idx      on recipes(status);
create index if not exists recipes_category_idx    on recipes(category_id);
create index if not exists recipes_featured_idx    on recipes(featured);
create index if not exists recipes_created_at_idx  on recipes(created_at desc);

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────
alter table categories enable row level security;
alter table recipes enable row level security;

-- Public: read published recipes and all categories
create policy "Public can read categories"
  on categories for select using (true);

create policy "Public can read published recipes"
  on recipes for select using (status = 'published');

-- Admin: full access (authenticated users)
create policy "Admin full access to categories"
  on categories for all using (auth.role() = 'authenticated');

create policy "Admin full access to recipes"
  on recipes for all using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────
-- STORAGE BUCKET for recipe images
-- ─────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recipe-images',
  'recipe-images',
  true,
  5242880, -- 5MB
  array['image/jpeg','image/png','image/webp']
) on conflict (id) do nothing;

create policy "Public read recipe images"
  on storage.objects for select
  using (bucket_id = 'recipe-images');

create policy "Admin upload recipe images"
  on storage.objects for insert
  with check (bucket_id = 'recipe-images' and auth.role() = 'authenticated');

create policy "Admin update recipe images"
  on storage.objects for update
  using (bucket_id = 'recipe-images' and auth.role() = 'authenticated');

create policy "Admin delete recipe images"
  on storage.objects for delete
  using (bucket_id = 'recipe-images' and auth.role() = 'authenticated');
