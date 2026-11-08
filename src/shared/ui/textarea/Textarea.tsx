import type { TextareaHTMLAttributes } from 'react'
import '../form/form.scss'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, id, ...rest }: TextareaProps) {
  return (
    <div className="field">
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <textarea className="textarea" id={id} {...rest} />
      {error && <span className="field__error">{error}</span>}
    </div>
  )
}
