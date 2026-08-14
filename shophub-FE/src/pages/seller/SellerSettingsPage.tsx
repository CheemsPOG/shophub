import { useEffect, useRef, useState } from 'react';
import { MapPin, Mail, Phone, Edit2, Save, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { ProductImage } from '@/components/ProductImage';
import { Avatar } from '@/components/Avatar';
import { api, ApiError } from '@/lib/api';
import { useSellerShop, type SellerShopDto } from '@/lib/sellerShop';

type ShopDto = SellerShopDto;

const EMPTY: ShopDto = {
  businessName: '',
  logo: '',
  banner: '',
  tagline: '',
  description: '',
  email: '',
  phone: '',
  address: '',
  rating: 0,
  totalSales: 0,
  productCount: 0,
  joinedAt: null,
  status: '',
};

export function SellerSettingsPage() {
  const { setShop: setSharedShop } = useSellerShop();
  const [shop, setShop] = useState<ShopDto>(EMPTY);
  const [form, setForm] = useState({
    businessName: '',
    tagline: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    logo: '',
    banner: '',
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'logo' | 'banner' | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const applyShop = (data: ShopDto) => {
    const normalized = {
      ...data,
      logo: data.logo ?? '',
      banner: data.banner ?? '',
      rating: Number(data.rating ?? 0),
      totalSales: Number(data.totalSales ?? 0),
      productCount: Number(data.productCount ?? 0),
    };
    setShop(normalized);
    setSharedShop(normalized);
    setForm({
      businessName: normalized.businessName ?? '',
      tagline: normalized.tagline ?? '',
      description: normalized.description ?? '',
      email: normalized.email ?? '',
      phone: normalized.phone ?? '',
      address: normalized.address ?? '',
      logo: normalized.logo ?? '',
      banner: normalized.banner ?? '',
    });
  };

  useEffect(() => {
    api<ShopDto>('/seller/shop')
      .then(data => applyShop(data))
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load store profile'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadImage = async (file: File, kind: 'logo' | 'banner') => {
    setError('');
    setUploading(kind);
    try {
      const body = new FormData();
      body.append('file', file);
      const { url } = await api<{ url: string }>('/seller/media', { method: 'POST', body });
      const nextForm = { ...form, [kind]: url };
      setForm(nextForm);
      // Persist logo/banner immediately so sidebar + header avatars update without an extra Save click
      const data = await api<ShopDto>('/seller/shop', {
        method: 'PUT',
        body: JSON.stringify({
          businessName: (nextForm.businessName || shop.businessName || 'Store').trim(),
          tagline: nextForm.tagline.trim(),
          description: nextForm.description.trim(),
          email: nextForm.email.trim(),
          phone: nextForm.phone.trim(),
          address: nextForm.address.trim(),
          logo: nextForm.logo,
          banner: nextForm.banner,
        }),
      });
      applyShop(data);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not upload image');
    } finally {
      setUploading(null);
    }
  };

  const save = async () => {
    if (!form.businessName.trim()) {
      setError('Store name is required');
      return;
    }
    setError('');
    setSaved(false);
    setSaving(true);
    try {
      const data = await api<ShopDto>('/seller/shop', {
        method: 'PUT',
        body: JSON.stringify({
          businessName: form.businessName.trim(),
          tagline: form.tagline.trim(),
          description: form.description.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          logo: form.logo,
          banner: form.banner,
        }),
      });
      applyShop(data);
      setEditing(false);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save store profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-sm text-ink-500">Loading store profile…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Settings</h1>
        <p className="text-sm text-ink-500">Edit your store profile, banner, and logo. Changes go live immediately.</p>
      </div>

      {error && <p className="rounded-xl bg-error-50 px-3 py-2 text-sm text-error-600">{error}</p>}
      {saved && !error && <p className="rounded-xl bg-success-50 px-3 py-2 text-sm text-success-700">Store profile saved.</p>}

      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
        <div className="relative h-32 sm:h-40">
          <ProductImage src={form.banner} className="h-full w-full" />
          <button
            type="button"
            onClick={() => bannerInputRef.current?.click()}
            disabled={uploading === 'banner'}
            className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-ink-700 backdrop-blur hover:bg-white disabled:opacity-50"
          >
            {uploading === 'banner' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Edit2 className="h-3.5 w-3.5" />}
            {uploading === 'banner' ? 'Uploading…' : 'Change banner'}
          </button>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) void uploadImage(file, 'banner');
              e.target.value = '';
            }}
          />
        </div>
        <div className="px-5 pb-5">
          <div className="flex flex-wrap items-end justify-between gap-4 -mt-8">
            <div className="flex items-end gap-4">
              <div className="relative">
                <Avatar src={form.logo} className="h-20 w-20 rounded-2xl border-4 border-white" />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploading === 'logo'}
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-ink-900 text-white shadow hover:bg-ink-700 disabled:opacity-50"
                  title="Change logo"
                >
                  {uploading === 'logo' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Edit2 className="h-3.5 w-3.5" />}
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) void uploadImage(file, 'logo');
                    e.target.value = '';
                  }}
                />
              </div>
              <div className="pb-1">
                <h2 className="font-display text-xl font-bold text-ink-900">{form.businessName || 'Your store'}</h2>
                <p className="text-sm text-ink-500">{form.tagline || 'Add a tagline'}</p>
              </div>
            </div>
            {editing ? (
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving || Boolean(uploading)}
                className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving…' : 'Save'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setEditing(true); setSaved(false); }}
                className="flex items-center gap-2 rounded-xl border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
              >
                <Edit2 className="h-4 w-4" /> Edit profile
              </button>
            )}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-ink-50 p-3 text-center">
              <p className="text-lg font-bold text-ink-900">{Number(shop.totalSales).toLocaleString()}</p>
              <p className="text-xs text-ink-500">Total sales</p>
            </div>
            <div className="rounded-xl bg-ink-50 p-3 text-center">
              <p className="text-lg font-bold text-ink-900">{Number(shop.rating).toFixed(1)} ★</p>
              <p className="text-xs text-ink-500">Rating</p>
            </div>
            <div className="rounded-xl bg-ink-50 p-3 text-center">
              <p className="text-lg font-bold text-ink-900">{shop.productCount}</p>
              <p className="text-xs text-ink-500">Products</p>
            </div>
          </div>
          {shop.joinedAt && (
            <p className="mt-3 text-xs text-ink-400">Joined {formatDate(shop.joinedAt)}</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-5">
        <h3 className="font-semibold text-ink-900">Store details</h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-ink-700">Store name</label>
            <input
              value={form.businessName}
              onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
              disabled={!editing}
              className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:bg-ink-50 disabled:text-ink-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700">Tagline</label>
            <input
              value={form.tagline}
              onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
              disabled={!editing}
              className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:bg-ink-50 disabled:text-ink-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              disabled={!editing}
              className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:bg-ink-50 disabled:text-ink-500"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-ink-700">Email</label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  disabled={!editing}
                  className="w-full rounded-xl border border-ink-200 pl-10 pr-4 py-2.5 text-sm disabled:bg-ink-50 disabled:text-ink-500"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-ink-700">Phone</label>
              <div className="relative mt-1.5">
                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  disabled={!editing}
                  className="w-full rounded-xl border border-ink-200 pl-10 pr-4 py-2.5 text-sm disabled:bg-ink-50 disabled:text-ink-500"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700">Business address</label>
            <div className="relative mt-1.5">
              <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                disabled={!editing}
                className="w-full rounded-xl border border-ink-200 pl-10 pr-4 py-2.5 text-sm disabled:bg-ink-50 disabled:text-ink-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
