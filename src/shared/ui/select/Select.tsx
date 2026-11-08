import type { SelectHTMLAttributes } from 'react'
import '../form/form.scss'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export function Select({ label, error, id, children, ...rest }: SelectProps) {
  return (
    <div className="field">
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <select className="select" id={id} {...rest}>
        {children}
      </select>
      {error && <span className="field__error">{error}</span>}
    </div>
  )
}
