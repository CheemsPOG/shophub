import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingCart, Package, Wallet, ArrowRight } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { ProductImage } from '@/components/ProductImage';
import { type Order } from '@/lib/data';
import { formatCurrency, formatDate } from '@/lib/format';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type Dashboard = {
  orders: number;
  pendingOrders: number;
  products: number;
  revenue: number;
  availableBalance: number;
  pendingBalance: number;
  recentOrders: Order[];
};

export function SellerDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    api<Dashboard>('/seller/dashboard')
      .then(d => setData({
        ...d,
        revenue: Number(d.revenue ?? 0),
        availableBalance: Number(d.availableBalance ?? 0),
        pendingBalance: Number(d.pendingBalance ?? 0),
        recentOrders: (d.recentOrders || []) as Order[],
      }))
      .catch(() => setData({ orders: 0, pendingOrders: 0, products: 0, revenue: 0, availableBalance: 0, pendingBalance: 0, recentOrders: [] }));
  }, []);

  const stats = data || { orders: 0, pendingOrders: 0, products: 0, revenue: 0, availableBalance: 0, pendingBalance: 0, recentOrders: [] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</h1>
        <p className="text-sm text-ink-500">Live numbers from your store — empty until real orders come in.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Revenue" value={formatCurrency(stats.revenue)} icon={<DollarSign className="h-5 w-5" />} accent="brand" />
        <StatCard label="Orders" value={String(stats.orders)} icon={<ShoppingCart className="h-5 w-5" />} accent="blue" />
        <StatCard label="Products" value={String(stats.products)} icon={<Package className="h-5 w-5" />} accent="success" />
        <StatCard label="Available balance" value={formatCurrency(stats.availableBalance)} icon={<Wallet className="h-5 w-5" />} accent="warning" />
      </div>
      <div className="rounded-2xl border border-ink-100 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink-900">Recent orders</h2>
          <Link to="/seller/orders" className="flex items-center gap-1 text-sm font-medium text-brand-600">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="mt-4 space-y-2">
          {stats.recentOrders.length === 0 && <p className="py-8 text-center text-sm text-ink-500">No orders yet.</p>}
          {stats.recentOrders.map(o => (
            <Link key={o.id} to={`/seller/orders/${o.id}`} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-ink-50">
              <ProductImage src={o.items[0]?.image} className="h-10 w-10 rounded-lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-900">{o.buyerName}</p>
                <p className="text-xs text-ink-500">{o.orderNumber} · {o.placedAt ? formatDate(o.placedAt, { short: true }) : ''}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-ink-900">{formatCurrency(o.total, { decimals: true })}</p>
                <StatusBadge status={o.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
