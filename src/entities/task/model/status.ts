import type { UserRole } from '@/entities/user'
import type { Task, TaskStatus } from './types'

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  new: 'Новая',
  in_work: 'В работе',
  in_review: 'На проверке',
  rework: 'На доработке',
  accepted: 'Принята',
}

export const TASK_STATUS_ORDER: TaskStatus[] = ['new', 'in_work', 'in_review', 'rework', 'accepted']

/**
 * Клиентское зеркало матрицы переходов — только для отображения кнопок.
 * Реальная проверка выполняется в базе функцией change_task_status().
 */
export function getAvailableTransitions(task: Task, userId: string, role: UserRole): TaskStatus[] {
  const isAssignee = task.assignee_id === userId

  switch (task.status) {
    case 'new':
      return isAssignee ? ['in_work'] : []
    case 'in_work':
      return isAssignee ? ['in_review'] : []
    case 'in_review':
      return role === 'manager' ? ['accepted', 'rework'] : []
    case 'rework':
      return isAssignee ? ['in_work'] : []
    default:
      return []
  }
}

export const TRANSITION_LABELS: Record<TaskStatus, string> = {
  new: 'Новая',
  in_work: 'Взять в работу',
  in_review: 'Отправить на проверку',
  rework: 'Вернуть на доработку',
  accepted: 'Принять',
}
