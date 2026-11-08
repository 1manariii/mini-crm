export type UserRole = 'manager' | 'executor'

export interface Profile {
  id: string
  full_name: string
  role: UserRole
}

export const ROLE_LABELS: Record<UserRole, string> = {
  manager: 'Постановщик',
  executor: 'Исполнитель',
}
