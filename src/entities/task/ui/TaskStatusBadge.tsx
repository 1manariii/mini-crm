import { TASK_STATUS_LABELS } from '../model/status'
import type { TaskStatus } from '../model/types'
import './task-status-badge.scss'

interface TaskStatusBadgeProps {
  status: TaskStatus
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  return (
    <span className={`task-status-badge task-status-badge--${status}`}>
      {TASK_STATUS_LABELS[status]}
    </span>
  )
}
