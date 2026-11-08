import { TASK_STATUS_LABELS } from '@/entities/task'
import type { TaskHistoryEntry } from '@/entities/task'
import { ROLE_LABELS } from '@/entities/user'
import { formatDateTime } from '@/shared/lib/formatDate'
import './task-history.scss'

interface TaskHistoryProps {
  entries: TaskHistoryEntry[]
}

export function TaskHistory({ entries }: TaskHistoryProps) {
  return (
    <ol className="task-history">
      {entries.map((entry) => (
        <li key={entry.id} className="task-history__item">
          <p className="task-history__transition">
            {entry.from_status
              ? `${TASK_STATUS_LABELS[entry.from_status]} → ${TASK_STATUS_LABELS[entry.to_status]}`
              : `Создана со статусом «${TASK_STATUS_LABELS[entry.to_status]}»`}
          </p>
          <p className="task-history__meta">
            {entry.changer ? entry.changer.full_name : 'Неизвестный пользователь'}
            {entry.changer && ` (${ROLE_LABELS[entry.changer.role]})`} ·{' '}
            {formatDateTime(entry.created_at)}
          </p>
          {entry.comment && <p className="task-history__comment">{entry.comment}</p>}
        </li>
      ))}
    </ol>
  )
}
