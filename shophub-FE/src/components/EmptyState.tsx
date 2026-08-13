interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; to?: string; onClick?: () => void };
}

import { Link } from 'react-router-dom';

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-50 text-ink-300">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-ink-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>}
      {action && (
        <Link
          to={action.to || '#'}
          onClick={action.onClick}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
