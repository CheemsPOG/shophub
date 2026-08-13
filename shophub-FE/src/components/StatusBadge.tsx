interface BadgeProps {
  status: string;
  label?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, label, size = 'sm' }: BadgeProps) {
  const colors: Record<string, string> = {
    active: 'bg-success-50 text-success-700 ring-success-200',
    approved: 'bg-success-50 text-success-700 ring-success-200',
    verified: 'bg-success-50 text-success-700 ring-success-200',
    completed: 'bg-success-50 text-success-700 ring-success-200',
    delivered: 'bg-success-50 text-success-700 ring-success-200',
    paid: 'bg-success-50 text-success-700 ring-success-200',
    shipped: 'bg-blue-50 text-blue-700 ring-blue-200',
    processing: 'bg-blue-50 text-blue-700 ring-blue-200',
    pending: 'bg-warning-50 text-warning-700 ring-warning-200',
    draft: 'bg-ink-100 text-ink-600 ring-ink-200',
    open: 'bg-warning-50 text-warning-700 ring-warning-200',
    under_review: 'bg-blue-50 text-blue-700 ring-blue-200',
    rejected: 'bg-error-50 text-error-700 ring-error-200',
    cancelled: 'bg-error-50 text-error-700 ring-error-200',
    failed: 'bg-error-50 text-error-700 ring-error-200',
    refunded: 'bg-ink-100 text-ink-600 ring-ink-200',
    expired: 'bg-ink-100 text-ink-600 ring-ink-200',
    disabled: 'bg-ink-100 text-ink-600 ring-ink-200',
    resolved: 'bg-success-50 text-success-700 ring-success-200',
  };

  const dots: Record<string, string> = {
    active: 'bg-success-500',
    approved: 'bg-success-500',
    verified: 'bg-success-500',
    completed: 'bg-success-500',
    delivered: 'bg-success-500',
    paid: 'bg-success-500',
    shipped: 'bg-blue-500',
    processing: 'bg-blue-500',
    pending: 'bg-warning-500',
    draft: 'bg-ink-400',
    open: 'bg-warning-500',
    under_review: 'bg-blue-500',
    rejected: 'bg-error-500',
    cancelled: 'bg-error-500',
    failed: 'bg-error-500',
    refunded: 'bg-ink-400',
    expired: 'bg-ink-400',
    disabled: 'bg-ink-400',
    resolved: 'bg-success-500',
  };

  const text = label || status.replace(/_/g, ' ');
  const pad = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium capitalize ring-1 ring-inset ${colors[status] || colors.draft} ${pad}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status] || dots.draft}`} />
      {text}
    </span>
  );
}
