import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

interface LogoProps {
  to?: string;
  variant?: 'default' | 'light';
  size?: 'sm' | 'md' | 'lg';
  /** When false, the mark is not a link (admin console). */
  link?: boolean;
}

export function Logo({ to = '/', variant = 'default', size = 'md', link = true }: LogoProps) {
  const sizes = {
    sm: { icon: 'h-7 w-7', text: 'text-lg' },
    md: { icon: 'h-9 w-9', text: 'text-xl' },
    lg: { icon: 'h-11 w-11', text: 'text-2xl' },
  };
  const s = sizes[size];
  const textColor = variant === 'light' ? 'text-white' : 'text-ink-900';

  const mark = (
    <>
      <div className={`flex ${s.icon} items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-brand`}>
        <ShoppingBag className="h-1/2 w-1/2" strokeWidth={2.5} />
      </div>
      <span className={`font-display font-extrabold tracking-tight ${s.text} ${textColor}`}>
        Shop<span className="text-brand-500">Hub</span>
      </span>
    </>
  );

  if (!link) {
    return <div className="flex items-center gap-2.5">{mark}</div>;
  }

  return (
    <Link to={to} className="flex items-center gap-2.5">
      {mark}
    </Link>
  );
}
