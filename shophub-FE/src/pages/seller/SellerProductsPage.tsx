import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, Eye, Package, Send } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, formatNumber } from '@/lib/format';
import { ProductImage } from '@/components/ProductImage';
import { api, ApiError } from '@/lib/api';
import type { Product } from '@/lib/data';

const FILTERS = ['all', 'active', 'draft', 'pending', 'rejected'];

function normalize(p: Product): Product {
  return { ...p, price: Number(p.price), compareAt: p.compareAt == null ? undefined : Number(p.compareAt), stock: Number(p.stock), sales: Number(p.sales) };
}

export function SellerProductsPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => api<{ content: Product[] }>('/seller/products?size=100')
    .then(data => setProducts((data.content ?? []).map(normalize)))
    .catch(err => setError(err instanceof Error ? err.message : 'Could not load products'))
    .finally(() => setLoading(false));

  useEffect(() => { void load(); }, []);

  const filtered = products.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const submitForReview = async (id: string) => {
    setBusyId(id);
    setError('');
    try {
      await api(`/seller/products/${id}/publish`, { method: 'POST' });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit product for review');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    setBusyId(id);
    setError('');
    try {
      await api(`/seller/products/${id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete product');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Products</h1>
          <p className="text-sm text-ink-500">{products.length} products in your catalog</p>
        </div>
        <Link to="/seller/products/new" className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600">
          <Plus className="h-4 w-4" /> Add product
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <p className="text-xs text-ink-500">Active</p>
          <p className="mt-1 text-xl font-bold text-success-600">{products.filter(p => p.status === 'active').length}</p>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <p className="text-xs text-ink-500">Drafts</p>
          <p className="mt-1 text-xl font-bold text-ink-600">{products.filter(p => p.status === 'draft').length}</p>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <p className="text-xs text-ink-500">Out of stock</p>
          <p className="mt-1 text-xl font-bold text-error-600">{products.filter(p => p.stock === 0).length}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 sm:w-64"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium capitalize transition-all ${filter === f ? 'bg-ink-900 text-white' : 'border border-ink-200 bg-white text-ink-600 hover:bg-ink-50'}`}
            >{f}</button>
          ))}
        </div>
      </div>

      {error && <p className="rounded-xl bg-error-50 px-3 py-2 text-sm text-error-600">{error}</p>}

      {/* Table */}
      {!loading && filtered.length === 0 ? (
        <div className="rounded-2xl border border-ink-100 bg-white">
          <EmptyState icon={<Package className="h-7 w-7" />} title="No products found" description="Try adjusting your filters or add a new product." action={{ label: 'Add product', to: '/seller/products/new' }} />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-ink-100 bg-ink-50/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Sales</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {filtered.map(p => (
                  <tr key={p.id} className="transition-colors hover:bg-ink-50/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <ProductImage src={p.images?.[0]} alt="" className="h-12 w-12 rounded-lg" />
                        <div className="min-w-0">
                          <p className="line-clamp-1 font-medium text-ink-900">{p.title}</p>
                          <p className="text-xs text-ink-500">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-ink-900">{formatCurrency(p.price, { decimals: true })}</p>
                      {p.compareAt && <p className="text-xs text-ink-400 line-through">{formatCurrency(p.compareAt, { decimals: true })}</p>}
                    </td>
                    <td className="px-5 py-3">
                      <span className={p.stock === 0 ? 'font-medium text-error-600' : p.stock <= 10 ? 'font-medium text-warning-600' : 'text-ink-700'}>{p.stock}</span>
                    </td>
                    <td className="px-5 py-3 text-ink-700">{formatNumber(p.sales)}</td>
                    <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {p.status === 'draft' && (
                          <button
                            onClick={() => void submitForReview(p.id)}
                            disabled={busyId === p.id}
                            title="Submit for review"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-50 hover:text-brand-600 disabled:opacity-40"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <Link to={`/product/${p.id}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-50 hover:text-ink-700"><Eye className="h-3.5 w-3.5" /></Link>
                        <Link to={`/seller/products/${p.id}/edit`} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-50 hover:text-brand-600"><Edit2 className="h-3.5 w-3.5" /></Link>
                        <button onClick={() => void remove(p.id)} disabled={busyId === p.id} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-error-50 hover:text-error-600 disabled:opacity-40"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
