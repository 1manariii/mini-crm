import { Link } from 'react-router-dom'
import { TaskStatusBadge } from '@/entities/task'
import type { TaskListItem } from '@/entities/task'
import { ROUTES } from '@/shared/config/routes'
import { formatDate } from '@/shared/lib/formatDate'
import { EmptyState } from '@/shared/ui'
import './task-list.scss'

interface TaskListProps {
  tasks: TaskListItem[]
  /** Показывать объект в мета-строке (для «Моих задач») */
  showObject?: boolean
  /** Показывать исполнителя в мета-строке (для карточки объекта) */
  showAssignee?: boolean
}

export function TaskList({ tasks, showObject = false, showAssignee = false }: TaskListProps) {
  if (tasks.length === 0) {
    return <EmptyState title="Задач пока нет" />
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task.id} className="task-list__item">
          <div className="task-list__main">
            <Link className="task-list__title" to={ROUTES.task(task.id)}>
              {task.title}
            </Link>
            <span className="task-list__meta">
              {showObject && task.object && <>Объект: {task.object.name} · </>}
              {showAssignee && task.assignee && <>Исполнитель: {task.assignee.full_name} · </>}
              {formatDate(task.created_at)}
            </span>
          </div>
          <span className="task-list__status">
            <TaskStatusBadge status={task.status} />
          </span>
        </li>
      ))}
    </ul>
  )
}
