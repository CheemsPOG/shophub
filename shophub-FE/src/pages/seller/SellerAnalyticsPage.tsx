import { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Package } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { BarChart } from '@/components/BarChart';
import { formatCurrency, formatNumber } from '@/lib/format';
import { ProductImage } from '@/components/ProductImage';
import { api } from '@/lib/api';
import type { Product } from '@/lib/data';
import { EmptyState } from '@/components/EmptyState';

type AnalyticsDto = {
  period: string;
  orders: number;
  revenue: number;
  averageOrder: number;
  series: { date: string; revenue: number }[];
};

const PERIODS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

function normalizeProduct(p: Product): Product {
  return { ...p, price: Number(p.price), sales: Number(p.sales), rating: Number(p.rating) };
}

export function SellerAnalyticsPage() {
  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState<AnalyticsDto | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api<AnalyticsDto>(`/seller/analytics?period=${period}`)
      .then(d => setData({ ...d, revenue: Number(d.revenue), averageOrder: Number(d.averageOrder), series: d.series.map(s => ({ ...s, revenue: Number(s.revenue) })) }))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => {
    api<{ content: Product[] }>('/seller/products?size=100')
      .then(d => setProducts((d.content ?? []).map(normalizeProduct)))
      .catch(() => setProducts([]));
  }, []);

  const topProducts = [...products].sort((a, b) => b.sales - a.sales).filter(p => p.sales > 0).slice(0, 5);
  const chartData = (data?.series ?? []).map(s => ({ label: new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), value: s.revenue }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Analytics</h1>
          <p className="text-sm text-ink-500">Deep dive into your store performance</p>
        </div>
        <select value={period} onChange={e => setPeriod(e.target.value)} className="rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-700">
          {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Revenue" value={formatCurrency(data?.revenue ?? 0)} icon={<DollarSign className="h-5 w-5" />} accent="brand" />
        <StatCard label="Orders" value={formatNumber(data?.orders ?? 0)} icon={<ShoppingCart className="h-5 w-5" />} accent="blue" />
        <StatCard label="Avg order value" value={formatCurrency(data?.averageOrder ?? 0, { decimals: true })} icon={<TrendingUp className="h-5 w-5" />} accent="success" />
      </div>

      {/* Revenue chart */}
      <div className="rounded-2xl border border-ink-100 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink-900">Revenue trend</h2>
          <span className="text-sm text-ink-500">{PERIODS.find(p => p.value === period)?.label}</span>
        </div>
        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center text-sm text-ink-400" style={{ height: 260 }}>Loading…</div>
          ) : (
            <BarChart data={chartData} format={v => formatCurrency(v)} height={260} />
          )}
        </div>
      </div>

      {/* Top products */}
      <div className="rounded-2xl border border-ink-100 bg-white p-5">
        <h2 className="font-semibold text-ink-900">Best performing products</h2>
        {topProducts.length === 0 ? (
          <div className="mt-4">
            <EmptyState icon={<Package className="h-7 w-7" />} title="No sales yet" description="Products with sales will be ranked here." />
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-100 text-xs font-bold text-ink-600">{i + 1}</span>
                <ProductImage src={p.images?.[0]} alt="" className="h-10 w-10 rounded-lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{p.title}</p>
                  <p className="text-xs text-ink-500">{formatNumber(p.sales)} sales · ★ {p.rating.toFixed(1)}</p>
                </div>
                <span className="text-sm font-bold text-ink-900">{formatCurrency(p.price * p.sales)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
