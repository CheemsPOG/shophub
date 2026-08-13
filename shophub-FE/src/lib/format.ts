export function formatCurrency(value: number, opts: { decimals?: boolean } = {}): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: opts.decimals ? 2 : 0,
    maximumFractionDigits: opts.decimals ? 2 : 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

export function formatDate(iso: string, opts: { relative?: boolean; short?: boolean } = {}): string {
  const d = new Date(iso);
  if (opts.relative) {
    const diff = Date.now() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  }
  return d.toLocaleDateString('en-US', opts.short ? { month: 'short', day: 'numeric' } : { year: 'numeric', month: 'short', day: 'numeric' });
}

export function discountPercent(price: number, compareAt?: number): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function statusColor(status: string): { bg: string; text: string; dot: string } {
  const map: Record<string, { bg: string; text: string; dot: string }> = {
    active: { bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500' },
    approved: { bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500' },
    verified: { bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500' },
    completed: { bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500' },
    delivered: { bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500' },
    paid: { bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500' },
    shipped: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    processing: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    pending: { bg: 'bg-warning-50', text: 'text-warning-700', dot: 'bg-warning-500' },
    draft: { bg: 'bg-ink-100', text: 'text-ink-600', dot: 'bg-ink-400' },
    open: { bg: 'bg-warning-50', text: 'text-warning-700', dot: 'bg-warning-500' },
    under_review: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    rejected: { bg: 'bg-error-50', text: 'text-error-700', dot: 'bg-error-500' },
    cancelled: { bg: 'bg-error-50', text: 'text-error-700', dot: 'bg-error-500' },
    failed: { bg: 'bg-error-50', text: 'text-error-700', dot: 'bg-error-500' },
    refunded: { bg: 'bg-ink-100', text: 'text-ink-600', dot: 'bg-ink-400' },
    expired: { bg: 'bg-ink-100', text: 'text-ink-600', dot: 'bg-ink-400' },
    disabled: { bg: 'bg-ink-100', text: 'text-ink-600', dot: 'bg-ink-400' },
    resolved: { bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500' },
  };
  return map[status] || { bg: 'bg-ink-100', text: 'text-ink-600', dot: 'bg-ink-400' };
}

export function starColor(rating: number): string {
  if (rating >= 4.5) return 'text-accent-400';
  if (rating >= 3.5) return 'text-accent-400';
  return 'text-warning-400';
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function initials(name: string): string {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}
