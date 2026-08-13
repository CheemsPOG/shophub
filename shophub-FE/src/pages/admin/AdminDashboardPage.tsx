import { Link } from 'react-router-dom';
import { DollarSign, Users, Store, Package, Flag, TrendingUp, ArrowRight, ShoppingBag, Percent } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { BarChart } from '@/components/BarChart';
import { DonutChart } from '@/components/DonutChart';
import { StatusBadge } from '@/components/StatusBadge';
import { ADMIN_STATS, SELLER_ORDERS, DISPUTES, SELLER_APPLICATIONS } from '@/lib/data';
import { formatCurrency, formatNumber, formatDate } from '@/lib/format';

export function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Dashboard</h1>
        <p className="text-sm text-ink-500">Platform overview and key metrics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total revenue" value={formatCurrency(ADMIN_STATS.totalRevenue)} icon={<DollarSign className="h-5 w-5" />} trend={{ value: '14.2%', up: true }} accent="brand" />
        <StatCard label="Total users" value={formatNumber(ADMIN_STATS.totalUsers)} icon={<Users className="h-5 w-5" />} trend={{ value: '6.8%', up: true }} accent="blue" />
        <StatCard label="Active sellers" value={formatNumber(ADMIN_STATS.totalSellers)} icon={<Store className="h-5 w-5" />} trend={{ value: '3.1%', up: true }} accent="success" />
        <StatCard label="Total orders" value={formatNumber(ADMIN_STATS.totalOrders)} icon={<ShoppingBag className="h-5 w-5" />} trend={{ value: '9.4%', up: true }} accent="warning" />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <div className="flex items-center gap-2"><Package className="h-4 w-4 text-ink-400" /><span className="text-xs text-ink-500">Products</span></div>
          <p className="mt-2 text-xl font-bold text-ink-900">{formatNumber(ADMIN_STATS.totalProducts)}</p>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <div className="flex items-center gap-2"><Store className="h-4 w-4 text-warning-500" /><span className="text-xs text-ink-500">Pending sellers</span></div>
          <p className="mt-2 text-xl font-bold text-warning-600">{ADMIN_STATS.pendingSellers}</p>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <div className="flex items-center gap-2"><Flag className="h-4 w-4 text-error-500" /><span className="text-xs text-ink-500">Open disputes</span></div>
          <p className="mt-2 text-xl font-bold text-error-600">{ADMIN_STATS.openDisputes}</p>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <div className="flex items-center gap-2"><Percent className="h-4 w-4 text-success-500" /><span className="text-xs text-ink-500">Conversion rate</span></div>
          <p className="mt-2 text-xl font-bold text-ink-900">{ADMIN_STATS.conversionRate}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-ink-100 bg-white p-5 lg:col-span-2">
          <h2 className="font-semibold text-ink-900">Revenue overview</h2>
          <div className="mt-6">
            <BarChart data={ADMIN_STATS.monthlyRevenue.map(m => ({ label: m.month, value: m.value }))} format={v => formatCurrency(v)} height={240} />
          </div>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <h2 className="font-semibold text-ink-900">Top categories</h2>
          <div className="mt-6 flex justify-center">
            <DonutChart
              data={ADMIN_STATS.topCategories.map((c, i) => ({ name: c.name, value: c.share, color: ['#f55530', '#3b82f6', '#16b364', '#f5830a', '#8c95ad'][i] }))}
              centerLabel="Revenue"
              centerValue={formatCurrency(ADMIN_STATS.totalRevenue)}
            />
          </div>
        </div>
      </div>

      {/* Recent signups + pending items */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">Recent signups</h2>
            <Link to="/admin/users" className="flex items-center gap-1 text-sm font-medium text-brand-600">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="mt-4 space-y-2">
            {ADMIN_STATS.recentSignups.map((u, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-ink-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 text-xs font-bold text-ink-600">
                  {u.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{u.name}</p>
                  <p className="text-xs text-ink-500">{u.email}</p>
                </div>
                <div className="text-right">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${u.role === 'seller' ? 'bg-brand-50 text-brand-700' : 'bg-blue-50 text-blue-700'}`}>{u.role}</span>
                  <p className="mt-1 text-xs text-ink-400">{formatDate(u.date, { short: true })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">Pending approvals</h2>
            <Link to="/admin/applications" className="flex items-center gap-1 text-sm font-medium text-brand-600">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="mt-4 space-y-2">
            {SELLER_APPLICATIONS.filter(a => a.status === 'pending').map(a => (
              <div key={a.id} className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-ink-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Store className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{a.businessName}</p>
                  <p className="text-xs text-ink-500">{a.category} · {formatDate(a.submittedAt, { short: true })}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
            {DISPUTES.filter(d => d.status === 'open' || d.status === 'under_review').map(d => (
              <div key={d.id} className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-ink-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-error-50 text-error-600"><Flag className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">Dispute: {d.orderNumber}</p>
                  <p className="text-xs text-ink-500">{d.reason} · {formatCurrency(d.amount, { decimals: true })}</p>
                </div>
                <StatusBadge status={d.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
