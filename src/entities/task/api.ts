import { supabase } from '@/shared/api/supabase'
import type { Task, TaskDetails, TaskHistoryEntry, TaskListItem, TaskStatus } from './model/types'

const LIST_SELECT = '*, object:objects(id, name), assignee:profiles!tasks_assignee_id_fkey(id, full_name)'

export async function fetchTasksByObject(objectId: string): Promise<TaskListItem[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select(LIST_SELECT)
    .eq('object_id', objectId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as unknown as TaskListItem[]
}

export async function fetchMyTasks(assigneeId: string): Promise<TaskListItem[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select(LIST_SELECT)
    .eq('assignee_id', assigneeId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as unknown as TaskListItem[]
}

export async function fetchTask(id: string): Promise<TaskDetails | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select(
      '*, object:objects(id, name, address), assignee:profiles!tasks_assignee_id_fkey(id, full_name), author:profiles!tasks_author_id_fkey(id, full_name)',
    )
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data as unknown as TaskDetails | null
}

export async function fetchTaskHistory(taskId: string): Promise<TaskHistoryEntry[]> {
  const { data, error } = await supabase
    .from('task_status_history')
    .select('*, changer:profiles!task_status_history_changed_by_fkey(id, full_name, role)')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })

  if (error) throw error
  return data as unknown as TaskHistoryEntry[]
}

export async function createTask(input: {
  title: string
  description: string
  object_id: string
  assignee_id: string
  author_id: string
}): Promise<Task> {
  const { data, error } = await supabase.from('tasks').insert(input).select().single()

  if (error) throw error
  return data as Task
}

export async function updateTask(
  id: string,
  input: {
    title: string
    description: string
    object_id: string
    assignee_id: string
  },
): Promise<void> {
  const { error } = await supabase.from('tasks').update(input).eq('id', id)

  if (error) throw error
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id)

  if (error) throw error
}

export async function changeTaskStatus(
  taskId: string,
  status: TaskStatus,
  comment?: string,
): Promise<void> {
  const { error } = await supabase.rpc('change_task_status', {
    p_task_id: taskId,
    p_new_status: status,
    p_comment: comment ?? null,
  })

  if (error) throw error
}
