import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { deleteObject, fetchObject } from '@/entities/object'
import type { ConstructionObject } from '@/entities/object'
import { fetchTasksByObject } from '@/entities/task'
import type { TaskListItem } from '@/entities/task'
import { ObjectFormModal } from '@/features/object-form'
import { TaskFormModal } from '@/features/task-form'
import { ROUTES } from '@/shared/config/routes'
import { Button, EmptyState, PageLoader } from '@/shared/ui'
import { TaskList } from '@/widgets/task-list'
import './object-page.scss'

export function ObjectPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [object, setObject] = useState<ConstructionObject | null>(null)
  const [tasks, setTasks] = useState<TaskListItem[] | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [taskCreateOpen, setTaskCreateOpen] = useState(false)

  const isManager = profile?.role === 'manager'

  const load = useCallback(async () => {
    if (!id) return
    try {
      const fetchedObject = await fetchObject(id)
      if (!fetchedObject) {
        setNotFound(true)
        return
      }
      setObject(fetchedObject)
      setTasks(await fetchTasksByObject(id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить объект')
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const handleDelete = async () => {
    if (!object) return
    if (!window.confirm(`Удалить объект «${object.name}» вместе со всеми задачами?`)) return
    try {
      await deleteObject(object.id)
      navigate(ROUTES.objects)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить объект')
    }
  }

  if (notFound) {
    return <EmptyState title="Объект не найден" text="Возможно, он удалён или у вас нет к нему доступа." />
  }

  if (!object) {
    return error ? <p className="object-page__error">{error}</p> : <PageLoader />
  }

  return (
    <section className="object-page">
      <Link className="object-page__back" to={ROUTES.objects}>
        ← К списку объектов
      </Link>
      <div className="object-page__header">
        <div>
          <h1 className="object-page__title">{object.name}</h1>
          <p className="object-page__address">{object.address}</p>
        </div>
        {isManager && (
          <div className="object-page__actions">
            <Button variant="secondary" size="small" onClick={() => setEditOpen(true)}>
              Редактировать
            </Button>
            <Button variant="danger" size="small" onClick={() => void handleDelete()}>
              Удалить
            </Button>
          </div>
        )}
      </div>

      {error && <p className="object-page__error">{error}</p>}

      <div className="object-page__section">
        <div className="object-page__section-header">
          <h2 className="object-page__section-title">Задачи</h2>
          {isManager && (
            <Button size="small" onClick={() => setTaskCreateOpen(true)}>
              Новая задача
            </Button>
          )}
        </div>
        {!tasks && <PageLoader />}
        {tasks && (
          <TaskList
            tasks={tasks}
            showAssignee={isManager}
          />
        )}
      </div>

      <ObjectFormModal
        open={editOpen}
        object={object}
        onClose={() => setEditOpen(false)}
        onSaved={() => void load()}
      />
      <TaskFormModal
        open={taskCreateOpen}
        objectId={object.id}
        onClose={() => setTaskCreateOpen(false)}
        onSaved={() => void load()}
      />
    </section>
  )
}
