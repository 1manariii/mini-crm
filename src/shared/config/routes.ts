export const ROUTES = {
  login: '/login',
  objects: '/objects',
  object: (id: string) => `/objects/${id}`,
  task: (id: string) => `/tasks/${id}`,
  myTasks: '/my-tasks',
} as const
