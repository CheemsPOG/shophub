import { useEffect, useState, type FormEvent } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { User, Package, Heart, MapPin, Bell, CreditCard, Settings, ChevronRight, Home } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { Avatar } from '@/components/Avatar';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { api } from '@/lib/api';
import type { Order } from '@/lib/data';

const TABS = [
  { to: '/account', label: 'Profile', icon: User, end: true },
  { to: '/orders', label: 'Orders', icon: Package },
  { to: '/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/addresses', label: 'Addresses', icon: MapPin },
  { to: '/account/payments', label: 'Payment methods', icon: CreditCard },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/account/settings', label: 'Settings', icon: Settings },
];

export function AccountPage() {
  const { user } = useAuth();
  const { wishlistCount } = useCart();
  const [orderCount, setOrderCount] = useState<number | null>(null);

  useEffect(() => {
    api<Order[]>('/orders').then(data => setOrderCount((data ?? []).length)).catch(() => setOrderCount(0));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1.5 text-sm text-ink-500">
        <Link to="/" className="flex items-center gap-1 hover:text-ink-900"><Home className="h-3.5 w-3.5" /> Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-ink-900">My account</span>
      </nav>

      <div className="mt-6 grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="rounded-2xl border border-ink-100 bg-white p-5">
            <div className="flex items-center gap-3">
              <Avatar src={user?.avatar} className="h-14 w-14 rounded-2xl" />
              <div>
                <p className="font-semibold text-ink-900">{user?.name ?? 'Guest'}</p>
                <p className="text-xs text-ink-500">{user?.joinedAt ? `Member since ${formatDate(user.joinedAt, { short: true })}` : ''}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-ink-50 p-2">
                <p className="text-lg font-bold text-ink-900">{orderCount ?? '–'}</p>
                <p className="text-xs text-ink-500">Orders</p>
              </div>
              <div className="rounded-xl bg-ink-50 p-2">
                <p className="text-lg font-bold text-ink-900">{wishlistCount}</p>
                <p className="text-xs text-ink-500">Wishlist</p>
              </div>
            </div>
          </div>

          <nav className="mt-3 space-y-1 rounded-2xl border border-ink-100 bg-white p-2">
            {TABS.map(t => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50'}`}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function AccountProfile() {
  const { user } = useAuth();
  const [firstName, lastName] = (user?.name ?? '').split(/\s+/, 2);
  const [form, setForm] = useState({ firstName: firstName ?? '', lastName: lastName ?? '', phone: user?.phone ?? '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await api('/me', {
        method: 'PATCH',
        body: JSON.stringify({ name: `${form.firstName} ${form.lastName}`.trim(), phone: form.phone }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-ink-100 bg-white p-6">
      <h1 className="font-display text-xl font-bold text-ink-900">Profile information</h1>
      <p className="text-sm text-ink-500">Update your personal details</p>

      <div className="mt-6 flex items-center gap-4">
        <Avatar src={user?.avatar} className="h-20 w-20 rounded-2xl" />
        <div>
          <button type="button" className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">Change photo</button>
          <p className="mt-2 text-xs text-ink-500">JPG, PNG. Max 2MB.</p>
        </div>
      </div>

      {error && <p className="mt-4 rounded-xl bg-error-50 px-3 py-2 text-sm text-error-600">{error}</p>}
      {saved && <p className="mt-4 rounded-xl bg-success-50 px-3 py-2 text-sm text-success-700">Changes saved.</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-ink-700">First name</label>
          <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink-700">Last name</label>
          <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink-700">Email</label>
          <input disabled value={user?.email ?? ''} className="mt-1.5 w-full rounded-xl border border-ink-200 bg-ink-50 px-4 py-2.5 text-sm text-ink-500" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink-700">Phone</label>
          <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button type="submit" disabled={saving} className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50">{saving ? 'Saving…' : 'Save changes'}</button>
      </div>
    </form>
  );
}

export function AccountSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <h1 className="font-display text-xl font-bold text-ink-900">Notifications</h1>
        <p className="text-sm text-ink-500">Manage how we contact you</p>
        <div className="mt-4 space-y-3">
          {[
            { label: 'Order updates', desc: 'Get notified about your order status', on: true },
            { label: 'Promotions & deals', desc: 'Receive offers and sale alerts', on: true },
            { label: 'Newsletter', desc: 'Weekly digest of new arrivals', on: false },
            { label: 'Review requests', desc: 'Ask for reviews after delivery', on: true },
          ].map(n => (
            <div key={n.label} className="flex items-center justify-between border-b border-ink-50 pb-3 last:border-0">
              <div>
                <p className="text-sm font-medium text-ink-900">{n.label}</p>
                <p className="text-xs text-ink-500">{n.desc}</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" defaultChecked={n.on} className="peer sr-only" />
                <div className="h-6 w-11 rounded-full bg-ink-200 transition-colors peer-checked:bg-brand-500 peer-focus:ring-2 peer-focus:ring-brand-100" />
                <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
              </label>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-400">Notification preferences are not yet persisted to your account.</p>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <h1 className="font-display text-xl font-bold text-ink-900">Security</h1>
        <p className="text-sm text-ink-500">Keep your account safe</p>
        <div className="mt-4 space-y-3">
          <Link to="/forgot-password" className="flex w-full items-center justify-between rounded-xl border border-ink-200 px-4 py-3 text-sm font-medium text-ink-700 hover:bg-ink-50">
            Change password <ChevronRight className="h-4 w-4 text-ink-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
