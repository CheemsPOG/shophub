import { FormEvent, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Lock, Mail, ShoppingBag, Store, User } from 'lucide-react';
import { useAuth } from '@/lib/auth';

type AccountRole = 'buyer' | 'seller';

const accountTypes: Array<{ role: AccountRole; label: string; description: string; icon: typeof ShoppingBag; destination: string }> = [
  { role: 'buyer', label: 'Buyer account', description: 'Shop products, track orders, and save your favorites.', icon: ShoppingBag, destination: '/register/buyer' },
  { role: 'seller', label: 'Seller account', description: 'List products, manage orders, and grow your business.', icon: Store, destination: '/register/seller' },
];

const roleCopy: Record<AccountRole, { title: string; description: string; action: string }> = {
  buyer: { title: 'Create buyer account', description: 'Join ShopHub and start shopping in minutes.', action: 'Create buyer account' },
  seller: { title: 'Open your store', description: 'Register as a seller and reach buyers worldwide.', action: 'Create seller account' },
};

export function RegisterPage() {
  const { role: routeRole } = useParams<{ role?: string }>();
  const role: AccountRole | undefined = routeRole === 'seller' || routeRole === 'buyer' ? routeRole : undefined;

  if (!role) {
    return (
      <div className="animate-slide-up">
        <h1 className="font-display text-2xl font-bold text-ink-900">Choose your account</h1>
        <p className="mt-1.5 text-sm text-ink-500">Select the type of account you want to create.</p>
        <div className="mt-7 space-y-3">
          {accountTypes.map(account => (
            <Link key={account.role} to={account.destination} className="group flex items-center gap-4 rounded-2xl border border-ink-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><account.icon className="h-6 w-6" /></div>
              <div className="min-w-0 flex-1"><p className="font-semibold text-ink-900">{account.label}</p><p className="mt-1 text-sm leading-5 text-ink-500">{account.description}</p></div>
              <ArrowRight className="h-5 w-5 shrink-0 text-ink-400 transition-transform group-hover:translate-x-1 group-hover:text-brand-600" />
            </Link>
          ))}
        </div>
        <p className="mt-7 text-center text-sm text-ink-500">Already have an account? <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Sign in</Link></p>
      </div>
    );
  }

  return <RoleRegister role={role} />;
}

function RoleRegister({ role }: { role: AccountRole }) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();
  const copy = roleCopy[role];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const form = event.currentTarget;
    const fullName = (form.elements.namedItem('fullName') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const storeName = (form.elements.namedItem('storeName') as HTMLInputElement | null)?.value;
    try {
      await register({ fullName, email, password, role, storeName });
      navigate(role === 'buyer' ? '/' : '/seller');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <div className="animate-slide-up">
      <Link to="/register" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800"><ArrowLeft className="h-4 w-4" /> All account types</Link>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">{role === 'buyer' ? <ShoppingBag className="h-5 w-5" /> : <Store className="h-5 w-5" />}</div>
        <div><h1 className="font-display text-2xl font-bold text-ink-900">{copy.title}</h1><p className="mt-1 text-sm text-ink-500">{copy.description}</p></div>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        {error && <p className="rounded-xl bg-error-50 px-3 py-2 text-sm text-error-600">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-ink-700">Full name</label>
          <div className="relative mt-1.5"><User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" /><input name="fullName" required type="text" placeholder="Jane Doe" className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-100" /></div>
        </div>
        {role === 'seller' && (
          <div>
            <label className="block text-sm font-medium text-ink-700">Store name</label>
            <div className="relative mt-1.5"><Store className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" /><input name="storeName" required type="text" placeholder="My Awesome Store" className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-100" /></div>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-ink-700">Email address</label>
          <div className="relative mt-1.5"><Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" /><input name="email" required type="email" placeholder="you@example.com" className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-100" /></div>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700">Password</label>
          <div className="relative mt-1.5"><Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" /><input name="password" required type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-10 text-sm transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-100" /><button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">{['8+ characters', 'Uppercase letter', 'One number'].map(rule => (<span key={rule} className="flex items-center gap-1 text-xs text-ink-400"><Check className="h-3 w-3 text-success-500" />{rule}</span>))}</div>
        </div>
        <label className="flex items-start gap-2 text-sm text-ink-600"><input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-500 focus:ring-brand-400" />I agree to the <Link to="/" className="font-medium text-brand-600">Terms</Link> and <Link to="/" className="font-medium text-brand-600">Privacy Policy</Link></label>
        <button type="submit" className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-brand transition-all hover:bg-brand-600 active:scale-[0.98]">{copy.action}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">Already have an account? <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Sign in</Link></p>
    </div>
  );
}
