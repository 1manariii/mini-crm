import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Header } from '@/widgets/header'
import { ROUTES } from '@/shared/config/routes'
import { PageLoader } from '@/shared/ui'
import { LoginPage } from '@/pages/login'
import { ObjectsPage } from '@/pages/objects'
import { ObjectPage } from '@/pages/object'
import { TaskPage } from '@/pages/task'
import { MyTasksPage } from '@/pages/my-tasks'
import { AuthProvider, useAuth } from './providers/AuthProvider'

function RequireAuth({ children }: { children: React.ReactElement }) {
  const { session, loading } = useAuth()

  if (loading) return <PageLoader />
  if (!session) return <Navigate to={ROUTES.login} replace />
  return children
}

function Layout() {
  return (
    <>
      <Header />
      <main className="container">
        <Outlet />
      </main>
    </>
  )
}

function AppRoutes() {
  const { session, loading } = useAuth()

  return (
    <Routes>
      <Route
        path={ROUTES.login}
        element={loading ? <PageLoader /> : session ? <Navigate to={ROUTES.objects} replace /> : <LoginPage />}
      />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Navigate to={ROUTES.objects} replace />} />
        <Route path={ROUTES.objects} element={<ObjectsPage />} />
        <Route path="/objects/:id" element={<ObjectPage />} />
        <Route path="/tasks/:id" element={<TaskPage />} />
        <Route path={ROUTES.myTasks} element={<MyTasksPage />} />
        <Route path="*" element={<Navigate to={ROUTES.objects} replace />} />
      </Route>
    </Routes>
  )
}

export function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
