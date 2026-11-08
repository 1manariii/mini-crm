import { useAuth } from '@/app/providers/AuthProvider'
import { Button } from '@/shared/ui'

export function LogoutButton() {
  const { signOut } = useAuth()

  return (
    <Button variant="ghost" size="small" onClick={() => void signOut()}>
      Выйти
    </Button>
  )
}
