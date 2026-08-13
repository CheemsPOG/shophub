import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { formatCurrency, discountPercent } from '@/lib/format';
import type { Product } from '@/lib/data';
import { ProductImage } from '@/components/ProductImage';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const discount = discountPercent(product.price, product.compareAt);
  const outOfStock = product.stock === 0;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-ink-200 hover:shadow-lift"
    >
      <div className="relative aspect-square overflow-hidden bg-ink-50">
        <ProductImage
          src={product.images?.[0]}
          alt={product.title}
          className={`h-full w-full ${outOfStock ? 'opacity-60' : ''}`}
        />
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            -{discount}%
          </span>
        )}
        {outOfStock && (
          <span className="absolute right-3 top-3 rounded-full bg-ink-900/80 px-2.5 py-1 text-xs font-semibold text-white">
            Sold out
          </span>
        )}
        {!outOfStock && product.stock <= 10 && (
          <span className="absolute right-3 top-3 rounded-full bg-warning-500 px-2.5 py-1 text-xs font-semibold text-white">
            Only {product.stock} left
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
          <span className="text-xs font-semibold text-ink-700">{product.rating}</span>
          <span className="text-xs text-ink-400">({product.reviews})</span>
        </div>

        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-ink-900 group-hover:text-brand-600">
          {product.title}
        </h3>

        <p className="text-xs text-ink-400">{product.brand}</p>

        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-lg font-bold text-ink-900">{formatCurrency(product.price, { decimals: true })}</span>
          {product.compareAt && (
            <span className="text-sm text-ink-400 line-through">{formatCurrency(product.compareAt, { decimals: true })}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
