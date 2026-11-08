-- 0003_functions: смена статуса задачи с проверкой перехода на стороне базы
--
-- Матрица переходов:
--   new        -> in_work    назначенный исполнитель
--   in_work    -> in_review  назначенный исполнитель
--   in_review  -> accepted   постановщик
--   in_review  -> rework     постановщик, комментарий обязателен
--   rework     -> in_work    назначенный исполнитель
-- Все остальные переходы запрещены.

create or replace function public.change_task_status(
  p_task_id uuid,
  p_new_status public.task_status,
  p_comment text default null
)
returns public.tasks
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task public.tasks;
  v_old_status public.task_status;
  v_uid uuid := auth.uid();
  v_is_manager boolean := public.is_manager();
  v_comment text := nullif(btrim(coalesce(p_comment, '')), '');
begin
  if v_uid is null then
    raise exception 'Не авторизован';
  end if;

  select * into v_task from public.tasks where id = p_task_id for update;
  if not found then
    raise exception 'Задача не найдена';
  end if;

  if not v_is_manager and v_task.assignee_id <> v_uid then
    raise exception 'Нет доступа к этой задаче';
  end if;

  if v_task.status = 'new' and p_new_status = 'in_work'
     or v_task.status = 'in_work' and p_new_status = 'in_review'
     or v_task.status = 'rework' and p_new_status = 'in_work' then
    if v_task.assignee_id <> v_uid then
      raise exception 'Действие доступно только назначенному исполнителю';
    end if;
  elsif v_task.status = 'in_review' and p_new_status = 'accepted' then
    if not v_is_manager then
      raise exception 'Принять задачу может только постановщик';
    end if;
  elsif v_task.status = 'in_review' and p_new_status = 'rework' then
    if not v_is_manager then
      raise exception 'Вернуть задачу на доработку может только постановщик';
    end if;
    if v_comment is null then
      raise exception 'При возврате на доработку комментарий обязателен';
    end if;
  else
    raise exception 'Переход "%" -> "%" запрещён', v_task.status, p_new_status;
  end if;

  v_old_status := v_task.status;

  perform set_config('app.status_change', 'allowed', true);

  update public.tasks
  set status = p_new_status
  where id = p_task_id
  returning * into v_task;

  insert into public.task_status_history (task_id, from_status, to_status, changed_by, comment)
  values (p_task_id, v_old_status, p_new_status, v_uid, v_comment);

  return v_task;
end;
$$;

revoke all on function public.change_task_status(uuid, public.task_status, text) from public, anon;
grant execute on function public.change_task_status(uuid, public.task_status, text) to authenticated;
