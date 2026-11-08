import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/app/providers/AuthProvider'
import { TASK_STATUS_LABELS, fetchMyTasks } from '@/entities/task'
import type { TaskListItem, TaskStatus } from '@/entities/task'
import { EmptyState, PageLoader } from '@/shared/ui'
import { TaskList } from '@/widgets/task-list'
import './my-tasks-page.scss'

type StatusFilter = TaskStatus | 'all'

export function MyTasksPage() {
  const { profile } = useAuth()
  const [tasks, setTasks] = useState<TaskListItem[] | null>(null)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!profile) return
    try {
      setTasks(await fetchMyTasks(profile.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить задачи')
    }
  }, [profile])

  useEffect(() => {
    void load()
  }, [load])

  const filteredTasks = useMemo(() => {
    if (!tasks) return []
    return filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)
  }, [tasks, filter])

  const usedStatuses = useMemo(
    () => [...new Set((tasks ?? []).map((task) => task.status))] as TaskStatus[],
    [tasks],
  )

  return (
    <section className="my-tasks-page">
      <div className="my-tasks-page__header">
        <h1 className="my-tasks-page__title">Мои задачи</h1>
      </div>

      <div className="my-tasks-page__filters">
        <button
          className={`my-tasks-page__filter${filter === 'all' ? ' my-tasks-page__filter--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Все
        </button>
        {usedStatuses.map((status) => (
          <button
            key={status}
            className={`my-tasks-page__filter${filter === status ? ' my-tasks-page__filter--active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {TASK_STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {error && <p className="my-tasks-page__error">{error}</p>}
      {!tasks && !error && <PageLoader />}
      {tasks && filteredTasks.length === 0 && (
        <EmptyState title="Задач с таким статусом нет" />
      )}
      {tasks && filteredTasks.length > 0 && <TaskList tasks={filteredTasks} showObject />}
    </section>
  )
}
