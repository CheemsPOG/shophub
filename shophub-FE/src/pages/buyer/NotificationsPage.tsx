import { Link } from 'react-router-dom';
import { Bell, ChevronRight, Home, ShoppingCart, Tag, Star, Settings, Check } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { useNotifications } from '@/lib/notifications';
import { EmptyState } from '@/components/EmptyState';

const ICONS: Record<string, typeof Bell> = {
  order: ShoppingCart, promo: Tag, review: Star, system: Settings,
};

export function NotificationsPage() {
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1.5 text-sm text-ink-500">
        <Link to="/" className="flex items-center gap-1 hover:text-ink-900"><Home className="h-3.5 w-3.5" /> Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-ink-900">Notifications</span>
      </nav>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Notifications</h1>
          <p className="text-sm text-ink-500">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && <button onClick={() => void markAllRead()} className="text-sm font-medium text-brand-600 hover:text-brand-700">Mark all as read</button>}
      </div>

      {!loading && notifications.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-ink-100 bg-white">
          <EmptyState icon={<Bell className="h-7 w-7" />} title="No notifications yet" description="Updates about your orders and account will show up here." />
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {notifications.map(n => {
            const Icon = ICONS[n.type] || Bell;
            return (
              <div key={n.id} className={`flex items-start gap-4 rounded-2xl border bg-white p-4 transition-colors ${!n.read ? 'border-brand-200 bg-brand-50/30' : 'border-ink-100'}`}>
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${!n.read ? 'bg-brand-100 text-brand-600' : 'bg-ink-100 text-ink-500'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink-900">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-brand-500" />}
                  </div>
                  <p className="mt-0.5 text-sm text-ink-600">{n.body}</p>
                  <p className="mt-1 text-xs text-ink-400">{n.date ? formatDate(n.date, { relative: true }) : ''}</p>
                </div>
                {!n.read && (
                  <button onClick={() => void markRead(n.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-50 hover:text-success-600">
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
