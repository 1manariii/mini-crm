-- 0002_rls: права доступа на уровне строк (работают даже при прямом обращении к API)

alter table public.profiles enable row level security;
alter table public.objects enable row level security;
alter table public.tasks enable row level security;
alter table public.task_status_history enable row level security;

-- profiles: любой авторизованный видит коллег
-- (нужно постановщику для выбора исполнителя и всем — для отображения имён в истории)
create policy "authenticated read profiles"
  on public.profiles for select to authenticated
  using (true);

-- objects: постановщик — полный доступ
create policy "manager full access objects"
  on public.objects for all to authenticated
  using (public.is_manager())
  with check (public.is_manager());

-- objects: исполнитель видит только объекты, где у него есть задачи
create policy "executor read own objects"
  on public.objects for select to authenticated
  using (
    exists (
      select 1 from public.tasks t
      where t.object_id = objects.id
        and t.assignee_id = auth.uid()
    )
  );

-- tasks: постановщик читает всё, исполнитель — только свои задачи
create policy "manager read all tasks"
  on public.tasks for select to authenticated
  using (public.is_manager());

create policy "executor read own tasks"
  on public.tasks for select to authenticated
  using (assignee_id = auth.uid());

-- tasks: создаёт только постановщик, от своего имени и только в статусе "new"
create policy "manager insert tasks"
  on public.tasks for insert to authenticated
  with check (
    public.is_manager()
    and author_id = auth.uid()
    and status = 'new'
  );

-- tasks: редактирует и удаляет только постановщик.
-- Исполнитель update-прав не имеет вовсе: смена статуса — только через change_task_status().
create policy "manager update tasks"
  on public.tasks for update to authenticated
  using (public.is_manager())
  with check (public.is_manager());

create policy "manager delete tasks"
  on public.tasks for delete to authenticated
  using (public.is_manager());

-- history: читает постановщик (всю) и исполнитель (по своим задачам).
-- insert/update/delete политик нет — через API историю нельзя подделать, изменить или удалить.
create policy "manager read history"
  on public.task_status_history for select to authenticated
  using (public.is_manager());

create policy "executor read own history"
  on public.task_status_history for select to authenticated
  using (
    exists (
      select 1 from public.tasks t
      where t.id = task_status_history.task_id
        and t.assignee_id = auth.uid()
    )
  );
