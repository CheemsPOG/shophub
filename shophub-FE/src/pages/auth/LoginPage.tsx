import { FormEvent, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldCheck, ShoppingBag, Store } from 'lucide-react';
import { useAuth } from '@/lib/auth';

type AccountRole = 'buyer' | 'seller' | 'admin';

const accountTypes: Array<{ role: AccountRole; label: string; description: string; icon: typeof ShoppingBag; destination: string; tone: string }> = [
  { role: 'buyer', label: 'Buyer account', description: 'Shop products, manage orders, and save favorites.', icon: ShoppingBag, destination: '/login/buyer', tone: 'bg-brand-50 text-brand-600' },
  { role: 'seller', label: 'Seller account', description: 'Manage your store, products, orders, and payouts.', icon: Store, destination: '/login/seller', tone: 'bg-blue-50 text-blue-600' },
  { role: 'admin', label: 'Admin account', description: 'Oversee the marketplace, sellers, users, and disputes.', icon: ShieldCheck, destination: '/login/admin', tone: 'bg-ink-100 text-ink-700' },
];

const roleCopy: Record<AccountRole, { title: string; description: string; email: string; action: string }> = {
  buyer: { title: 'Buyer sign in', description: 'Access your orders, wishlist, and ShopHub account.', email: 'alex@shophub.com', action: 'Enter ShopHub' },
  seller: { title: 'Seller sign in', description: 'Open your store dashboard and keep business moving.', email: 'seller@shophub.com', action: 'Open seller dashboard' },
  admin: { title: 'Admin sign in', description: 'Access the secure marketplace operations console.', email: 'admin@shophub.com', action: 'Open admin console' },
};

export function LoginPage() {
  const { role: routeRole } = useParams<{ role?: string }>();
  const role = routeRole === 'seller' || routeRole === 'admin' ? routeRole : routeRole === 'buyer' ? 'buyer' : undefined;

  if (!role) {
    return (
      <div className="animate-slide-up">
        <h1 className="font-display text-2xl font-bold text-ink-900">Choose your account</h1>
        <p className="mt-1.5 text-sm text-ink-500">Sign in through the workspace that matches how you use ShopHub.</p>
        <div className="mt-7 space-y-3">
          {accountTypes.map(account => (
            <Link key={account.role} to={account.destination} className="group flex items-center gap-4 rounded-2xl border border-ink-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${account.tone}`}>
                <account.icon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink-900">{account.label}</p>
                <p className="mt-1 text-sm leading-5 text-ink-500">{account.description}</p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-ink-400 transition-transform group-hover:translate-x-1 group-hover:text-brand-600" />
            </Link>
          ))}
        </div>
        <p className="mt-7 text-center text-sm text-ink-500">New to ShopHub? <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">Create a buyer or seller account</Link></p>
      </div>
    );
  }

  return <RoleLogin role={role} />;
}

function RoleLogin({ role }: { role: AccountRole }) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const copy = roleCopy[role];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const form = event.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const rememberMe = (form.elements.namedItem('rememberMe') as HTMLInputElement).checked;
    try {
      await login(email, password, role, rememberMe);
      const next = searchParams.get('next');
      const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null;
      if (role === 'buyer' && safeNext) {
        navigate(safeNext);
      } else {
        navigate(role === 'buyer' ? '/' : `/${role}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    }
  };

  return (
    <div className="animate-slide-up">
      <Link to="/login" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800"><ArrowLeft className="h-4 w-4" /> All account types</Link>
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${role === 'buyer' ? 'bg-brand-50 text-brand-600' : role === 'seller' ? 'bg-blue-50 text-blue-600' : 'bg-ink-100 text-ink-700'}`}>
          {role === 'buyer' ? <ShoppingBag className="h-5 w-5" /> : role === 'seller' ? <Store className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
        </div>
        <div><h1 className="font-display text-2xl font-bold text-ink-900">{copy.title}</h1><p className="mt-1 text-sm text-ink-500">{copy.description}</p></div>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        {error && <p className="rounded-xl bg-error-50 px-3 py-2 text-sm text-error-600">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-ink-700">Email address</label>
          <div className="relative mt-1.5"><Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" /><input name="email" type="email" required defaultValue={copy.email} placeholder="you@example.com" className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink-900 transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-100" /></div>
        </div>
        <div>
          <div className="flex items-center justify-between"><label className="block text-sm font-medium text-ink-700">Password</label><Link to="/forgot-password" className="text-xs font-medium text-brand-600 hover:text-brand-700">Forgot password?</Link></div>
          <div className="relative mt-1.5"><Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" /><input name="password" type={showPassword ? 'text' : 'password'} required defaultValue="demo1234" placeholder="Enter your password" className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-10 text-sm text-ink-900 transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-100" /><button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-600"><input name="rememberMe" type="checkbox" className="h-4 w-4 rounded border-ink-300 text-brand-500 focus:ring-brand-400" /> Keep me signed in</label>
        <button type="submit" className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-brand transition-all hover:bg-brand-600 active:scale-[0.98]">{copy.action}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></button>
      </form>
      {role !== 'admin' && <p className="mt-6 text-center text-sm text-ink-500">Need an account? <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">Create one</Link></p>}
    </div>
  );
}
