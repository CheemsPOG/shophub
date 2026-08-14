import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Users, Store, Package, Flag, ArrowRight, ShoppingBag } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatNumber, formatDate } from '@/lib/format';
import { api } from '@/lib/api';
import type { SellerApplication } from '@/lib/data';

type Dashboard = {
  users: number;
  buyers: number;
  sellers: number;
  products: number;
  activeProducts: number;
  orders: number;
  gmv: number;
  openDisputes: number;
  pendingApplications: number;
};

type AdminUser = { id: string; name: string; email: string; role: string; joinedAt?: string };
type AdminDispute = { id: string; orderNumber: string; reason: string; status: string; amount: number };

export function AdminDashboardPage() {
  const [stats, setStats] = useState<Dashboard | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api<Dashboard>('/admin/dashboard'),
      api<{ content: AdminUser[] }>('/admin/users?size=8'),
      api<SellerApplication[]>('/admin/applications?status=pending'),
      api<AdminDispute[]>('/admin/disputes?status=open'),
    ])
      .then(([dashboard, userPage, apps, openDisputes]) => {
        setStats({
          ...dashboard,
          gmv: Number(dashboard.gmv),
          users: Number(dashboard.users),
          buyers: Number(dashboard.buyers),
          sellers: Number(dashboard.sellers),
          products: Number(dashboard.products),
          activeProducts: Number(dashboard.activeProducts),
          orders: Number(dashboard.orders),
          openDisputes: Number(dashboard.openDisputes),
          pendingApplications: Number(dashboard.pendingApplications),
        });
        setUsers(userPage.content ?? []);
        setApplications(apps ?? []);
        setDisputes(openDisputes ?? []);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load dashboard'));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Dashboard</h1>
        <p className="text-sm text-ink-500">Live platform totals from the database</p>
      </div>

      {error && <p className="rounded-xl bg-error-50 px-3 py-2 text-sm text-error-600">{error}</p>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="GMV" value={formatCurrency(stats?.gmv ?? 0, { decimals: true })} icon={<DollarSign className="h-5 w-5" />} accent="brand" />
        <StatCard label="Users" value={formatNumber(stats?.users ?? 0)} icon={<Users className="h-5 w-5" />} accent="blue" />
        <StatCard label="Sellers" value={formatNumber(stats?.sellers ?? 0)} icon={<Store className="h-5 w-5" />} accent="success" />
        <StatCard label="Orders" value={formatNumber(stats?.orders ?? 0)} icon={<ShoppingBag className="h-5 w-5" />} accent="warning" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <div className="flex items-center gap-2"><Package className="h-4 w-4 text-ink-400" /><span className="text-xs text-ink-500">Active products</span></div>
          <p className="mt-2 text-xl font-bold text-ink-900">{formatNumber(stats?.activeProducts ?? 0)}</p>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <div className="flex items-center gap-2"><Store className="h-4 w-4 text-warning-500" /><span className="text-xs text-ink-500">Pending sellers</span></div>
          <p className="mt-2 text-xl font-bold text-warning-600">{stats?.pendingApplications ?? 0}</p>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <div className="flex items-center gap-2"><Flag className="h-4 w-4 text-error-500" /><span className="text-xs text-ink-500">Open disputes</span></div>
          <p className="mt-2 text-xl font-bold text-error-600">{stats?.openDisputes ?? 0}</p>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <div className="flex items-center gap-2"><Users className="h-4 w-4 text-blue-500" /><span className="text-xs text-ink-500">Buyers</span></div>
          <p className="mt-2 text-xl font-bold text-ink-900">{formatNumber(stats?.buyers ?? 0)}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">Recent signups</h2>
            <Link to="/admin/users" className="flex items-center gap-1 text-sm font-medium text-brand-600">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="mt-4 space-y-2">
            {users.length === 0 && <p className="py-6 text-center text-sm text-ink-400">No users yet.</p>}
            {users.map(u => (
              <div key={u.id} className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-ink-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 text-xs font-bold text-ink-600">
                  {(u.name || u.email || '?')[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{u.name}</p>
                  <p className="text-xs text-ink-500">{u.email}</p>
                </div>
                <div className="text-right">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${u.role === 'seller' ? 'bg-brand-50 text-brand-700' : u.role === 'admin' ? 'bg-ink-100 text-ink-700' : 'bg-blue-50 text-blue-700'}`}>{u.role}</span>
                  {u.joinedAt && <p className="mt-1 text-xs text-ink-400">{formatDate(u.joinedAt, { short: true })}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">Needs attention</h2>
            <Link to="/admin/sellers?tab=applications" className="flex items-center gap-1 text-sm font-medium text-brand-600">Sellers <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="mt-4 space-y-2">
            {applications.length === 0 && disputes.length === 0 && (
              <p className="py-6 text-center text-sm text-ink-400">No pending applications or open disputes.</p>
            )}
            {applications.map(a => (
              <div key={a.id} className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-ink-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Store className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{a.businessName}</p>
                  <p className="text-xs text-ink-500">{a.category || 'Seller application'}{a.submittedAt ? ` · ${formatDate(a.submittedAt, { short: true })}` : ''}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
            {disputes.map(d => (
              <Link key={d.id} to="/admin/disputes" className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-ink-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-error-50 text-error-600"><Flag className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">Dispute: {d.orderNumber || d.id.slice(0, 8)}</p>
                  <p className="text-xs text-ink-500">{d.reason} · {formatCurrency(Number(d.amount), { decimals: true })}</p>
                </div>
                <StatusBadge status={d.status} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
