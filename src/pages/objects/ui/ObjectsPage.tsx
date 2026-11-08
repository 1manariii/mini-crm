import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { fetchObjects } from '@/entities/object'
import type { ConstructionObject } from '@/entities/object'
import { ObjectFormModal } from '@/features/object-form'
import { ROUTES } from '@/shared/config/routes'
import { Button, EmptyState, PageLoader } from '@/shared/ui'
import './objects-page.scss'

export function ObjectsPage() {
  const { profile } = useAuth()
  const [objects, setObjects] = useState<ConstructionObject[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const isManager = profile?.role === 'manager'

  const load = useCallback(async () => {
    try {
      setObjects(await fetchObjects())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить объекты')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <section className="objects-page">
      <div className="objects-page__header">
        <h1 className="objects-page__title">Объекты</h1>
        {isManager && <Button onClick={() => setCreateOpen(true)}>Новый объект</Button>}
      </div>

      {error && <p className="objects-page__error">{error}</p>}
      {!objects && !error && <PageLoader />}
      {objects && objects.length === 0 && (
        <EmptyState
          title="Объектов пока нет"
          text={
            isManager
              ? 'Создайте первый объект, чтобы ставить по нему задачи.'
              : 'У вас пока нет задач ни на одном объекте.'
          }
        />
      )}
      {objects && objects.length > 0 && (
        <div className="objects-page__list">
          {objects.map((object) => (
            <Link key={object.id} className="object-card" to={ROUTES.object(object.id)}>
              <p className="object-card__name">{object.name}</p>
              <p className="object-card__address">{object.address}</p>
            </Link>
          ))}
        </div>
      )}

      <ObjectFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={() => void load()}
      />
    </section>
  )
}
