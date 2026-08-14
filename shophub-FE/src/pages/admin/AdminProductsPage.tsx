import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, Eye } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, formatNumber } from '@/lib/format';
import { ProductImage } from '@/components/ProductImage';
import { api } from '@/lib/api';
import type { Category, Product } from '@/lib/data';

const FILTERS = ['all', 'active', 'draft'];

function normalize(p: Product): Product {
  return { ...p, price: Number(p.price), stock: Number(p.stock), sales: Number(p.sales) };
}

export function AdminProductsPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ content: Product[] }>('/admin/products?size=100')
      .then(data => setProducts((data.content ?? []).map(normalize)))
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load products'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.sellerName?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Catalog</h1>
        <p className="text-sm text-ink-500">Read-only view of listings. Sellers manage their own products; you manage seller accounts.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-ink-100 bg-white p-4"><p className="text-xs text-ink-500">Active</p><p className="mt-1 text-xl font-bold text-success-600">{products.filter(p => p.status === 'active').length}</p></div>
        <div className="rounded-xl border border-ink-100 bg-white p-4"><p className="text-xs text-ink-500">Drafts</p><p className="mt-1 text-xl font-bold text-ink-600">{products.filter(p => p.status === 'draft').length}</p></div>
        <div className="rounded-xl border border-ink-100 bg-white p-4"><p className="text-xs text-ink-500">Total</p><p className="mt-1 text-xl font-bold text-ink-900">{products.length}</p></div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products or sellers..." className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 sm:w-72" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium capitalize transition-all ${filter === f ? 'bg-ink-900 text-white' : 'border border-ink-200 bg-white text-ink-600 hover:bg-ink-50'}`}>{f}</button>
          ))}
        </div>
      </div>

      {error && <p className="rounded-xl bg-error-50 px-3 py-2 text-sm text-error-600">{error}</p>}

      {!loading && filtered.length === 0 ? (
        <div className="rounded-2xl border border-ink-100 bg-white">
          <EmptyState icon={<Package className="h-7 w-7" />} title="No products found" description="Sellers add listings from their portal. They appear here once listed." />
        </div>
      ) : (
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
                  <th className="px-5 py-3 text-right">View</th>
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
                      <div className="flex items-center justify-end">
                        <Link to={`/product/${p.id}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-50 hover:text-ink-700"><Eye className="h-3.5 w-3.5" /></Link>
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

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Array<Category & { parentId?: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api<Array<Category & { parentId?: string | null }>>('/admin/categories')
      .then(data => setCategories((data ?? []).map(c => ({ ...c, productCount: Number(c.productCount), subcategories: c.subcategories ?? [] }))))
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load categories'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      await api('/admin/categories', { method: 'POST', body: JSON.stringify({ name: name.trim() }) });
      setName('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add category');
    } finally {
      setSaving(false);
    }
  };

  const roots = categories.filter(c => !c.parentId);
  const childrenOf = (id: string) => categories.filter(c => c.parentId === id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Categories</h1>
          <p className="text-sm text-ink-500">Platform categories currently in the database.</p>
        </div>
        <form onSubmit={create} className="flex gap-2">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="New category name" className="w-52 rounded-xl border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          <button type="submit" disabled={saving || !name.trim()} className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600 disabled:opacity-50">Add category</button>
        </form>
      </div>

      {error && <p className="rounded-xl bg-error-50 px-3 py-2 text-sm text-error-600">{error}</p>}

      {!loading && categories.length === 0 ? (
        <div className="rounded-2xl border border-ink-100 bg-white">
          <EmptyState icon={<Package className="h-7 w-7" />} title="No categories" description="Add a category to organize the catalog." />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(roots.length ? roots : categories).map(cat => (
            <div key={cat.id} className="rounded-2xl border border-ink-100 bg-white p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Package className="h-5 w-5" />
              </div>
              <p className="mt-3 font-semibold text-ink-900">{cat.name}</p>
              <p className="text-xs text-ink-500">{Number(cat.productCount || 0).toLocaleString()} products</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {childrenOf(cat.id).map(s => (
                  <span key={s.id} className="rounded-md bg-ink-50 px-2 py-0.5 text-xs text-ink-600">{s.name}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
