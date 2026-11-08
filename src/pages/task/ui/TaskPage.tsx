import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { deleteTask, fetchTask, fetchTaskHistory } from '@/entities/task'
import type { TaskDetails, TaskHistoryEntry } from '@/entities/task'
import { TaskStatusBadge } from '@/entities/task'
import { TaskFormModal } from '@/features/task-form'
import { TaskStatusActions } from '@/features/task-status'
import { ROUTES } from '@/shared/config/routes'
import { formatDateTime } from '@/shared/lib/formatDate'
import { Button, EmptyState, PageLoader } from '@/shared/ui'
import { TaskHistory } from '@/widgets/task-history'
import './task-page.scss'

export function TaskPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [task, setTask] = useState<TaskDetails | null>(null)
  const [history, setHistory] = useState<TaskHistoryEntry[]>([])
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const isManager = profile?.role === 'manager'

  const load = useCallback(async () => {
    if (!id) return
    try {
      const [fetchedTask, fetchedHistory] = await Promise.all([
        fetchTask(id),
        fetchTaskHistory(id),
      ])
      if (!fetchedTask) {
        setNotFound(true)
        return
      }
      setTask(fetchedTask)
      setHistory(fetchedHistory)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить задачу')
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const handleDelete = async () => {
    if (!task) return
    if (!window.confirm(`Удалить задачу «${task.title}»?`)) return
    try {
      await deleteTask(task.id)
      navigate(task.object ? ROUTES.object(task.object.id) : ROUTES.objects)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить задачу')
    }
  }

  if (notFound) {
    return <EmptyState title="Задача не найдена" text="Возможно, она удалена или у вас нет к ней доступа." />
  }

  if (!task || !profile) {
    return error ? <p className="task-page__error">{error}</p> : <PageLoader />
  }

  return (
    <section className="task-page">
      <Link
        className="task-page__back"
        to={task.object ? ROUTES.object(task.object.id) : ROUTES.objects}
      >
        ← К объекту {task.object ? `«${task.object.name}»` : ''}
      </Link>

      <div className="task-page__card">
        <div className="task-page__header">
          <div>
            <h1 className="task-page__title">{task.title}</h1>
            <TaskStatusBadge status={task.status} />
          </div>
          {isManager && (
            <div className="task-page__actions">
              <Button variant="secondary" size="small" onClick={() => setEditOpen(true)}>
                Редактировать
              </Button>
              <Button variant="danger" size="small" onClick={() => void handleDelete()}>
                Удалить
              </Button>
            </div>
          )}
        </div>

        <dl className="task-page__meta">
          <div>
            <dt className="task-page__meta-label">Объект</dt>
            <dd className="task-page__meta-value">
              {task.object ? (
                <Link to={ROUTES.object(task.object.id)}>{task.object.name}</Link>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt className="task-page__meta-label">Исполнитель</dt>
            <dd className="task-page__meta-value">{task.assignee?.full_name ?? '—'}</dd>
          </div>
          <div>
            <dt className="task-page__meta-label">Автор</dt>
            <dd className="task-page__meta-value">{task.author?.full_name ?? '—'}</dd>
          </div>
          <div>
            <dt className="task-page__meta-label">Создана</dt>
            <dd className="task-page__meta-value">{formatDateTime(task.created_at)}</dd>
          </div>
        </dl>

        {task.description && <p className="task-page__description">{task.description}</p>}

        {error && <p className="task-page__error">{error}</p>}
        <TaskStatusActions task={task} profile={profile} onChanged={() => void load()} />
      </div>

      <div className="task-page__section">
        <h2 className="task-page__section-title">История</h2>
        <TaskHistory entries={history} />
      </div>

      <TaskFormModal
        open={editOpen}
        task={task}
        onClose={() => setEditOpen(false)}
        onSaved={() => void load()}
      />
    </section>
  )
}
