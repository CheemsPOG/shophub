import { FormEvent, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, Heart, ShoppingCart, User, Menu, X, Bell, Package,
  ChevronDown, LogOut, Settings, MapPin, HelpCircle, Check,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Avatar } from '@/components/Avatar';
import type { Category } from '@/lib/data';
import { formatDate } from '@/lib/format';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { useNotifications } from '@/lib/notifications';
import { api } from '@/lib/api';

export function BuyerLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { cartCount, wishlistCount } = useCart();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const applySearch = (raw: string) => {
    const q = raw.trim();
    if (location.pathname === '/shop') {
      const next = new URLSearchParams(searchParams);
      if (q) next.set('q', q); else next.delete('q');
      if (next.toString() !== searchParams.toString()) {
        setSearchParams(next, { replace: true });
      }
      return;
    }
    if (q) navigate(`/shop?q=${encodeURIComponent(q)}`);
  };

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const current = (searchParams.get('q') || '').trim();
      const next = searchQuery.trim();
      if (next === current) return;
      if (!next && location.pathname !== '/shop') return;
      applySearch(searchQuery);
    }, 350);
    return () => window.clearTimeout(handle);
  }, [searchQuery]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    applySearch(searchQuery);
  };

  useEffect(() => {
    api<Category[] | { items: Category[] }>('/catalog/categories')
      .then(data => {
        const list = Array.isArray(data) ? data : data.items;
        setCategories((list ?? []).map(c => ({ ...c, subcategories: c.subcategories ?? [] })));
      })
      .catch(() => setCategories([]));
  }, []);

  const navLink = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'}`;

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Top announcement bar */}
      <div className="bg-ink-900 text-center text-xs font-medium text-white py-2 px-4">
        Free shipping on orders over $50 — Shop the End of Summer Sale up to 40% off
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-ink-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-6 w-6 text-ink-700" />
          </button>

          <Logo />

          {/* Category dropdown */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setCatOpen(o => !o)}
              className="flex items-center gap-1.5 rounded-xl border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
            >
              <Menu className="h-4 w-4" />
              Categories
              <ChevronDown className="h-4 w-4" />
            </button>
            {catOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setCatOpen(false)} />
                <div className="absolute left-0 top-full z-20 mt-2 w-72 animate-scale-in rounded-2xl border border-ink-100 bg-white p-2 shadow-lift">
                  {categories.length === 0 && (
                    <p className="px-3 py-2.5 text-sm text-ink-400">No categories yet.</p>
                  )}
                  {categories.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/shop?category=${cat.slug}`}
                      onClick={() => setCatOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-ink-700 transition-colors hover:bg-ink-50"
                    >
                      <span className="font-medium">{cat.name}</span>
                      <span className="text-xs text-ink-400">{cat.productCount.toLocaleString()}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Search */}
          <form onSubmit={submitSearch} className="relative hidden flex-1 md:block" role="search">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products, brands and categories..."
              aria-label="Search products"
              className="w-full rounded-xl border border-ink-200 bg-ink-50 py-2.5 pl-10 pr-4 text-sm text-ink-900 placeholder-ink-400 transition-all focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
            />
          </form>

          <div className="flex items-center gap-1 sm:gap-2 ml-auto">
            <Link to="/wishlist" className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-600 transition-colors hover:bg-ink-50">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">{wishlistCount}</span>
              )}
            </Link>

            <Link to="/cart" className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-600 transition-colors hover:bg-ink-50">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">{cartCount}</span>
              )}
            </Link>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(o => !o)}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-600 transition-colors hover:bg-ink-50"
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
                    <Link to="/notifications" onClick={() => setNotifOpen(false)} className="block py-2.5 text-center text-sm font-medium text-brand-600 hover:bg-brand-50">
                      View all
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* User menu */}
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
                      <p className="text-sm font-semibold text-ink-900">{user?.name ?? 'Guest'}</p>
                      <p className="text-xs text-ink-500">{user?.email ?? 'Sign in to your account'}</p>
                    </div>
                    <div className="p-1.5">
                      {[
                        { to: '/account', icon: User, label: 'My Account' },
                        { to: '/orders', icon: Package, label: 'My Orders' },
                        { to: '/wishlist', icon: Heart, label: 'Wishlist' },
                        { to: '/addresses', icon: MapPin, label: 'Addresses' },
                        { to: '/account/settings', icon: Settings, label: 'Settings' },
                        { to: '/help', icon: HelpCircle, label: 'Help Center' },
                      ].map(item => (
                        <Link
                          key={item.to}
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
                      {user ? (
                        <button type="button" onClick={() => { setUserOpen(false); void logout().then(() => navigate('/login/buyer')); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-error-600 transition-colors hover:bg-error-50">
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      ) : (
                        <Link to="/login/buyer" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-brand-600 transition-colors hover:bg-brand-50">
                          <LogOut className="h-4 w-4" />
                          Sign in
                        </Link>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Secondary nav — category bar */}
        <nav className="hidden border-t border-ink-100 lg:block">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-1">
                <NavLink to="/" className={navLink} end>Home</NavLink>
                <span className="mx-1.5 h-1 w-1 rounded-full bg-ink-200" />
                <NavLink to="/shop" className={navLink}>All Products</NavLink>
                <span className="mx-1.5 h-1 w-1 rounded-full bg-ink-200" />
                {categories.slice(0, 5).map((cat, i) => (
                  <span key={cat.id} className="flex items-center gap-1">
                    <NavLink to={`/shop?category=${cat.slug}`} className={navLink}>{cat.name}</NavLink>
                    {i < Math.min(categories.length, 5) - 1 && <span className="mx-1.5 h-1 w-1 rounded-full bg-ink-200" />}
                  </span>
                ))}
              </div>
              <NavLink to="/shop?deals=true" className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-1.5 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-100">
                <span className="flex h-2 w-2 rounded-full bg-brand-500" /> Deals
              </NavLink>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] animate-slide-up overflow-y-auto bg-white p-4">
            <div className="flex items-center justify-between">
              <Logo size="sm" />
              <button onClick={() => setMobileOpen(false)}><X className="h-6 w-6 text-ink-600" /></button>
            </div>
            <form onSubmit={e => { submitSearch(e); setMobileOpen(false); }} className="mt-6 relative" role="search">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
                className="w-full rounded-xl border border-ink-200 bg-ink-50 py-2.5 pl-10 pr-4 text-sm"
              />
            </form>
            <div className="mt-6 space-y-1">
              <Link to="/" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">Home</Link>
              <Link to="/shop" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">All Products</Link>
              {categories.map(cat => (
                <Link key={cat.id} to={`/shop?category=${cat.slug}`} onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-ink-600 hover:bg-ink-50">{cat.name}</Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-ink-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-2">
              <Logo />
              <p className="mt-4 max-w-xs text-sm text-ink-500">
                ShopHub is a marketplace connecting buyers with independent sellers worldwide. Discover unique products from trusted brands.
              </p>
              <div className="mt-4 flex gap-3">
                {['Twitter', 'Instagram', 'Facebook'].map(s => (
                  <span key={s} className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 text-xs font-semibold text-ink-600">{s[0]}</span>
                ))}
              </div>
            </div>
            {[
              { title: 'Shop', links: ['All Products', 'Deals', 'New Arrivals', 'Best Sellers', 'Gift Cards'] },
              { title: 'Support', links: ['Help Center', 'Contact Us', 'Shipping', 'Returns', 'Track Order'] },
              { title: 'Company', links: ['About Us', 'Careers', 'Press', 'Blog', 'Privacy Policy'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold text-ink-900">{col.title}</h4>
                <ul className="mt-3 space-y-2">
                  {col.links.map(l => (
                    <li key={l}><Link to="/" className="text-sm text-ink-500 hover:text-brand-600">{l}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-ink-100 pt-6 sm:flex-row">
            <p className="text-sm text-ink-400">© 2024 ShopHub. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-ink-400">
              <span>Terms</span><span>Privacy</span><span>Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
