import { Outlet, Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { ShoppingBag, Shield, Store } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Left visual panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-ink-900 via-ink-800 to-brand-900 lg:flex lg:flex-col">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-10 h-80 w-80 rounded-full bg-accent-500/15 blur-3xl" />

        <div className="relative z-10 flex h-full flex-col p-12">
          <Logo variant="light" size="lg" />
          <div className="my-auto max-w-md">
            <h2 className="font-display text-3xl font-extrabold leading-tight text-white">
              The marketplace built for everyone.
            </h2>
            <p className="mt-4 text-lg text-white/70">
              Buy from thousands of sellers, grow your own store, or manage the platform — all in one place.
            </p>
            <div className="mt-10 space-y-4">
              {[
                { icon: ShoppingBag, title: 'Shop millions of products', desc: 'From electronics to handmade crafts' },
                { icon: Store, title: 'Start selling in minutes', desc: 'Reach buyers worldwide with your store' },
                { icon: Shield, title: 'Secure & trusted', desc: 'Buyer protection on every order' },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-4 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{f.title}</p>
                    <p className="text-sm text-white/60">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-white/40">© 2024 ShopHub — Marketplace for everyone</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo size="md" />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
