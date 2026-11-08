import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '@/app/providers/AuthProvider'
import { Button, Input } from '@/shared/ui'
import './login-form.scss'

export function LoginForm() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn(email.trim(), password)
    } catch {
      setError('Не удалось войти. Проверьте email и пароль.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {error && <p className="login-form__error">{error}</p>}
      <Input
        id="login-email"
        label="Email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Input
        id="login-password"
        label="Пароль"
        type="password"
        required
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <Button type="submit" loading={loading}>
        Войти
      </Button>
    </form>
  )
}
