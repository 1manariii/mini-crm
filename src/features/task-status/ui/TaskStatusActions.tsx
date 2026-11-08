import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  TRANSITION_LABELS,
  changeTaskStatus,
  getAvailableTransitions,
} from '@/entities/task'
import type { Task, TaskStatus } from '@/entities/task'
import type { Profile } from '@/entities/user'
import { Button, Modal, Textarea } from '@/shared/ui'
import './task-status-actions.scss'

interface TaskStatusActionsProps {
  task: Task
  profile: Profile
  onChanged: () => void
}

export function TaskStatusActions({ task, profile, onChanged }: TaskStatusActionsProps) {
  const [reworkModalOpen, setReworkModalOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const transitions = getAvailableTransitions(task, profile.id, profile.role)

  if (transitions.length === 0) return null

  const runTransition = async (status: TaskStatus, transitionComment?: string) => {
    setError(null)
    setLoading(true)
    try {
      await changeTaskStatus(task.id, status, transitionComment)
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось изменить статус')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleTransitionClick = (status: TaskStatus) => {
    if (status === 'rework') {
      setComment('')
      setError(null)
      setReworkModalOpen(true)
      return
    }
    void runTransition(status).catch(() => undefined)
  }

  const handleReworkSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!comment.trim()) {
      setError('Комментарий обязателен при возврате на доработку')
      return
    }
    try {
      await runTransition('rework', comment.trim())
      setReworkModalOpen(false)
    } catch {
      // ошибка уже показана
    }
  }

  const buttonVariant = (status: TaskStatus) =>
    status === 'rework' ? ('danger' as const) : ('primary' as const)

  return (
    <div className="task-status-actions">
      {error && !reworkModalOpen && <p className="task-status-actions__error">{error}</p>}
      {transitions.map((status) => (
        <Button
          key={status}
          variant={buttonVariant(status)}
          loading={loading && !reworkModalOpen}
          onClick={() => handleTransitionClick(status)}
        >
          {TRANSITION_LABELS[status]}
        </Button>
      ))}

      <Modal
        open={reworkModalOpen}
        title="Вернуть на доработку"
        onClose={() => setReworkModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setReworkModalOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" form="rework-form" variant="danger" loading={loading}>
              Вернуть на доработку
            </Button>
          </>
        }
      >
        <form id="rework-form" className="rework-form" onSubmit={handleReworkSubmit}>
          {error && <p className="rework-form__error">{error}</p>}
          <Textarea
            id="rework-comment"
            label="Комментарий (обязательно)"
            required
            autoFocus
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
        </form>
      </Modal>
    </div>
  )
}
