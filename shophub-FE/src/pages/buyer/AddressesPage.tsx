import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus, ChevronRight, Home, Check, Phone, Edit2, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/EmptyState';

type AddressDto = {
  id: string;
  label: string;
  name: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  default: boolean;
};

const BLANK = { label: 'Home', name: '', line1: '', city: '', state: '', zip: '', country: 'USA', phone: '', default: false };

export function AddressesPage() {
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<AddressDto | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const load = () => api<AddressDto[]>('/addresses')
    .then(data => setAddresses(data ?? []))
    .catch(err => setError(err instanceof Error ? err.message : 'Could not load addresses'))
    .finally(() => setLoading(false));

  useEffect(() => { void load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm(BLANK);
    setShowForm(true);
  };

  const openEdit = (a: AddressDto) => {
    setEditing(a);
    setForm({ label: a.label, name: a.name, line1: a.line1, city: a.city, state: a.state, zip: a.zip, country: a.country, phone: a.phone, default: a.default });
    setShowForm(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await api(`/addresses/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) });
        if (form.default && !editing.default) {
          await api(`/addresses/${editing.id}/default`, { method: 'POST' });
        }
      } else {
        const created = await api<AddressDto>('/addresses', { method: 'POST', body: JSON.stringify(form) });
        if (form.default) {
          await api(`/addresses/${created.id}/default`, { method: 'POST' });
        }
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save address');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await api(`/addresses/${id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete address');
    }
  };

  const makeDefault = async (id: string) => {
    try {
      await api(`/addresses/${id}/default`, { method: 'POST' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update address');
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1.5 text-sm text-ink-500">
        <Link to="/" className="flex items-center gap-1 hover:text-ink-900"><Home className="h-3.5 w-3.5" /> Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-ink-900">Addresses</span>
      </nav>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Saved addresses</h1>
          <p className="text-sm text-ink-500">{addresses.length} addresses saved</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
          <Plus className="h-4 w-4" /> Add address
        </button>
      </div>

      {error && <p className="mt-4 rounded-xl bg-error-50 px-3 py-2 text-sm text-error-600">{error}</p>}

      {!loading && addresses.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-ink-100 bg-white">
          <EmptyState icon={<MapPin className="h-7 w-7" />} title="No addresses yet" description="Add a shipping address to speed up checkout." action={{ label: 'Add address', onClick: openNew }} />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {addresses.map(a => (
            <div key={a.id} className={`rounded-2xl border-2 bg-white p-5 ${a.default ? 'border-brand-300' : 'border-ink-100'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-50 text-ink-600">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{a.label}</p>
                    {a.default && <span className="inline-flex items-center gap-1 text-xs text-brand-600"><Check className="h-3 w-3" /> Default</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(a)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-50 hover:text-ink-700"><Edit2 className="h-3.5 w-3.5" /></button>
                  <button onClick={() => void remove(a.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-error-50 hover:text-error-600"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <div className="mt-4 text-sm text-ink-600">
                <p className="font-medium text-ink-900">{a.name}</p>
                <p>{a.line1}</p>
                <p>{a.city}, {a.state} {a.zip}</p>
                <p>{a.country}</p>
                <p className="mt-1 flex items-center gap-1 text-ink-500"><Phone className="h-3.5 w-3.5" /> {a.phone}</p>
              </div>
              {!a.default && (
                <button onClick={() => void makeDefault(a.id)} className="mt-4 w-full rounded-xl border border-ink-200 py-2 text-xs font-medium text-ink-700 hover:bg-ink-50">Set as default</button>
              )}
            </div>
          ))}

          <button onClick={openNew} className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-200 text-ink-500 transition-colors hover:border-brand-300 hover:text-brand-600">
            <Plus className="h-8 w-8" />
            <span className="text-sm font-medium">Add new address</span>
          </button>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <form onSubmit={submit} className="relative z-10 w-full max-w-lg animate-scale-in rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink-900">{editing ? 'Edit address' : 'Add address'}</h2>
              <button type="button" onClick={() => setShowForm(false)}><X className="h-5 w-5 text-ink-500" /></button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-ink-600">Label</label>
                <input required value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-ink-600">Full name</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-ink-600">Address line</label>
                <input required value={form.line1} onChange={e => setForm(f => ({ ...f, line1: e.target.value }))} className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-600">City</label>
                <input required value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-600">State</label>
                <input required value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-600">ZIP</label>
                <input required value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-600">Country</label>
                <input required value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-ink-600">Phone</label>
                <input required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </div>
              <label className="flex items-center gap-2 text-sm text-ink-600 sm:col-span-2">
                <input type="checkbox" checked={form.default} onChange={e => setForm(f => ({ ...f, default: e.target.checked }))} className="h-4 w-4 rounded border-ink-300 text-brand-500" />
                Set as default address
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50">{saving ? 'Saving…' : 'Save address'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
