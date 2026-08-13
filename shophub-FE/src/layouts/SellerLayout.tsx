import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Plus, BarChart3, Wallet,
  MessageSquare, Settings, Store, Bell, Menu, X, LogOut, LifeBuoy, FileText,
  ChevronDown, User, Check,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Avatar } from '@/components/Avatar';
import { useAuth } from '@/lib/auth';
import { useNotifications } from '@/lib/notifications';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';

type ShopDto = { businessName: string; status: string };

const NAV = [
  { to: '/seller', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/seller/products', label: 'Products', icon: Package },
  { to: '/seller/products/new', label: 'Add Product', icon: Plus },
  { to: '/seller/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/seller/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/seller/payouts', label: 'Payouts', icon: Wallet },
  { to: '/seller/messages', label: 'Messages', icon: MessageSquare },
  { to: '/seller/settings', label: 'Settings', icon: Settings },
];

export function SellerLayout() {
  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [shop, setShop] = useState<ShopDto | null>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  useEffect(() => {
    api<ShopDto>('/seller/shop').then(setShop).catch(() => setShop(null));
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
      isActive
        ? 'bg-brand-50 text-brand-700'
        : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
    }`;

  return (
    <div className="min-h-screen bg-ink-50 lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-ink-100 bg-white lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-ink-100 px-5">
          <Logo size="sm" to="/seller" />
        </div>
        <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-4">
          <Avatar className="h-10 w-10 rounded-xl" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-900">{shop?.businessName ?? 'My Store'}</p>
            {shop?.status === 'verified' ? (
              <span className="inline-flex items-center gap-1 text-xs text-success-600">
                <span className="h-1.5 w-1.5 rounded-full bg-success-500" /> Verified seller
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-ink-400 capitalize">
                <span className="h-1.5 w-1.5 rounded-full bg-ink-300" /> {shop?.status ?? 'Loading…'}
              </span>
            )}
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Menu</p>
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              <item.icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
              {item.label}
            </NavLink>
          ))}
          <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-ink-400">Help</p>
          <NavLink to="/seller/support" className={linkClass}><LifeBuoy style={{ width: 18, height: 18 }} />Support</NavLink>
          <NavLink to="/seller/guide" className={linkClass}><FileText style={{ width: 18, height: 18 }} />Seller Guide</NavLink>
        </nav>
        <div className="border-t border-ink-100 p-3">
          <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 p-4 text-white">
            <Store className="h-6 w-6" />
            <p className="mt-2 text-sm font-semibold">Upgrade to Pro</p>
            <p className="text-xs text-white/80">Lower fees and advanced analytics.</p>
            <button className="mt-3 w-full rounded-lg bg-white/20 py-2 text-xs font-semibold backdrop-blur hover:bg-white/30">Learn more</button>
          </div>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 animate-slide-up overflow-y-auto bg-white">
            <div className="flex h-16 items-center justify-between border-b border-ink-100 px-5">
              <Logo size="sm" to="/seller" />
              <button onClick={() => setOpen(false)}><X className="h-6 w-6 text-ink-600" /></button>
            </div>
            <nav className="space-y-1 p-3">
              {NAV.map(item => (
                <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={() => setOpen(false)}>
                  <item.icon style={{ width: 18, height: 18 }} />{item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-100 bg-white/95 px-4 backdrop-blur-md sm:px-6">
          <button className="lg:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-6 w-6 text-ink-700" />
          </button>
          <div>
            <h1 className="font-display text-lg font-bold text-ink-900">Seller Portal</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/" className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50">
              <Store className="h-4 w-4" /> View store
            </Link>
            <div className="relative">
              <button
                onClick={() => setNotifOpen(o => !o)}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-600 hover:bg-ink-50"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">{unreadCount}</span>}
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-2 w-80 animate-scale-in overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-lift">
                    <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
                      <span className="text-sm font-semibold text-ink-900">Notifications</span>
                      {unreadCount > 0 ? (
                        <button onClick={() => void markAllRead()} className="text-xs font-medium text-brand-600 hover:text-brand-700">Mark all read</button>
                      ) : (
                        <span className="text-xs text-ink-400">All caught up</span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 && (
                        <p className="px-4 py-8 text-center text-sm text-ink-400">No notifications yet.</p>
                      )}
                      {notifications.map(n => (
                        <div key={n.id} className={`flex gap-3 border-b border-ink-50 px-4 py-3 ${!n.read ? 'bg-brand-50/40' : ''}`}>
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-500">
                            <Bell className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-ink-900">{n.title}</p>
                            <p className="text-xs text-ink-500 line-clamp-2">{n.body}</p>
                            <p className="mt-1 text-xs text-ink-400">{n.date ? formatDate(n.date, { relative: true }) : ''}</p>
                          </div>
                          {!n.read && (
                            <button onClick={() => void markRead(n.id)} className="shrink-0 self-start text-ink-400 hover:text-success-600" aria-label="Mark as read">
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setUserOpen(o => !o)}
                className="flex items-center gap-1.5 rounded-xl p-1 transition-colors hover:bg-ink-50"
              >
                <Avatar className="h-8 w-8 rounded-lg" />
                <ChevronDown className="hidden h-4 w-4 text-ink-400 sm:block" />
              </button>
              {userOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-2 w-60 animate-scale-in overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-lift">
                    <div className="border-b border-ink-100 px-4 py-3">
                      <p className="text-sm font-semibold text-ink-900">{user?.name ?? 'Seller'}</p>
                      <p className="text-xs text-ink-500">{user?.email ?? 'seller@shophub.com'}</p>
                    </div>
                    <div className="p-1.5">
                      {[
                        { to: '/seller', icon: LayoutDashboard, label: 'Dashboard' },
                        { to: '/seller/settings', icon: User, label: 'Store profile' },
                        { to: '/seller/payouts', icon: Wallet, label: 'Payouts' },
                        { to: '/seller/analytics', icon: BarChart3, label: 'Analytics' },
                        { to: '/seller/messages', icon: MessageSquare, label: 'Messages' },
                        { to: '/seller/settings', icon: Settings, label: 'Settings' },
                      ].filter((item, i, arr) => arr.findIndex(x => x.label === item.label) === i).map(item => (
                        <Link
                          key={item.label}
                          to={item.to}
                          onClick={() => setUserOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-700 transition-colors hover:bg-ink-50"
                        >
                          <item.icon className="h-4 w-4 text-ink-400" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-ink-100 p-1.5">
                      <button
                        type="button"
                        onClick={() => { setUserOpen(false); void logout().then(() => navigate('/login/seller')); }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-error-600 transition-colors hover:bg-error-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
