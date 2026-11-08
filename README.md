# Мини-CRM «Объекты и задачи»

Небольшая CRM для строительной компании: постановщик ставит задачи по объектам (стройкам),
исполнители выполняют их и отдают на проверку. Задачи живут в цикле статусов
с историей изменений, права проверяются на уровне базы данных.

**Стек:** React + TypeScript (Vite), Supabase (PostgreSQL + Auth + RLS), SCSS с методологией БЭМ, архитектура Feature-Sliced Design.

## Запуск

### 1. Supabase

1. Создайте проект на [supabase.com](https://supabase.com) (бесплатного тарифа достаточно).
2. Выполните миграции: **SQL Editor → New query**, по очереди выполните файлы
   из `supabase/migrations/` в порядке номеров (`0001_init.sql`, `0002_rls.sql`, `0003_functions.sql`).
   Либо через Supabase CLI: `supabase link` + `supabase db push`.
3. Отключите открытую регистрацию: **Authentication → Sign In / Providers → Email** →
   выключите **Allow new users to sign up**.
4. Создайте тестовых пользователей: **Authentication → Users → Add user → Create new user**.
   Для каждого укажите email, пароль, включите **Auto Confirm User** и задайте **User Metadata**:

   | Email | User Metadata |
   | --- | --- |
   | `manager@demo.ru` | `{ "role": "manager", "full_name": "Анна Смирнова" }` |
   | `ivan@demo.ru` | `{ "role": "executor", "full_name": "Иван Петров" }` |
   | `petr@demo.ru` | `{ "role": "executor", "full_name": "Пётр Сидоров" }` |

   Профили создадутся автоматически триггером из метаданных.
5. (Опционально) Наполните базу демо-данными: выполните `supabase/seed.sql` в SQL Editor —
   получите 3 объекта и задачи во всех статусах.

### 2. Фронтенд

```bash
npm install
cp .env.example .env   # подставьте URL проекта и anon key
npm run dev
```

Значения для `.env` — в Supabase: **Project Settings → Data API** (Project URL) и
**Project Settings → API Keys** (`anon` `public` ключ). Секретные ключи (`service_role`)
во фронтенде не используются и в репозиторий не попадают.

Сборка: `npm run build` (готовый бандл в `dist/` — для деплоя на Vercel/Netlify
достаточно указать команду сборки и переменные окружения из `.env`).

## Как защищены данные

- **RLS на всех таблицах** (`supabase/migrations/0002_rls.sql`): исполнитель читает только
  свои задачи и объекты, где у него есть задачи; прав на запись у него нет вовсе.
  Правила работают при любом обращении к API, в обход интерфейса.
- **Смена статуса — только через функцию `change_task_status()`** (`0003_functions.sql`):
  матрица переходов и роли проверяются в базе. Прямой update статуса блокирует триггер.
- **История неизменяема**: у роли `authenticated` нет insert/update/delete-политик
  на `task_status_history` — записи создаёт только база (триггер при создании задачи,
  функция при смене статуса).

## Структура проекта (FSD)

```
src/
  app/        # провайдеры, роутинг, глобальные стили
  pages/      # login, objects, object, task, my-tasks
  widgets/    # header, task-list, task-history
  features/   # auth, object-form, task-form, task-status
  entities/   # task, object, user (типы, API, бейдж статуса)
  shared/     # supabase-клиент, UI-кит (БЭМ), утилиты, конфиг роутов
supabase/
  migrations/ # схема, RLS, функция смены статуса
  seed.sql    # демо-данные
docs/
  explanation.md  # объяснение для руководителя-непрограммиста
  decisions.md    # решения и допущения по ТЗ
```
