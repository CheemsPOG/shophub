import { Star } from 'lucide-react';

interface StarsProps {
  rating: number;
  size?: number;
  showValue?: boolean;
  reviews?: number;
}

export function Stars({ rating, size = 16, showValue = false, reviews }: StarsProps) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = Math.max(0, Math.min(1, rating - i));
          return (
            <div key={i} className="relative" style={{ width: size, height: size }}>
              <Star className="absolute inset-0 text-ink-200" style={{ width: size, height: size }} />
              <div className="absolute inset-0 overflow-hidden" style={{ width: size * fill }}>
                <Star className="fill-accent-400 text-accent-400" style={{ width: size, height: size }} />
              </div>
            </div>
          );
        })}
      </div>
      {showValue && <span className="text-sm font-semibold text-ink-700">{rating.toFixed(1)}</span>}
      {reviews !== undefined && <span className="text-xs text-ink-400">({reviews})</span>}
    </div>
  );
}
