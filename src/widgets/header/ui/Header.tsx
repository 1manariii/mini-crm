import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { ROLE_LABELS } from '@/entities/user'
import { LogoutButton } from '@/features/auth'
import { ROUTES } from '@/shared/config/routes'
import './header.scss'

export function Header() {
  const { profile } = useAuth()

  return (
    <header className="header">
      <div className="header__inner container">
        <Link className="header__logo" to={ROUTES.objects}>
          Мини-CRM
        </Link>
        <nav className="header__nav">
          <NavLink
            className={({ isActive }) =>
              `header__nav-link${isActive ? ' header__nav-link--active' : ''}`
            }
            to={ROUTES.objects}
          >
            Объекты
          </NavLink>
          {profile?.role === 'executor' && (
            <NavLink
              className={({ isActive }) =>
                `header__nav-link${isActive ? ' header__nav-link--active' : ''}`
              }
              to={ROUTES.myTasks}
            >
              Мои задачи
            </NavLink>
          )}
        </nav>
        <div className="header__user">
          {profile && (
            <>
              <span className="header__user-name">{profile.full_name}</span>
              <span className="header__user-role">{ROLE_LABELS[profile.role]}</span>
            </>
          )}
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
