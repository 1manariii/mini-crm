import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '@/app/providers/AuthProvider'
import { fetchObjects } from '@/entities/object'
import type { ConstructionObject } from '@/entities/object'
import { createTask, updateTask } from '@/entities/task'
import type { TaskDetails } from '@/entities/task'
import { fetchExecutors } from '@/entities/user'
import type { Profile } from '@/entities/user'
import { Button, Input, Modal, Select, Textarea } from '@/shared/ui'
import './task-form.scss'

interface TaskFormModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  /** Если передан — режим редактирования */
  task?: TaskDetails | null
  /** Предвыбранный объект (при создании из карточки объекта) */
  objectId?: string
}

export function TaskFormModal({ open, onClose, onSaved, task, objectId }: TaskFormModalProps) {
  const { profile } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedObjectId, setSelectedObjectId] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [objects, setObjects] = useState<ConstructionObject[]>([])
  const [executors, setExecutors] = useState<Profile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setTitle(task?.title ?? '')
    setDescription(task?.description ?? '')
    setSelectedObjectId(task?.object_id ?? objectId ?? '')
    setAssigneeId(task?.assignee_id ?? '')
    setError(null)

    void Promise.all([fetchObjects(), fetchExecutors()])
      .then(([fetchedObjects, fetchedExecutors]) => {
        setObjects(fetchedObjects)
        setExecutors(fetchedExecutors)
        if (!task && !objectId && fetchedObjects.length === 1) {
          setSelectedObjectId(fetchedObjects[0].id)
        }
      })
      .catch(() => setError('Не удалось загрузить списки объектов и исполнителей'))
  }, [open, task, objectId])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!profile) return
    if (!selectedObjectId || !assigneeId) {
      setError('Выберите объект и исполнителя')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const input = {
        title: title.trim(),
        description: description.trim(),
        object_id: selectedObjectId,
        assignee_id: assigneeId,
      }
      if (task) {
        await updateTask(task.id, input)
      } else {
        await createTask({ ...input, author_id: profile.id })
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить задачу')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      title={task ? 'Редактировать задачу' : 'Новая задача'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" form="task-form" loading={loading}>
            Сохранить
          </Button>
        </>
      }
    >
      <form id="task-form" className="task-form" onSubmit={handleSubmit}>
        {error && <p className="task-form__error">{error}</p>}
        <Input
          id="task-title"
          label="Название"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <Textarea
          id="task-description"
          label="Описание"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <Select
          id="task-object"
          label="Объект"
          required
          value={selectedObjectId}
          onChange={(event) => setSelectedObjectId(event.target.value)}
        >
          <option value="" disabled>
            Выберите объект
          </option>
          {objects.map((object) => (
            <option key={object.id} value={object.id}>
              {object.name}
            </option>
          ))}
        </Select>
        <Select
          id="task-assignee"
          label="Исполнитель"
          required
          value={assigneeId}
          onChange={(event) => setAssigneeId(event.target.value)}
        >
          <option value="" disabled>
            Выберите исполнителя
          </option>
          {executors.map((executor) => (
            <option key={executor.id} value={executor.id}>
              {executor.full_name}
            </option>
          ))}
        </Select>
      </form>
    </Modal>
  )
}
