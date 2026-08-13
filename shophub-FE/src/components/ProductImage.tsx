import { ImageIcon } from 'lucide-react';
import { isRealImageUrl } from '@/lib/image';

export const isProductImageUrl = isRealImageUrl;

export function ProductImage({
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
        <ImageIcon className="h-[28%] w-[28%] max-h-10 max-w-10 min-h-3.5 min-w-3.5 text-ink-300" strokeWidth={1.5} />
      </div>
    </div>
  );
}
