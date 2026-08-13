import { User } from 'lucide-react';
import { isRealImageUrl } from '@/lib/image';

export function Avatar({
  src,
  alt = '',
  className = '',
}: {
  src?: string | null;
  alt?: string;
  className?: string;
}) {
  if (isRealImageUrl(src)) {
    return <img src={src} alt={alt} className={`object-cover ${className}`} />;
  }

  return (
    <div className={`relative overflow-hidden bg-ink-100 ${className}`} aria-hidden>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
      <div className="relative flex h-full w-full items-center justify-center">
        <User className="h-[55%] w-[55%] text-ink-300" strokeWidth={1.5} />
      </div>
    </div>
  );
}
