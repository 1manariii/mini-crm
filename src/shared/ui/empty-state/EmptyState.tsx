import './empty-state.scss'

interface EmptyStateProps {
  title: string
  text?: string
}

export function EmptyState({ title, text }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <p className="empty-state__title">{title}</p>
      {text && <p className="empty-state__text">{text}</p>}
    </div>
  )
}
