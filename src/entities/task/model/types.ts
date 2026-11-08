import type { Profile } from '@/entities/user'

export type TaskStatus = 'new' | 'in_work' | 'in_review' | 'rework' | 'accepted'

export interface Task {
  id: string
  title: string
  description: string
  object_id: string
  assignee_id: string
  author_id: string
  status: TaskStatus
  created_at: string
  updated_at: string
}

export interface TaskDetails extends Task {
  object: { id: string; name: string; address: string } | null
  assignee: Pick<Profile, 'id' | 'full_name'> | null
  author: Pick<Profile, 'id' | 'full_name'> | null
}

export interface TaskListItem extends Task {
  object: { id: string; name: string } | null
  assignee: Pick<Profile, 'id' | 'full_name'> | null
}

export interface TaskHistoryEntry {
  id: number
  task_id: string
  from_status: TaskStatus | null
  to_status: TaskStatus
  changed_by: string
  comment: string | null
  created_at: string
  changer: Pick<Profile, 'id' | 'full_name' | 'role'> | null
}
