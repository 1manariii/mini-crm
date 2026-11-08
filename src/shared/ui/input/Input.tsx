import type { InputHTMLAttributes } from 'react'
import '../form/form.scss'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, id, ...rest }: InputProps) {
  return (
    <div className="field">
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <input className="input" id={id} {...rest} />
      {error && <span className="field__error">{error}</span>}
    </div>
  )
}
