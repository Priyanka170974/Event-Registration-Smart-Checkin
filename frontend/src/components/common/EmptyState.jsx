import { Inbox } from 'lucide-react';

export function EmptyState({ title = 'Nothing here yet', description, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Inbox size={22} /></span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
