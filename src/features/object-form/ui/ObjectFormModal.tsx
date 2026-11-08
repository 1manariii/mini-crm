import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '@/app/providers/AuthProvider'
import { createObject, updateObject } from '@/entities/object'
import type { ConstructionObject } from '@/entities/object'
import { Button, Input, Modal } from '@/shared/ui'
import './object-form.scss'

interface ObjectFormModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  /** Если передан — режим редактирования */
  object?: ConstructionObject | null
}

export function ObjectFormModal({ open, onClose, onSaved, object }: ObjectFormModalProps) {
  const { profile } = useAuth()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setName(object?.name ?? '')
      setAddress(object?.address ?? '')
      setError(null)
    }
  }, [open, object])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!profile) return
    setError(null)
    setLoading(true)
    try {
      if (object) {
        await updateObject(object.id, { name: name.trim(), address: address.trim() })
      } else {
        await createObject({
          name: name.trim(),
          address: address.trim(),
          created_by: profile.id,
        })
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить объект')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      title={object ? 'Редактировать объект' : 'Новый объект'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" form="object-form" loading={loading}>
            Сохранить
          </Button>
        </>
      }
    >
      <form id="object-form" className="object-form" onSubmit={handleSubmit}>
        {error && <p className="object-form__error">{error}</p>}
        <Input
          id="object-name"
          label="Название"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Input
          id="object-address"
          label="Адрес"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />
      </form>
    </Modal>
  )
}
