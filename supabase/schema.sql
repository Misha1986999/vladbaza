-- ============================================================
-- ВладБаза — схема базы данных для Supabase
-- Выполнить целиком один раз в: Supabase → SQL Editor → New query
-- ============================================================

-- 1. ПРОФИЛИ ПОЛЬЗОВАТЕЛЕЙ
-- Supabase Auth уже хранит пользователей в auth.users,
-- здесь храним дополнительные публичные данные (имя, телефон, роль)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Профиль виден всем" on public.profiles
  for select using (true);

create policy "Пользователь редактирует свой профиль" on public.profiles
  for update using (auth.uid() = id);

create policy "Пользователь создаёт свой профиль" on public.profiles
  for insert with check (auth.uid() = id);

-- 2. КАТЕГОРИИ
create table if not exists public.categories (
  id serial primary key,
  name text not null,
  slug text not null unique
);

alter table public.categories enable row level security;

create policy "Категории видны всем" on public.categories
  for select using (true);

insert into public.categories (name, slug) values
  ('Транспорт', 'transport'),
  ('Недвижимость', 'realty'),
  ('Личные вещи', 'personal'),
  ('Для дома и дачи', 'home'),
  ('Электроника', 'electronics'),
  ('Работа', 'jobs'),
  ('Услуги', 'services'),
  ('Животные', 'animals'),
  ('Хобби и отдых', 'hobbies')
on conflict (slug) do nothing;

-- 3. РАЙОНЫ ВЛАДИВОСТОКА
create table if not exists public.districts (
  id serial primary key,
  name text not null unique
);

alter table public.districts enable row level security;

create policy "Районы видны всем" on public.districts
  for select using (true);

insert into public.districts (name) values
  ('Ленинский'),
  ('Первомайский'),
  ('Первореченский'),
  ('Советский'),
  ('Фрунзенский')
on conflict (name) do nothing;

-- 4. ОБЪЯВЛЕНИЯ
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id integer not null references public.categories(id),
  district_id integer references public.districts(id),
  title text not null,
  description text not null,
  price numeric,
  phone text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.listings enable row level security;

-- Одобренные объявления видны всем без регистрации
create policy "Одобренные объявления видны всем" on public.listings
  for select using (status = 'approved');

-- Автор видит все свои объявления, включая pending/rejected
create policy "Автор видит свои объявления" on public.listings
  for select using (auth.uid() = user_id);

-- Админ видит всё
create policy "Админ видит всё" on public.listings
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Публиковать может только авторизованный пользователь, только от своего имени
create policy "Авторизованный создаёт объявление" on public.listings
  for insert with check (auth.uid() = user_id);

-- Автор может редактировать/удалять своё объявление
create policy "Автор редактирует своё объявление" on public.listings
  for update using (auth.uid() = user_id);

create policy "Автор удаляет своё объявление" on public.listings
  for delete using (auth.uid() = user_id);

-- Админ может менять статус любого объявления (одобрить/отклонить)
create policy "Админ модерирует объявления" on public.listings
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- 5. ФОТО ОБЪЯВЛЕНИЙ
create table if not exists public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  url text not null,
  sort_order integer not null default 0
);

alter table public.listing_photos enable row level security;

create policy "Фото видно, если видно объявление" on public.listing_photos
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
      and (l.status = 'approved' or l.user_id = auth.uid())
    )
  );

create policy "Автор объявления добавляет фото" on public.listing_photos
  for insert with check (
    exists (select 1 from public.listings l where l.id = listing_id and l.user_id = auth.uid())
  );

create policy "Автор объявления удаляет фото" on public.listing_photos
  for delete using (
    exists (select 1 from public.listings l where l.id = listing_id and l.user_id = auth.uid())
  );

-- 6. ХРАНИЛИЩЕ ФОТО (Storage bucket)
-- Выполняется отдельно через интерфейс Supabase → Storage → Create bucket
-- Название: listing-photos, Public bucket: включено
-- Либо раскомментируйте и выполните здесь:
-- insert into storage.buckets (id, name, public) values ('listing-photos', 'listing-photos', true)
-- on conflict (id) do nothing;

-- Политики для Storage (после создания bucket):
-- create policy "Фото публично доступны" on storage.objects
--   for select using (bucket_id = 'listing-photos');
-- create policy "Авторизованные загружают фото" on storage.objects
--   for insert with check (bucket_id = 'listing-photos' and auth.role() = 'authenticated');

-- ============================================================
-- КАК СДЕЛАТЬ СЕБЯ АДМИНОМ (выполнить после первой регистрации):
-- update public.profiles set is_admin = true where id = 'ваш-user-id-из-auth.users';
-- ============================================================
