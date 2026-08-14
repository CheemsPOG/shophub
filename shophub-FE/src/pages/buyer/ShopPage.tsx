import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, Grid, List, ChevronDown, X, Check, Home } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { ProductImage } from '@/components/ProductImage';
import { EmptyState } from '@/components/EmptyState';
import type { Product, Category } from '@/lib/data';
import { formatCurrency } from '@/lib/format';
import { api } from '@/lib/api';

const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
];

export function ShopPage() {
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState(1000);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const category = params.get('category') || '';
  const deals = params.get('deals') === 'true';
  const search = params.get('q') || '';

  useEffect(() => {
    api<Category[] | { items: Category[] }>('/catalog/categories')
      .then(data => {
        const list = Array.isArray(data) ? data : data.items;
        setCategories((list ?? []).map(c => ({ ...c, subcategories: c.subcategories ?? [] })));
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    const sortKey = sort === 'price-low' ? 'price_asc' : sort === 'price-high' ? 'price_desc' : sort;
    const query = new URLSearchParams();
    if (search) query.set('q', search);
    if (category) query.set('category', category);
    if (deals) query.set('deals', 'true');
    query.set('maxPrice', String(priceRange));
    query.set('sort', sortKey);
    query.set('size', '50');
    api<{ content?: Product[]; items?: Product[] }>(`/catalog/products?${query}`)
      .then(data => setFiltered(data.content || data.items || []))
      .catch(err => {
        setFiltered([]);
        setError(err instanceof Error ? err.message : 'Could not load products');
      })
      .finally(() => setLoading(false));
  }, [category, deals, search, sort, priceRange]);

  const updateCategory = (slug: string) => {
    const next = new URLSearchParams(params);
    if (slug) next.set('category', slug); else next.delete('category');
    setParams(next);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-ink-900">Category</h3>
        <div className="mt-3 space-y-2">
          <button onClick={() => updateCategory('')} className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm ${!category ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50'}`}>
            All categories
            {!category && <Check className="h-4 w-4" />}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => updateCategory(cat.slug)}
              className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm ${category === cat.slug ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50'}`}
            >
              {cat.name}
              {category === cat.slug && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-ink-900">Price range</h3>
        <p className="mt-2 text-sm text-ink-500">Up to {formatCurrency(priceRange, { decimals: true })}</p>
        <input
          type="range" min={0} max={1000} step={10}
          value={priceRange}
          onChange={e => setPriceRange(+e.target.value)}
          className="mt-2 w-full accent-brand-500"
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-ink-900">Rating</h3>
        <div className="mt-3 space-y-1.5">
          {[4, 3, 2, 1].map(r => (
            <label key={r} className="flex items-center gap-2 text-sm text-ink-600">
              <input type="checkbox" className="h-4 w-4 rounded border-ink-300 text-brand-500" />
              {r} stars & up
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-ink-900">Availability</h3>
        <div className="mt-3 space-y-1.5">
          <label className="flex items-center gap-2 text-sm text-ink-600"><input type="checkbox" defaultChecked className="h-4 w-4 rounded border-ink-300 text-brand-500" /> In stock</label>
          <label className="flex items-center gap-2 text-sm text-ink-600"><input type="checkbox" className="h-4 w-4 rounded border-ink-300 text-brand-500" /> On sale</label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-ink-500">
        <Link to="/" className="flex items-center gap-1 hover:text-ink-900"><Home className="h-3.5 w-3.5" /> Home</Link>
        <span>/</span>
        <span className="font-medium text-ink-900">{deals ? 'Deals' : category ? categories.find(c => c.slug === category)?.name : 'All Products'}</span>
      </nav>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">
            {deals ? 'Deals & Offers' : category ? categories.find(c => c.slug === category)?.name : 'All Products'}
          </h1>
          <p className="text-sm text-ink-500">{loading ? 'Loading…' : `${filtered.length} products found`}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-2 rounded-xl border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>

          <div className="relative">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="appearance-none rounded-xl border border-ink-200 bg-white py-2 pl-3 pr-9 text-sm font-medium text-ink-700 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            >
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          </div>

          <div className="hidden items-center rounded-xl border border-ink-200 p-0.5 sm:flex">
            <button onClick={() => setView('grid')} className={`flex h-8 w-8 items-center justify-center rounded-lg ${view === 'grid' ? 'bg-ink-900 text-white' : 'text-ink-400'}`}><Grid className="h-4 w-4" /></button>
            <button onClick={() => setView('list')} className={`flex h-8 w-8 items-center justify-center rounded-lg ${view === 'list' ? 'bg-ink-900 text-white' : 'text-ink-400'}`}><List className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-6">
        {/* Desktop filters */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-ink-100 bg-white p-5">
            <FilterContent />
          </div>
        </aside>

        {/* Products */}
        <div className="min-w-0 flex-1">
          {error && <p className="mb-4 rounded-xl bg-error-50 px-3 py-2 text-sm text-error-600">{error}</p>}
          {loading ? (
            <div className="py-16 text-center text-sm text-ink-500">Loading products…</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-ink-100 bg-white">
              <EmptyState icon={<Grid className="h-7 w-7" />} title="No products found" description="Try adjusting your filters or search terms" action={{ label: 'Clear filters', to: '/shop' }} />
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(p => (
                <Link key={p.id} to={`/product/${p.id}`} className="group flex gap-4 overflow-hidden rounded-2xl border border-ink-100 bg-white p-3 transition-all hover:shadow-soft">
                  <ProductImage src={p.images?.[0]} alt={p.title} className="h-28 w-28 shrink-0 rounded-xl" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="text-xs text-ink-400">{p.brand}</p>
                    <h3 className="line-clamp-2 text-sm font-medium text-ink-900 group-hover:text-brand-600">{p.title}</h3>
                    <p className="mt-1 line-clamp-1 text-xs text-ink-500">{p.description}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-ink-900">{formatCurrency(p.price, { decimals: true })}</span>
                        {p.compareAt && <span className="text-sm text-ink-400 line-through">{formatCurrency(p.compareAt, { decimals: true })}</span>}
                      </div>
                      <span className="text-xs text-ink-500">★ {p.rating} ({p.reviews})</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] animate-slide-up overflow-y-auto rounded-t-3xl bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink-900">Filters</h2>
              <button onClick={() => setShowFilters(false)}><X className="h-5 w-5 text-ink-600" /></button>
            </div>
            <div className="mt-4"><FilterContent /></div>
            <button onClick={() => setShowFilters(false)} className="mt-6 w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white">Show {filtered.length} results</button>
          </div>
        </div>
      )}
    </div>
  );
}
