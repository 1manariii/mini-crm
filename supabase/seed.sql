-- Сид: 3 объекта и задачи в разных статусах.
-- Запускать ПОСЛЕ создания тестовых пользователей (см. README, шаг 4).
-- Email'ы ниже должны совпадать с email созданных пользователей.

do $$
declare
  v_manager uuid := (select id from auth.users where email = 'manager@demo.ru');
  v_exec1   uuid := (select id from auth.users where email = 'ivan@demo.ru');
  v_exec2   uuid := (select id from auth.users where email = 'petr@demo.ru');
  v_obj1 uuid; v_obj2 uuid; v_obj3 uuid;
  v_task uuid;
begin
  if v_manager is null or v_exec1 is null or v_exec2 is null then
    raise exception 'Сначала создайте пользователей manager@demo.ru, ivan@demo.ru, petr@demo.ru (README, шаг 4)';
  end if;

  insert into public.objects (name, address, created_by) values
    ('ЖК «Северный», корпус 2', 'г. Казань, ул. Строителей, 14', v_manager),
    ('Бизнес-центр «Волга»', 'г. Казань, пр-т Победы, 101', v_manager),
    ('Складской комплекс «Восток»', 'г. Казань, ул. Портовая, 3', v_manager);

  select id into v_obj1 from public.objects where name = 'ЖК «Северный», корпус 2';
  select id into v_obj2 from public.objects where name = 'Бизнес-центр «Волга»';
  select id into v_obj3 from public.objects where name = 'Складской комплекс «Восток»';

  -- Задачи создаются в статусе "new" (триггер пишет запись о создании в историю),
  -- затем статус доводится до нужного напрямую (сид выполняется от владельца БД),
  -- а записи истории добавляем вручную с правильными авторами переходов.
  perform set_config('app.status_change', 'allowed', true);

  -- new
  insert into public.tasks (title, description, object_id, assignee_id, author_id)
  values ('Закупить кирпич для кладки 3 этажа', 'Керамический, марка М150, 12 000 шт. Смета согласована.', v_obj1, v_exec1, v_manager);

  -- in_work
  insert into public.tasks (title, description, object_id, assignee_id, author_id)
  values ('Смонтировать опалубку перекрытия', 'Секции 4-6 по оси Б. Чертёж КЖ-2.4.', v_obj1, v_exec1, v_manager)
  returning id into v_task;
  update public.tasks set status = 'in_work' where id = v_task;
  insert into public.task_status_history (task_id, from_status, to_status, changed_by)
  values (v_task, 'new', 'in_work', v_exec1);

  -- in_review
  insert into public.tasks (title, description, object_id, assignee_id, author_id)
  values ('Проложить электрику в холле 1 этажа', 'По схеме ЭО-1. Кабель ВВГнг 3x2.5.', v_obj2, v_exec2, v_manager)
  returning id into v_task;
  update public.tasks set status = 'in_review' where id = v_task;
  insert into public.task_status_history (task_id, from_status, to_status, changed_by) values
    (v_task, 'new', 'in_work', v_exec2),
    (v_task, 'in_work', 'in_review', v_exec2);

  -- rework (с комментарием постановщика)
  insert into public.tasks (title, description, object_id, assignee_id, author_id)
  values ('Покрасить фасад со стороны двора', 'Краска фасадная, цвет RAL 7035. Два слоя.', v_obj3, v_exec2, v_manager)
  returning id into v_task;
  update public.tasks set status = 'rework' where id = v_task;
  insert into public.task_status_history (task_id, from_status, to_status, changed_by, comment) values
    (v_task, 'new', 'in_work', v_exec2, null),
    (v_task, 'in_work', 'in_review', v_exec2, null),
    (v_task, 'in_review', 'rework', v_manager, 'Есть потёки у оконных проёмов, нужен второй слой.');

  -- accepted
  insert into public.tasks (title, description, object_id, assignee_id, author_id)
  values ('Установить стеллажи в секции А', 'Стеллажи паллетные, 3 яруса, по схеме расстановки.', v_obj3, v_exec1, v_manager)
  returning id into v_task;
  update public.tasks set status = 'accepted' where id = v_task;
  insert into public.task_status_history (task_id, from_status, to_status, changed_by) values
    (v_task, 'new', 'in_work', v_exec1),
    (v_task, 'in_work', 'in_review', v_exec1),
    (v_task, 'in_review', 'accepted', v_manager);
end $$;
