import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, Eye, Edit2, TrendingUp, ChevronRight, Home } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '@/lib/data';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatNumber } from '@/lib/format';
import { ProductImage } from '@/components/ProductImage';

const FILTERS = ['all', 'active', 'draft', 'pending', 'rejected'];

export function AdminProductsPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = PRODUCTS.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Products</h1>
        <p className="text-sm text-ink-500">{PRODUCTS.length} products across all sellers</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-ink-100 bg-white p-4"><p className="text-xs text-ink-500">Active</p><p className="mt-1 text-xl font-bold text-success-600">{PRODUCTS.filter(p => p.status === 'active').length}</p></div>
        <div className="rounded-xl border border-ink-100 bg-white p-4"><p className="text-xs text-ink-500">Pending</p><p className="mt-1 text-xl font-bold text-warning-600">{PRODUCTS.filter(p => p.status === 'pending').length}</p></div>
        <div className="rounded-xl border border-ink-100 bg-white p-4"><p className="text-xs text-ink-500">Drafts</p><p className="mt-1 text-xl font-bold text-ink-600">{PRODUCTS.filter(p => p.status === 'draft').length}</p></div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 sm:w-72" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium capitalize transition-all ${filter === f ? 'bg-ink-900 text-white' : 'border border-ink-200 bg-white text-ink-600 hover:bg-ink-50'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-100 bg-ink-50/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Seller</th>
                <th className="px-5 py-3">Price</th>
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
                      <ProductImage src={p.images?.[0]} alt="" className="h-10 w-10 rounded-lg" />
                      <div className="min-w-0">
                        <p className="line-clamp-1 font-medium text-ink-900">{p.title}</p>
                        <p className="text-xs text-ink-500">{p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-600">{p.sellerName}</td>
                  <td className="px-5 py-3 font-semibold text-ink-900">{formatCurrency(p.price, { decimals: true })}</td>
                  <td className="px-5 py-3 text-ink-700">{formatNumber(p.sales)}</td>
                  <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/product/${p.id}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-50 hover:text-ink-700"><Eye className="h-3.5 w-3.5" /></Link>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-50 hover:text-brand-600"><Edit2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Categories</h1>
          <p className="text-sm text-ink-500">Manage product categories</p>
        </div>
        <button className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600">Add category</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map(cat => (
          <div key={cat.id} className="rounded-2xl border border-ink-100 bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Package className="h-5 w-5" />
              </div>
              <button className="text-ink-400 hover:text-brand-600"><Edit2 className="h-4 w-4" /></button>
            </div>
            <p className="mt-3 font-semibold text-ink-900">{cat.name}</p>
            <p className="text-xs text-ink-500">{cat.productCount.toLocaleString()} products</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {cat.subcategories.slice(0, 3).map(s => (
                <span key={s} className="rounded-md bg-ink-50 px-2 py-0.5 text-xs text-ink-600">{s}</span>
              ))}
              {cat.subcategories.length > 3 && <span className="rounded-md bg-ink-50 px-2 py-0.5 text-xs text-ink-600">+{cat.subcategories.length - 3}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
