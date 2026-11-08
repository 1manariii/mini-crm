-- 0001_init: схема данных (профили, объекты, задачи, история статусов)

create type public.app_role as enum ('manager', 'executor');
create type public.task_status as enum ('new', 'in_work', 'in_review', 'rework', 'accepted');

-- Профили пользователей (1:1 с auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role public.app_role not null,
  created_at timestamptz not null default now()
);

-- Объекты (стройки)
create table public.objects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null default '',
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

-- Задачи
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  object_id uuid not null references public.objects (id) on delete cascade,
  assignee_id uuid not null references public.profiles (id),
  author_id uuid not null references public.profiles (id),
  status public.task_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_object_id_idx on public.tasks (object_id);
create index tasks_assignee_id_idx on public.tasks (assignee_id);

-- История смены статусов (append-only)
create table public.task_status_history (
  id bigint generated always as identity primary key,
  task_id uuid not null references public.tasks (id) on delete cascade,
  from_status public.task_status,
  to_status public.task_status not null,
  changed_by uuid not null references public.profiles (id),
  comment text,
  created_at timestamptz not null default now()
);

create index task_status_history_task_id_idx on public.task_status_history (task_id);

-- Автосоздание профиля при создании пользователя в Auth.
-- Роль и имя берутся из user metadata: { "role": "manager"|"executor", "full_name": "..." }
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'executor')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Признак «текущий пользователь — постановщик».
-- security definer, чтобы не было рекурсии с RLS на profiles.
create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'manager'
  );
$$;

-- Статус меняется только через change_task_status() (иначе запись в историю можно обойти).
-- Функция перед обновлением выставляет set_config('app.status_change', 'allowed', true).
create or replace function public.guard_task_status_change()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status
     and coalesce(current_setting('app.status_change', true), '') <> 'allowed' then
    raise exception 'Статус задачи можно менять только через change_task_status()';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger tasks_guard_status
  before update on public.tasks
  for each row execute function public.guard_task_status_change();

-- Запись в историю при создании задачи (статус "Новая")
create or replace function public.log_task_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.task_status_history (task_id, from_status, to_status, changed_by)
  values (new.id, null, new.status, new.author_id);
  return new;
end;
$$;

create trigger tasks_log_created
  after insert on public.tasks
  for each row execute function public.log_task_created();
