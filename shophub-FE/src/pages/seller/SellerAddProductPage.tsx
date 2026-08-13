import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X, Plus, ArrowLeft, Check, Loader2 } from 'lucide-react';
import type { Category } from '@/lib/data';
import { api, ApiError } from '@/lib/api';
import { ProductImage } from '@/components/ProductImage';

type VariantForm = { name: string; options: string };

type ProductDto = {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  brand: string;
  price: number;
  compareAt: number | null;
  stock: number;
  tags: string[];
  images: string[];
  variants: { name: string; options: string[] }[];
};

export function SellerAddProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [variants, setVariants] = useState<VariantForm[]>([{ name: '', options: '' }]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [tags, setTags] = useState('');
  const [price, setPrice] = useState('');
  const [compareAt, setCompareAt] = useState('');
  const [stock, setStock] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api<Category[] | { items: Category[] }>('/catalog/categories')
      .then(data => setCategories(Array.isArray(data) ? data : data.items ?? []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!id) return;
    api<ProductDto>(`/seller/products/${id}`)
      .then(p => {
        setTitle(p.title);
        setDescription(p.description ?? '');
        setCategoryId(p.categoryId ?? '');
        setBrand(p.brand ?? '');
        setTags((p.tags ?? []).join(', '));
        setPrice(String(p.price ?? ''));
        setCompareAt(p.compareAt == null ? '' : String(p.compareAt));
        setStock(String(p.stock ?? ''));
        setImages(p.images ?? []);
        setVariants(p.variants?.length ? p.variants.map(v => ({ name: v.name, options: v.options.join(', ') })) : [{ name: '', options: '' }]);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load product'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError('');
    setUploading(true);
    try {
      const remaining = 5 - images.length;
      const files = Array.from(fileList).slice(0, Math.max(remaining, 0));
      for (const file of files) {
        const form = new FormData();
        form.append('file', file);
        const { url } = await api<{ url: string }>('/seller/media', { method: 'POST', body: form });
        setImages(prev => [...prev, url]);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Product title is required');
      return;
    }
    if (!categoryId) {
      setError('Please select a category');
      return;
    }
    if (!price || Number(price) <= 0) {
      setError('Please enter a valid price');
      return;
    }
    setSaving(true);
    try {
      const body = {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        brand: brand.trim(),
        price: Number(price),
        compareAt: compareAt ? Number(compareAt) : null,
        stock: stock ? Number(stock) : 0,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        images,
        variants: variants
          .filter(v => v.name.trim())
          .map(v => ({ name: v.name.trim(), options: v.options.split(',').map(o => o.trim()).filter(Boolean) })),
      };
      if (isEditing) {
        await api(`/seller/products/${id}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await api('/seller/products', { method: 'POST', body: JSON.stringify(body) });
      }
      navigate('/seller/products');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-3xl py-16 text-center text-sm text-ink-500">Loading product…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <button onClick={() => navigate('/seller/products')} className="flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">
          <ArrowLeft className="h-4 w-4" /> Back to products
        </button>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink-900">{isEditing ? 'Edit product' : 'Add new product'}</h1>
        <p className="text-sm text-ink-500">Fill in the details below to {isEditing ? 'update your' : 'list a new'} product</p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        {error && <p className="rounded-xl bg-error-50 px-3 py-2 text-sm text-error-600">{error}</p>}

        {/* Images */}
        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <h2 className="font-semibold text-ink-900">Product images</h2>
          <p className="text-sm text-ink-500">Upload up to 5 images from your device. First image is the cover.</p>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {images.map((img, i) => (
              <div key={img} className="relative aspect-square overflow-hidden rounded-xl border border-ink-200">
                <ProductImage src={img} alt="" className="h-full w-full" />
                <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink-900/70 text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
                {i === 0 && <span className="absolute bottom-1 left-1 rounded-md bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-white">Cover</span>}
              </div>
            ))}
            {images.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-200 text-ink-400 transition-colors hover:border-brand-300 hover:text-brand-600 disabled:opacity-50"
              >
                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                <span className="text-xs font-medium">{uploading ? 'Uploading…' : 'Upload'}</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={e => void handleFiles(e.target.files)}
            />
          </div>
        </div>

        {/* Basic info */}
        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <h2 className="font-semibold text-ink-900">Basic information</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-ink-700">Product title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Premium Wireless Headphones" className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink-700">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Describe your product..." className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-ink-700">Category</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100">
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-ink-700">Brand</label>
                <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Soundwave" className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-ink-700">Tags</label>
              <input value={tags} onChange={e => setTags(e.target.value)} placeholder="wireless, bluetooth, noise-cancelling" className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              <p className="mt-1 text-xs text-ink-400">Comma-separated</p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <h2 className="font-semibold text-ink-900">Pricing & inventory</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-ink-700">Price ($)</label>
              <input value={price} onChange={e => setPrice(e.target.value)} type="number" min="0" step="0.01" placeholder="0.00" className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink-700">Compare-at price ($)</label>
              <input value={compareAt} onChange={e => setCompareAt(e.target.value)} type="number" min="0" step="0.01" placeholder="0.00" className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink-700">Stock quantity</label>
              <input value={stock} onChange={e => setStock(e.target.value)} type="number" min="0" placeholder="0" className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <h2 className="font-semibold text-ink-900">Variants</h2>
          <p className="text-sm text-ink-500">Add options like size or color (optional)</p>
          <div className="mt-4 space-y-3">
            {variants.map((v, i) => (
              <div key={i} className="grid gap-3 sm:grid-cols-2">
                <input
                  value={v.name}
                  onChange={e => setVariants(prev => prev.map((item, idx) => idx === i ? { ...item, name: e.target.value } : item))}
                  placeholder="Variant name (e.g. Size)"
                  className="rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
                <input
                  value={v.options}
                  onChange={e => setVariants(prev => prev.map((item, idx) => idx === i ? { ...item, options: e.target.value } : item))}
                  placeholder="Options (e.g. S, M, L)"
                  className="rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            ))}
            <button type="button" onClick={() => setVariants([...variants, { name: '', options: '' }])} className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700">
              <Plus className="h-4 w-4" /> Add variant
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/seller/products')} className="rounded-xl border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">Cancel</button>
          <button type="submit" disabled={saving || uploading} className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600 disabled:opacity-50">
            <Check className="h-4 w-4" /> {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Save as draft'}
          </button>
        </div>
      </form>
    </div>
  );
}
