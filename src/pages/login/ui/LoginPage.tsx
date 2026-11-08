import { LoginForm } from '@/features/auth'
import './login-page.scss'

export function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-page__card">
        <h1 className="login-page__title">Мини-CRM</h1>
        <p className="login-page__subtitle">Объекты и задачи строительной компании</p>
        <LoginForm />
      </div>
    </div>
  )
}
