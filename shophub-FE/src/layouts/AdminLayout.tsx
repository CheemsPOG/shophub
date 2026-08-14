import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Store, Package, CreditCard, Flag, Ticket,
  Settings, Bell, Menu, X, LogOut, Shield, ChevronRight, FolderTree, ChevronDown,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Avatar } from '@/components/Avatar';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

interface NavItem { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean }
interface NavGroup { section: string; items: NavItem[] }

const NAV: NavGroup[] = [
  { section: 'Overview', items: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  ]},
  { section: 'Catalog', items: [
    { to: '/admin/products', label: 'Catalog', icon: Package },
    { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  ]},
  { section: 'Users', items: [
    { to: '/admin/users', label: 'Customers', icon: Users },
    { to: '/admin/sellers', label: 'Sellers', icon: Store },
  ]},
  { section: 'Operations', items: [
    { to: '/admin/orders', label: 'Orders', icon: CreditCard },
    { to: '/admin/disputes', label: 'Disputes', icon: Flag },
    { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
  ]},
  { section: 'System', items: [
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ]},
];

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [openDisputes, setOpenDisputes] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    api<unknown[]>('/admin/disputes?status=open').then(data => setOpenDisputes((data ?? []).length)).catch(() => setOpenDisputes(0));
  }, []);
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
      isActive
        ? 'bg-ink-900 text-white'
        : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
    }`;

  return (
    <div className="min-h-screen bg-ink-50 lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-ink-100 bg-white lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-ink-100 px-5">
          <Logo size="sm" link={false} />
          <span className="rounded-md bg-ink-900 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Admin</span>
        </div>
        <nav className="flex-1 space-y-4 overflow-y-auto p-3">
          {NAV.map(group => (
            <div key={group.section}>
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">{group.section}</p>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                    <item.icon style={{ width: 18, height: 18 }} />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-ink-100 p-3">
          <div className="flex items-center gap-3 rounded-xl bg-ink-50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-white">
              <Shield className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink-900">Admin User</p>
              <p className="truncate text-xs text-ink-500">admin@shophub.com</p>
            </div>
          </div>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 animate-slide-up overflow-y-auto bg-white">
            <div className="flex h-16 items-center justify-between border-b border-ink-100 px-5">
              <div className="flex items-center gap-2"><Logo size="sm" link={false} /><span className="rounded-md bg-ink-900 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Admin</span></div>
              <button onClick={() => setOpen(false)}><X className="h-6 w-6 text-ink-600" /></button>
            </div>
            <nav className="space-y-4 p-3">
              {NAV.map(group => (
                <div key={group.section}>
                  <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">{group.section}</p>
                  <div className="space-y-0.5">
                    {group.items.map(item => (
                      <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={() => setOpen(false)}>
                        <item.icon style={{ width: 18, height: 18 }} />{item.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
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
          <nav className="hidden items-center gap-1.5 text-sm text-ink-500 sm:flex">
            <span>Admin</span><ChevronRight className="h-3.5 w-3.5" /><span className="font-medium text-ink-900">Dashboard</span>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/admin/disputes" className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-600 hover:bg-ink-50">
              <Bell className="h-5 w-5" />
              {openDisputes > 0 && <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-error-500 text-[10px] font-bold text-white">{openDisputes}</span>}
            </Link>
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
                      <p className="text-sm font-semibold text-ink-900">{user?.name ?? 'Admin User'}</p>
                      <p className="text-xs text-ink-500">{user?.email ?? 'admin@shophub.com'}</p>
                    </div>
                    <div className="p-1.5">
                      {[
                        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
                        { to: '/admin/users', icon: Users, label: 'Customers' },
                        { to: '/admin/sellers', icon: Store, label: 'Sellers' },
                        { to: '/admin/disputes', icon: Flag, label: 'Disputes' },
                        { to: '/admin/settings', icon: Settings, label: 'Settings' },
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
                      <button
                        type="button"
                        onClick={() => { setUserOpen(false); void logout().then(() => navigate('/login/admin')); }}
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
